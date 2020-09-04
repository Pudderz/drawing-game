var socket =io.connect('http://localhost:3000');
let i = 0
const sendImage=()=>{
    i++;
    console.log('sending')
    data = {
        mouseNumber: i,
    };
    socket.emit('mouse', data)
}

let lineWidth = 10;
window.addEventListener('load', ()=>{
    console.log('ready')
    const canvas = document.querySelector('#canvas');
    const context = canvas.getContext('2d');
    canvas.height = window.innerHeight;
    canvas.width = window.innerWidth;

    window.addEventListener('resize', ()=>{
        canvas.height = window.innerHeight;
        canvas.width= window.innerWidth;
    });

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
})


