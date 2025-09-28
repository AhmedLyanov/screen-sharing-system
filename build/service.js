const Service = require('node-windows').Service;


const svc = new Service({
  name: "CollegeScreenAgent",
  description: "Агент для захвата экрана и стриминга на сервер",
  script: "C:/screen-sharing-system/client/index.js",
  logpath: "C:/screen-sharing-system/logs"
});

svc.on('install', () => {
  svc.start();
});

svc.install();
