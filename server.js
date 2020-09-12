var app = require('express')();
var http = require('http').createServer(app);
var io = require('socket.io')(http);
let i = 0;

app.get('/', (req, res) => {
  res.sendFile(__dirname + '/public/index.html');
});

io.on('connection', (socket) => {
  
  console.log('a user connected');
  console.log(`User id: ${socket.id}`);
  i +=1
  socket.emit('userId', i);

  
  // socket.on('drawLine', (data)=>{  
  //   socket.broadcast.emit('drawLine', data);
  // });
  socket.on('startedDrawing', data => {
    socket.on(`user${data.id}DrawingData`, info => {
      socket.broadcast.emit(`user${data.id}DrawingData`, info);
    });  
    //removes listeners when end line so socket listeners are not stacking up
    socket.on(`user${data.id}EndDrawingData`, ()=>{
      socket.removeAllListeners(`user${data.id}DrawingData`);
      socket.removeAllListeners(`user${data.id}EndDrawingData`);
    })
    socket.broadcast.emit('startedDrawing', data)
  })
});

http.listen(3000, () => {
  console.log('listening on *:3000');
});

io.on('disconnect', socket => {
    console.log('a user disconnected');
    console.log(`User id: ${socket.id}`);
  });

