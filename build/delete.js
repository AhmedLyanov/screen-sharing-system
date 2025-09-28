const Service = require('node-windows').Service;

const svc = new Service({
  name: "MisterSharing",
  description: "description for programm",
  script: "C:/screen-sharing-system/client/index.js" 
});

svc.on('uninstall', () => {
  console.log('Service deleted');
});

svc.uninstall();
