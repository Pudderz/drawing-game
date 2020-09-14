const picker = document.querySelector('#picker')

const sizePicker = document.querySelector('#sizePicker');
const canvasColourSelector = document.querySelector('#canvasColourSelector');
let listOfDownloads = document.querySelector('#listOfDownloadOptions');
let eraser = document.querySelector('#erase');
function pick(event){
    let data = context.getImageData(event.clientX, event.clientY, 1, 1).data;
    let colourData = [].slice.call(data, 0, 4);
    let rgbColour = colourData.slice(0,3);
    if(rgbColour.join() == '0,0,0') {
        if(colourData[3] == 255){
            rgbColour = [0,0,0];
        }else{
            rgbColour = [255,255,255];
        }
    }
    let hex = rgbColour.map((number)=>{
        let answer = number.toString(16);
        return(answer.length <2)? `0${answer}` : answer;
    });

    
    colourPicker.value = `#${hex.join('')}`;
    drawingColor = `#${hex.join('')}`;
    //removes colour selector
    canvas.addEventListener('mousedown', startLine);
    canvas.removeEventListener('click', pick);
    canvasColourSelector.textContent = "pick colour from canvas";
    canvasColourSelector.classList.remove('selected');
}

canvasColourSelector.addEventListener('click', e => {
    context.globalCompositeOperation = "source-over";//turns off eraser
    e.target.classList.toggle('selected');
    if(e.target.classList.contains('selected')){
        e.target.textContent = "Stop selection";
        canvas.removeEventListener('mousedown', startLine);
        canvas.addEventListener('click', pick)
    }else{
        canvas.addEventListener('mousedown', startLine);
        canvas.removeEventListener('click', pick);
        e.target.textContent = "pick colour from canvas";
    } 
})

colourPicker.addEventListener('click', () => {
context.globalCompositeOperation = "source-over";//turns off eraser
});
   
colourPicker.addEventListener('change', e => {
drawingColor = e.target.value;  
}); 


sizePicker.addEventListener('change', e => {
    lineWidth = e.target.value;  
});

let saveImage = document.querySelector('#saveImage')
saveImage.addEventListener('click', e=>{
    e.preventDefault();
    const link = document.createElement('a');
    const list = document.createElement('li');
    let timestamp = new Date();
    link.download = 'image.png';
    link.textContent = `Download Image at ${timestamp.toTimeString()}`;
    
    canvas.toBlob(function(blob){
        link.href = URL.createObjectURL(blob);
        console.log(blob);
        console.log(link.href);
        list.appendChild(link);
        listOfDownloads.appendChild(list);
    })

})


eraser.addEventListener('click', e=>{
    eraser.classList.toggle('Erasing');
    context.globalCompositeOperation = (eraser.classList.contains('Erasing'))?
        "destination-out": "source-over";
});
