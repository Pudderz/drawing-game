var socket =io.connect('http://localhost:3000');
let i = 0
const canvas = document.querySelector('#canvas');
let id = "guest";
let usersLastDrawingInfo ={};
let lastPoint = [];


let lineWidth = 10;
drawingColor="black";
window.addEventListener('load', ()=>{
    console.log('ready')
    const context = canvas.getContext('2d');
    canvas.height = 800;
    canvas.width = 800;
    context.lineCap = "round";
    
    const sendImage=(e, endLine = false, startLine = false)=>{
        console.log('sending')
        
        data = {
            clientX: e.clientX,
            clientY: e.clientY,
            lastX: lastPoint[0],
            lastY: lastPoint[1],
            end: endLine,
            start: startLine,
            width: lineWidth,
            color: drawingColor,
            id: id,
        };
        socket.emit('mouse', data)
    }
    

    let painting = false;
    const startLine=(event)=>{
        //sets lastPoint to current point 
        lastPoint = [event.clientX, event.clientY];
        painting = true;
        console.log('mousedown');
        draw(event, true);
        
    }
    const endLine = (e)=>{
        painting = false;
        context.beginPath();
        console.log('mouseup');
        sendImage(e, true)
        
    }
    const draw = e =>{
        if(!painting) return;
        sendImage(e, false);

        context.beginPath();
        context.moveTo(lastPoint[0], lastPoint[1]);
        context.strokeStyle = drawingColor;
        context.lineWidth = lineWidth;
        context.lineCap = "round";
        context.lineTo(e.clientX, e.clientY);
        context.stroke();

        lastPoint = [e.clientX, e.clientY];
    }
    canvas.addEventListener('mousedown', startLine)
    canvas.addEventListener('mouseup', endLine)
    canvas.addEventListener('mousemove', draw)

    const newCanvasData= data => {
        console.log(`user ${data.id} is drawing`)
        context.beginPath();
        context.moveTo(data.lastX, data.lastY);// moves to last users point when drawing
        context.lineTo(data.clientX, data.clientY); // moves to current users point when drawing
        context.strokeStyle = data.color;
        context.lineWidth = data.width;
        context.stroke();
    }        

    const colourPicker = document.querySelector('#colourPicker');
    colourPicker.addEventListener('change', (e)=>{
      drawingColor = e.target.value;  
    })

    const sizePicker = document.querySelector('#sizePicker');
    sizePicker.addEventListener('change', (e)=>{
      lineWidth = e.target.value;  
    })

    socket.on('mouse', data => newCanvasData(data));
    socket.on('userId', userId => {
      id = userId;
      console.log(`Your id is user: ${id}`);
    });

})


