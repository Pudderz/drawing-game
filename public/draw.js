const canvas = document.querySelector('#canvas');
var socket = io.connect('http://localhost:3000');
let id = "guest";
let usersDrawingInfo = {};
let lastPoint = [];
let lastSentPoint = [];
let lineWidth = 10;
drawingColor="black";
let context = null;
let painting = false;
const colourPicker = document.querySelector('#colourPicker');
let enableSendCall= true;

function  getMousePos(canvas, evt) {
    var rect = canvas.getBoundingClientRect(), // abs. size of element
        scaleX = canvas.width / rect.width,    // relationship bitmap vs. element for X
        scaleY = canvas.height / rect.height;  // relationship bitmap vs. element for Y
  
    return {
      x: (evt.clientX - rect.left) * scaleX,   // scale mouse coordinates after they have
      y: (evt.clientY - rect.top) * scaleY     // been adjusted to be relative to element
    }
  }


const draw = e =>{
    if(!painting) return;
    context.beginPath();
    context.moveTo(lastPoint[0], lastPoint[1]);
    context.strokeStyle = drawingColor;
    context.lineWidth = lineWidth;
    context.lineCap = "round";
    context.lineJoin = "round";
    let points = getMousePos(canvas, e)
    // let midPoints = midPoint(lastPoint[0], lastPoint[1], e.clientX, e.clientY);
    // context.quadraticCurveTo(lastPoint[0], lastPoint[1], midPoints[0], midPoints[1]);
    // context.quadraticCurveTo(midPoints[0], midPoints[1], e.clientX, e.clientY)
    context.lineTo(points.x, points.y);
    context.stroke();
    
    if(enableSendCall){
        enableSendCall = false;
        whileDrawingData(e);
        setTimeout(() => enableSendCall= true, 25);
        lastSentPoint = [points.x, points.y];
    }
    lastPoint = [points.x, points.y];
}

function midPoint(firstX, firstY, secondX, secondY){
    let midpointX = firstX+ (secondX-firstX)/2;
    let midpointY = firstY+ (secondY-firstY)/2;
    return [midpointX, midpointY];
}

const startDrawingData = (e) =>{
    console.log('started');
    let points = getMousePos(canvas, e)
    //I sets the color to colourPicker.value as otherwise if you pick a colour then instantly start drawing the colour isnt updated yet
    socket.emit('startedDrawing',{
        clientX: points.x,
        clientY: points.y,
        lineWidth: lineWidth,
        color: colourPicker.value, 
        id: id,
        globalCompositeOperation: context.globalCompositeOperation, //This data is used to send if the user is erasing or not
    })
}
const startLine = event => {
    //sets lastPoint to current point
    let points = getMousePos(canvas, event)
    lastPoint = [points.x, points.y];
    painting = true; 
    context.beginPath();
    draw(event);
    startDrawingData(event);
    console.log('mousedown');
}

const whileDrawingData = e =>{
    let points = getMousePos(canvas, e);
    socket.emit(`user${id}DrawingData`,{
        clientX: points.x,
        clientY: points.y,
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


window.addEventListener('load', () => {
    console.log('ready');
    context = canvas.getContext('2d');
    canvas.height = 1800;
    canvas.width = 1800;
    context.lineCap = "round"; 
    context.lineJoin = "round";
    context.globalCompositeOperation="source-over";

})

class UserStarted{
    constructor(userColour, userWidth, userid, userErasing){
        this.colour= userColour;
        this.lineWidth= userWidth;
        this.id= userid;
        this.lastX;
        this.lastY;
        this.erasing = userErasing;
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
    set changeErasing(erasing){
        this.erasing = erasing;
    }
    sendStartInfo(info){
        this.lastX = info.clientX;
        this.lastY = info.clientY;
        //context.beginPath();
        newCanvasData(info, this.colour, this.lineWidth, this.lastX, this.lastY, this.erasing);
        console.log('new user started line')
        
    }
    newDrawingData(info){
        newCanvasData(info, this.colour, this.lineWidth, this.lastX, this.lastY, this.erasing)
        this.lastX = info.clientX;
        this.lastY = info.clientY;
    }
}

const setUserInfo = (info) =>{
    usersDrawingInfo[info.id] = new UserStarted(info.color, info.lineWidth, info.id);
    usersDrawingInfo[info.id].setUpConnection.sendStartInfo(info);

}
const newCanvasData = (data, dataColour= data.color, dataWidth = data.width, lastX=data.lastX, lastY=data.lastY, erasing) => {
    if(erasing)context.globalCompositeOperation = erasing;
    context.beginPath()
    let midPoints = midPoint(lastX, lastY, data.clientX, data.clientY);
    context.moveTo(lastX, lastY);// moves to last users point
    context.quadraticCurveTo(lastX, lastY, midPoints[0], midPoints[1]);
    //context.quadraticCurveTo(midPoints[0], midPoints[1], data.clientX, data.clientY)
    context.lineTo(data.clientX, data.clientY); // moves to current users point while drawing
    context.strokeStyle = dataColour;
    context.lineWidth = dataWidth;
    context.stroke();
}        

socket.on('drawLine', data => newCanvasData(data));

socket.on('startedDrawing', info => {
    console.log('started Drawing received')
    if(usersDrawingInfo[info.id]){
        usersDrawingInfo[info.id].changeColor = info.color;
        usersDrawingInfo[info.id].changeWidth = info.lineWidth;
        usersDrawingInfo[info.id].changeErasing = info.globalCompositeOperation;
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