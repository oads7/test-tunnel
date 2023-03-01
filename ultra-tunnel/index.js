const tunnel = require('./tunnel');
const bridge = require('./bridge');

module.exports = {
  tunnel: {
    setup: (config) => tunnel.setup(config),
    listen: () => tunnel.listen(),
  },
  bridge: {
    setup: (config) => bridge.setup(config),
    connect: () => bridge.connect(),
  },
};
