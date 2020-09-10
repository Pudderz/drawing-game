const canvas = document.querySelector('#canvas');
var socket =io.connect('http://localhost:3000');
let id = "guest";
let usersDrawingInfo = {};
let lastPoint = [];
let lastSentPoint = [];
let lineWidth = 10;
drawingColor="black";
let context = null;
let painting = false;


const sendImage= (e, lastPosition) => {
    console.log('sending');
    socket.emit('drawLine',{
        clientX: e.clientX,
        clientY: e.clientY,
        lastX: lastPosition[0],
        lastY: lastPosition[1],
        width: lineWidth,
        color: drawingColor,
        id: id,
    });
}
/*
Creating a reusable function named limiter that will limit the number of times a callback function
is fired so that the mousemove event will not get fired so often. I got this idea from
this blog: https://programmingwithmosh.com/javascript/javascript-throttle-and-debounce-patterns/
*/
let enableSendCall=true;
function limiter(callback, time){
    let enableCall = true;
    return function(...args){
        if(!enableCall) return // if false
        enableCall = false;
        callback.apply(this, args)
        setTimeout(() => enableCall=true, time)
    }
}

window.addEventListener('load', () => {
    console.log('ready');
    context = canvas.getContext('2d');
    canvas.height = 800;
    canvas.width = 800;
    context.lineCap = "round"; 

})


const startLine= event =>{
    //sets lastPoint to current point 
    lastPoint = [event.clientX, event.clientY];
    lastSentPoint = lastPoint;
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
    sendImage(e, lastPoint);
}
const draw = e =>{
    if(!painting) return;
    context.moveTo(lastPoint[0], lastPoint[1]);
    context.strokeStyle = drawingColor;
    context.lineWidth = lineWidth;
    context.lineCap = "round";
    context.lineTo(e.clientX, e.clientY);
    context.stroke();
    if(enableSendCall){
        enableSendCall = false;
        sendImage(e, lastSentPoint);
        setTimeout(() => enableSendCall=true, 10);
        lastSentPoint = [e.clientX, e.clientY];
    }
    lastPoint = [e.clientX, e.clientY];
    // limiter(sendImage(e, lastPoint), 50);
    
}
//working on piece that is not part of the application yet
const setUserInfo = (info) =>{
    usersDrawingInfo[info.id] = [info.colour, info.lineWidth];
    socket.on(`user${info.id}DrawingData`, data=> newCanvasData(data));
    console.log(`user ${data.id} has started drawing`);
}

const newCanvasData = data => {
    context.beginPath();
    context.moveTo(data.lastX, data.lastY);// moves to last users point when drawing
    context.lineTo(data.clientX, data.clientY); // moves to current users point when drawing
    context.strokeStyle = data.color;
    context.lineWidth = data.width;
    context.stroke();
}        

socket.on('drawLine', data => newCanvasData(data));

socket.on('startedDrawing', info => setUserInfo(info));

socket.on('userId', userId => {
    id = userId;
    console.log(`Your id is user: ${id}`);
});

    
canvas.addEventListener('mousedown', startLine)
canvas.addEventListener('mouseup', endLine)
canvas.addEventListener('mousemove', draw)



