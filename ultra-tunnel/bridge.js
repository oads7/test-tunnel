const net = require('net');

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
    connectToTunnel();
    const backendSocket = new net.Socket;

    backendSocket.on('data', response => {
      currentSocket.write(response);
      currentSocket.destroy();
      sockets.splice(currentSocketOffset, 1);
    })
    backendSocket.connect(settings.backendPort, settings.backendUrl, () => {
      backendSocket.write(data);
    });
  });

  /*
  const urlParam = settings.url.endsWith('/')
    ? settings.url + settings.middlePoint
    : `${settings.url}/${settings.middlePoint}`;
    */
  currentSocket.connect(settings.port, settings.url, () => {
    currentSocket.write(httpRequestToEngage())
    console.log('Connected to the tunnel');
  })
}

httpRequestToEngage = () => {
  return 'GET /' + settings.middlePoint + ' HTTP/1.1\r\n\r\n';
}
