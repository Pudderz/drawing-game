const picker = document.querySelector('#picker')
const colourPicker = document.querySelector('#colourPicker');
const sizePicker = document.querySelector('#sizePicker');
const canvasColourSelector = document.querySelector('#canvasColourSelector');

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
    link.download = 'image.png';
    link.textContent = "Download Image"
    
    canvas.toBlob(function(blob){
        link.href = URL.createObjectURL(blob);
        console.log(blob);
        console.log(link.href)
        picker.appendChild(link)
    })

})
