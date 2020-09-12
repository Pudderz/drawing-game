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
        whileDrawingData(e);
        setTimeout(() => enableSendCall= true, 25);
        lastSentPoint = [e.clientX, e.clientY];
    }
    lastPoint = [e.clientX, e.clientY];
}

const startDrawingData = (e) =>{
    console.log('started');
    socket.emit('startedDrawing',{
        clientX: e.clientX,
        clientY: e.clientY,
        lineWidth: lineWidth,
        color: drawingColor, 
        id: id,
    })
}
const startLine = event => {
    //sets lastPoint to current point
    lastPoint = [event.clientX, event.clientY];
    painting = true; 
    context.beginPath();
    draw(event);
    startDrawingData(event);
    console.log('mousedown');
}

const whileDrawingData = (e)=>{
    socket.emit(`user${id}DrawingData`,{
        clientX: e.clientX,
        clientY: e.clientY,
    })
}


const endDrawingData = e =>{
    socket.emit(`user${id}EndDrawingData`, {})
}
const endLine = e =>{
    // this if statement is used so it doesnt send information to the server when picking colours from the canvas
    if(painting == false) return; 
    painting = false;
    context.beginPath();
    console.log('mouseup');
    socket.emit(`user${id}EndDrawingData`, {end:true});
    //sendImage(e, lastPoint);
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
        setTimeout(() => enableCall = true, time)
    }
}

window.addEventListener('load', () => {
    console.log('ready');
    context = canvas.getContext('2d');
    canvas.height = 800;
    canvas.width = 800;
    context.lineCap = "round"; 
    context.lineJoin = "round";

})

class UserStarted{
    constructor(userColour, userWidth, userid){
        this.colour= userColour;
        this.lineWidth= userWidth;
        this.id= userid;
        this.lastX;
        this.lastY;
    }
    get setUpConnection(){
        console.log('the id is '+this.id);
        socket.on(`user${this.id}DrawingData`, data => {
            this.newDrawingData(data);
        });
        console.log(`user${this.id} setup`);
        return this;
    }
    endConnection =()=>{
        socket.off(`user${this.id}DrawingData`);
    }  
    set changeColor(colour){
        this.colour = colour;
        console.log(`colour is now ${this.colour}`);
    }
    set changeWidth(size){
        this.lineWidth = size;
        console.log(`colour is now ${this.lineWidth}`);
    }
    sendStartInfo(info){
        this.lastX = info.clientX;
        this.lastY = info.clientY;
        newCanvasData(info, this.colour, this.lineWidth, this.lastX, this.lastY);
        console.log('new user started line')
        
    }
    newDrawingData(info){
        newCanvasData(info, this.colour, this.lineWidth, this.lastX, this.lastY)
        this.lastX = info.clientX;
        this.lastY = info.clientY;
    }
}

const setUserInfo = (info) =>{
    usersDrawingInfo[info.id] = new UserStarted(info.color, info.lineWidth, info.id);
    usersDrawingInfo[info.id].setUpConnection.sendStartInfo(info);

}
const newCanvasData = (data, colour= data.color, width = data.width, lastX=data.lastX, lastY=data.lastY) => {
    context.beginPath();
    context.moveTo(lastX, lastY);// moves to last users point when drawing
    context.lineTo(data.clientX, data.clientY); // moves to current users point when drawing
    context.strokeStyle = colour;
    context.lineWidth = width;
    context.stroke();
}        

socket.on('drawLine', data => newCanvasData(data));
socket.on('startedDrawing', info => {
    console.log('started Drawing received')
    if(usersDrawingInfo[info.id]){
        usersDrawingInfo[info.id].changeColor = info.color;
        usersDrawingInfo[info.id].changeWidth = info.lineWidth;
        usersDrawingInfo[info.id].sendStartInfo(info);
    } else{
      setUserInfo(info);  
    }   
});

socket.on('userId', userId => {
    id = userId;
    console.log(`Your id is user: ${id}`);
});

    
canvas.addEventListener('mousedown', startLine);
canvas.addEventListener('mouseup', endLine);
canvas.addEventListener('mousemove', draw);