var socket =io.connect('http://localhost:3000');
let i = 0
const canvas = document.querySelector('#canvas');




let lineWidth = 10;
drawingColor="black";
window.addEventListener('load', ()=>{
    console.log('ready')
    const context = canvas.getContext('2d');
    canvas.height = 800;
    canvas.width = 800;
    context.lineCap = "round";
    // for resizing the canvas, though atm erases canvas drawing when resized
    // window.addEventListener('resize', ()=>{
    //     canvas.height = window.innerHeight;
    //     canvas.width= window.innerWidth;
    // });

    const sendImage=(e, endLine = false)=>{
        i++;
        console.log('sending')
        
        //let dataURL = canvas.toDataURL('image/bmp',0.7);
        //console.log(dataURL);
        data = {
            //imageBinaryDate: dataURL,
            clientX: e.clientX,
            clientY: e.clientY,
            end: endLine,
            width: lineWidth,
            color: drawingColor,
        };
        socket.emit('mouse', data)
    }
    

    let painting = false;
    const startLine=(event)=>{
        painting = true;
        console.log('mousedown');
        draw(event);
        
    }
    const endLine = (e)=>{
        painting = false;
        context.beginPath();
        console.log('mouseup');
        sendImage(e, true)
        
    }
    const draw = (e) =>{

        if(!painting) return;
        context.strokeStyle = drawingColor;
        context.lineWidth = lineWidth;
        context.lineCap = "round";
        context.lineTo(e.clientX, e.clientY);
        context.stroke();
        context.beginPath();
        context.moveTo(e.clientX, e.clientY);
        sendImage(e, false);

    }
    canvas.addEventListener('mousedown', startLine)
    canvas.addEventListener('mouseup', endLine)
    canvas.addEventListener('mousemove', draw)

    const newCanvasData= data => {
        context.lineWidth = data.width;
        console.log(data);
        context.strokeStyle = data.color;
        context.lineTo(data.clientX, data.clientY);
        context.stroke();
        context.beginPath();
        context.moveTo(data.clientX, data.clientY);
        if(data.end){
            context.beginPath();
        }
        context.lineWidth = lineWidth;
        // var image = new Image();
        // image.onload = function() {
        //     context.drawImage(image, 0, 0);
        // };
        // image.src = data.imageBinaryDate;
    }        


    socket.on('mouse', data => newCanvasData(data));
})


