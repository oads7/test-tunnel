const net = require('net');
const https = require('https');
const httpParse = require('./helpers/httpParse');
const randomString = require('./helpers/randomString');

const tunnelServer = net.createServer();
const bridgeSocketIdLength = 8;
let bridgeSockets = [];

let settings = {};

module.exports = {
  setup: (config) => settings = config,
  listen: () => tunnelListener(),
}

tunnelListener = () => {
  if (!('port' in settings)) {
    console.log('<ultra-tunnel: error> invalid port');
    return;
  }
  if (!('middlePoints' in settings)) {
    console.log('<ultra-tunnel: error> invalid middle-points');
    return;
  }

  tunnelServer.listen(settings.port);

  tunnelServer.on('listening', () => {
    const { port, family, address } = tunnelServer.address();
    console.log(`<ultra-tunnel: listening> on ${address}:${port} (${family})`);
  });

  tunnelServer.on('connection', socket => {
    let buffer = Buffer.from([]);

    socket.on('data', chunk => {
      buffer = Buffer.concat([buffer, chunk]);
    });

    socket.on('end', () => {
      console.log(https.parseHeader(buffer));
      return;

      let httpInfo = httpParse(buffer);
      if (!httpInfo.httpVersion) {
        console.log(https.parseHeader(buffer));
      }

      console.log(httpInfo);
      console.log(buffer.toString());
      console.log('---------------------------');
      if (!httpInfo.url) return;

      if (httpInfo.url.endsWith('/'))
        httpInfo.url = httpInfo.url.slice(0, -1);

      urlParams = httpInfo.url.split('/')
      const bridge = urlParams[1];
      if (urlParams.length > 2) {
        // FrontEnd Request
        for (let i = 0; i < bridgeSockets.length; i++) {
          const bridgeSocket = bridgeSockets[i];
          if (bridgeSocket.bridge === bridge && !bridgeSocket.busy) {
            const payload = removeFromBuffer(buffer, bridge + '/');

            bridgeSocket.busy = true;
            bridgeSocket.socket.on('data', response => {
              socket.write(response);
              socket.destroy();

              bridgeSocket.socket.destroy();
              bridgeSockets.splice(i, 1);
            })
            bridgeSocket.socket.write(payload);
          }
        }
      } else {
        // BackEnd Engage
        if (settings.middlePoints.includes(bridge)) {
          bridgeSockets.push({
            bridgeId: randomString(bridgeSocketIdLength),
            bridge,
            busy: false,
            socket,
          });
        } else {
          socket.write(getMessageResponse(400, 'BAD_REQUEST', bridgeNotExist));
          socket.destroy();
        }
      }
    })

  })
}

removeFromBuffer = (buffer, param) => {
  const index = buffer.indexOf(param);
  if (index !== -1) {
    return Buffer.concat([
      buffer.slice(0, index),
      buffer.slice(index + param.length)
    ]);
  } else {
    return buffer;
  }
}

getMessageResponse = (statusCode, statusMessage, message) => {
  return  'HTTP/1.1 ' + statusCode + ' ' + statusMessage + '\r\n' +
          'Access-Control-Allow-Origin: *\r\n' +
          'Connection: Keep-Alive\r\n' +
          'Content-Type: text/html\r\n' +
          '\r\n' +
          message;
}

const bridgeNotExist = 'The bridge name is not registered, this request will be ignored.';
