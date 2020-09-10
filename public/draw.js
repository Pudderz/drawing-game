const colourPicker = document.querySelector('#colourPicker');
const sizePicker = document.querySelector('#sizePicker');
const canvasColourSelector = document.querySelector('#canvasColourSelector');
const canvas = document.querySelector('#canvas');
var socket =io.connect('http://localhost:3000');
let id = "guest";
let usersLastDrawingInfo ={};
let lastPoint = [];
let lineWidth = 10;
drawingColor="black";
let context = null;

const sendImage=(e, endLine = false, startLine = false)=>{
    console.log('sending');
    socket.emit('drawLine',{
        clientX: e.clientX,
        clientY: e.clientY,
        lastX: lastPoint[0],
        lastY: lastPoint[1],
        width: lineWidth,
        color: drawingColor,
        id: id,
    });
}

window.addEventListener('load', ()=>{
    console.log('ready')
    context = canvas.getContext('2d');
    canvas.height = 800;
    canvas.width = 800;
    context.lineCap = "round"; 

})
let painting = false;

const startLine= event =>{
    //sets lastPoint to current point 
    lastPoint = [event.clientX, event.clientY];
    painting = true;
    console.log('mousedown');
    context.beginPath();
    draw(event);
    
}
const endLine = e =>{
    // this if statement is used so it doesnt send information to the server when picking colours from the canvas
    if(painting == false) return; 
    painting = false;
    context.beginPath();
    console.log('mouseup');
    sendImage(e);
    
}
const draw = e =>{
    if(!painting) return;
    context.moveTo(lastPoint[0], lastPoint[1]);
    context.strokeStyle = drawingColor;
    context.lineWidth = lineWidth;
    context.lineCap = "round";
    context.lineTo(e.clientX, e.clientY);
    context.stroke();
    sendImage(e);
    lastPoint = [e.clientX, e.clientY];
}

const newCanvasData = data => {
    console.log(`user ${data.id} is drawing`)
    context.beginPath();
    context.moveTo(data.lastX, data.lastY);// moves to last users point when drawing
    context.lineTo(data.clientX, data.clientY); // moves to current users point when drawing
    context.strokeStyle = data.color;
    context.lineWidth = data.width;
    context.stroke();
}        

socket.on('drawLine', data => newCanvasData(data));

socket.on('userId', userId => {
    id = userId;
    console.log(`Your id is user: ${id}`);
});

    
    canvas.addEventListener('mousedown', startLine)
    canvas.addEventListener('mouseup', endLine)
    canvas.addEventListener('mousemove', draw)



