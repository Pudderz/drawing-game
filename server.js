var app = require('express')();
var http = require('http').createServer(app);
var io = require('socket.io')(http);

app.get('/', (req, res) => {
  res.sendFile(__dirname + '/public/index.html');
});

io.on('connection', (socket) => {
  console.log('a user connected');
  console.log(`User id: ${socket.id}`);
  
  let newDetails =(data) =>{
    socket.broadcast.emit('mouse', data);
    console.log(data);
  }
  socket.on('mouse', (data)=>{  
    newDetails(data);

  });
  

});

http.listen(3000, () => {
  console.log('listening on *:3000');
});

io.on('disconnect', (socket) => {
    console.log('a user disconnected');
    console.log(`User id: ${socket.id}`);
  });

