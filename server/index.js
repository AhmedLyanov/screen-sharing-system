const express = require('express');
const http = require('http');
const { Server } = require('socket.io');
const path = require('path');
const authorization = require("express-basic-auth")

const app = express();
const server = http.createServer(app);
const io = new Server(server, {
  cors: { origin: '*' } 
});


app.use('/index.html', authorization({
  users: {'Amhadovam':"Xuh40150"},
  challenge: true
}))
app.use(express.static(path.join(__dirname, 'public')));

io.on('connection', socket => {
  const { role, room, id } = socket.handshake.query;
  if (!room || !role) { socket.disconnect(true); return; }
  socket.join(room);
  console.log(`${role} connected: ${id} -> ${room}`);

  if (role === 'student') {
    socket.on('frame-binary', (data) => {
      
      
      socket.to(room).emit('student-frame-binary', { id, frame: data });
    });
  }

  socket.on('disconnect', () => {
    socket.to(room).emit('student-disconnected', { id });
    console.log(`disconnected: ${id}`);
  });
});

const PORT = process.env.PORT || 5000;
server.listen(PORT, ()=>console.log(`Server listening ${PORT}`));
