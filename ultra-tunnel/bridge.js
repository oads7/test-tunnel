const net = require('net');
const httpParse = require('./helpers/httpParse');

let sockets = [];
settings = {};

module.exports = {
  setup: (config) => settings = config,
  connect: () => connectToTunnel(),
}

connectToTunnel = () => {
  sockets.push(new net.Socket)
  const currentSocketOffset = sockets.length - 1;
  const currentSocket = sockets[currentSocketOffset];

  currentSocket.on('data', data => {
    const httpInfo = httpParse(data);
    if (httpInfo.statusCode >= 300 && httpInfo.statusCode < 400) {
      console.log('Moving: \n', data.toString())
      //const newRequest = httpRequestToEngage(httpInfo.headers.Location, settings.url);
      //console.log('New Request: \n', newRequest)
      //currentSocket.write(newRequest);
      //currentSocket.destroy();

      /*
      const newUrl = new URL(httpInfo.headers.Location);
      const { hostname, pathname } = newUrl;

      const newClient = new net.Socket();
      newClient.connect(80, hostname, () => {
        const newRequest = `GET ${pathname} HTTP/1.1\r\nHost: ${hostname}\r\n\r\n`;
        newClient.write(newRequest);
        console.log('New Request: \n', newRequest)
      });

      newClient.on('data', newData => {
        console.log('New DATA: \n', newData.toString());
        // Handle the response from the new location here
      });
      */
    } else {
      console.log('Other: \n', data.toString())
      //connectToTunnel();
      const backendSocket = new net.Socket;

      backendSocket.on('data', response => {
        currentSocket.write(response);
        currentSocket.destroy();
        sockets.splice(currentSocketOffset, 1);
      })
      backendSocket.connect(settings.backendPort, settings.backendUrl, () => {
        backendSocket.write(data);
      });
    }
  });

  currentSocket.connect(settings.port, settings.url, () => {
    const request = httpRequestToEngage(`/${settings.middlePoint}`, settings.url);
    console.log(request)
    currentSocket.write(request);
    //console.log('Connected to the tunnel');
  })
}

httpRequestToEngage = (url, host) => {
  return  'GET ' + url + ' HTTP/1.1\r\n' +
          'Host: ' + host + '\r\n' +
          //'Access-Control-Allow-Origin: *\r\n' +
          'Connection: Keep-Alive\r\n' +
          'Keep-Alive: 1000000\r\n' +
          //'Content-Type: text/html\r\n' +
          'Accept: */*\r\n' +
          'Accept-Encoding: gzip, deflate, br\r\n' +
          'Accept-Language: es\r\n' +
          'Referer: ' + host + '\r\n' +
          //'Cache-Control: no-cache\r\n' +
          //'Pragma: no-cache\r\n' +
          'User-Agent: Mozilla/5.0\r\n' +
          'Authority: ' + host + '\r\n' +
          'Method: GET\r\n' +
          'Path: ' + url //+ '\r\n' +
          //'upgrade-insecure-requests: 1\r\n' +
          //'Scheme: https\r\n' +
          //'\r\n';
}
