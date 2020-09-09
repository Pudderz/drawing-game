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
    // canvas.height = window.innerHeight;
    // canvas.width= window.innerWidth;
    context.lineCap = "round";
    // //for resizing the canvas, though atm erases canvas drawing when resized
    // window.addEventListener('resize', ()=>{
    //     canvas.height = window.innerHeight;
    //     canvas.width= window.innerWidth;
    // });

    const sendImage=(e, endLine = false, startLine = false)=>{
        i++;
        console.log('sending')
        
        data = {
            //imageBinaryDate: dataURL,
            clientX: e.clientX,
            clientY: e.clientY,
            lastX: lastPoint[0],
            lastY: lastPoint[1],
            end: endLine,
            width: lineWidth,
            color: drawingColor,
            start: startLine,
            id: id,
        };
        socket.emit('mouse', data)
    }
    

    let painting = false;
    const startLine=(event)=>{
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
    const draw = (e, startingBool = false) =>{
        if(startingBool) lastPoint = [e.clientX, e.clientY];
        console.log(lastPoint)
        if(!painting) return;
        context.beginPath();
        context.moveTo(lastPoint[0], lastPoint[1]);
        context.strokeStyle = drawingColor;
        context.lineWidth = lineWidth;
        context.lineCap = "round";
        context.lineTo(e.clientX, e.clientY);
        context.stroke();
        sendImage(e, false, startingBool);
        lastPoint = [e.clientX, e.clientY];
    }
    canvas.addEventListener('mousedown', startLine)
    canvas.addEventListener('mouseup', endLine)
    canvas.addEventListener('mousemove', draw)

    const newCanvasData= data => {
        console.log(`user ${data.id} is drawing`)
        context.beginPath();
        context.lineWidth = data.width;
        context.moveTo(data.lastX, data.lastY);// moves to last users point when drawing
        context.lineTo(data.clientX, data.clientY); // moves to current users point when drawing
        context.strokeStyle = data.color;
        context.stroke();
    }        
    
    let colourPicker = document.querySelector('#colourPicker');
    colourPicker.addEventListener('change', (e)=>{
      drawingColor = e.target.value;  
    })
    let sizePicker = document.querySelector('#sizePicker');
    sizePicker.addEventListener('change', (e)=>{
      lineWidth = e.target.value;  
    })

    socket.on('mouse', data => newCanvasData(data));
    socket.on('userId', userId => {
      id = userId;
      console.log(id);
    });

})


