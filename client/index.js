const { spawn } = require('child_process');
const ffmpegPath = require('ffmpeg-static'); 
const io = require('socket.io-client');
const os = require('os');

const SERVER = 'http://localhost:5000'
const ROOM = 'auditorium-101';
const ID = os.hostname();
const FPS = parseInt('30', 10); 
const WIDTH ='1280';

const socket = io(SERVER, {
  query: { role: 'student', room: ROOM, id: ID },
  transports: ['websocket'],
  reconnection: true,
});

socket.on('connect', () => console.log('connected to server:', SERVER));
socket.on('disconnect', () => console.log('disconnected'));


const args = [
  '-f', 'gdigrab',
  '-framerate', String(FPS),
  '-i', 'desktop',
  '-vf', `scale=${WIDTH}:-1`,
  '-q:v', '5',        
  '-f', 'mjpeg',      
  'pipe:1'
];

console.log('Spawning ffmpeg:', ffmpegPath, args.join(' '));
const ff = spawn(ffmpegPath, args, { stdio: ['ignore', 'pipe', 'pipe'] });

ff.stderr.on('data', d => {
  
  
});

let buffer = Buffer.alloc(0);


ff.stdout.on('data', chunk => {
  buffer = Buffer.concat([buffer, chunk]);
  
  while (true) {
    const soi = buffer.indexOf(Buffer.from([0xff, 0xd8]));
    const eoi = buffer.indexOf(Buffer.from([0xff, 0xd9]), soi >= 0 ? soi : 0);
    if (soi >= 0 && eoi > soi) {
      const jpeg = buffer.slice(soi, eoi + 2); 
      
      if (socket.connected) {
        socket.emit('frame-binary', jpeg);
      }
      
      buffer = buffer.slice(eoi + 2);
      continue;
    }
    break;
  }
});

ff.on('exit', (code, sig) => {
  console.error('ffmpeg exited', code, sig);
});
