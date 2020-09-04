var socket =io.connect('http://localhost:3000');
let i = 0
const canvas = document.querySelector('#canvas');




let lineWidth = 10;
window.addEventListener('load', ()=>{
    console.log('ready')
    
    const context = canvas.getContext('2d');
    canvas.height = 800;
    canvas.width = 800;
    // for resizing the canvas, though atm erases canvas drawing when resized
    // window.addEventListener('resize', ()=>{
    //     canvas.height = window.innerHeight;
    //     canvas.width= window.innerWidth;
    // });

    const sendImage=()=>{
        i++;
        console.log('sending')
        
        let dataURL = canvas.toDataURL('image/bmp',0.1);
        data = {
            imageBinaryDate: dataURL,
        };
        socket.emit('mouse', data)
    }
    

    let painting = false;
    const startLine=(event)=>{
        painting = true;
        console.log('mousedown');
        draw(event);
        
    }
    const endLine = ()=>{
        painting = false;
        context.beginPath();
        console.log('mouseup');
        sendImage();
    }
    const draw = (e) =>{

        if(!painting) return;
        context.lineWidth = lineWidth;
        context.lineCap = "round";
        context.lineTo(e.clientX, e.clientY);
        context.stroke();
        context.beginPath();
        context.moveTo(e.clientX, e.clientY);

    }
    canvas.addEventListener('mousedown', startLine)
    canvas.addEventListener('mouseup', endLine)
    canvas.addEventListener('mousemove', draw)

    const newCanvasData=(data)=>{
        console.log(data);
        var image = new Image();
        image.onload = function() {
            context.drawImage(image, 0, 0);
        };
        image.src = data.imageBinaryDate;
    }        


    socket.on('mouse', data => newCanvasData(data));
})


