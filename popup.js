let video=document.getElementById("video");
let statusTxt=document.getElementById("status");
let model;

const modelParams={
    flipHorizontal:true,
     maxNumBoxes:1
}

handTrack.startVideo(video).then(started=>{
    if(started){                                
        handTrack.load(modelParams).then(m=>{
            model=m;
            statusTxt.innerText="modelo carregado"
            detect()
        })
    }else{statusTxt.innerText="Permita o uso da camera"}
})

let lastY=null;
let gestureCoolDown=false;

function detect(){ 
    model.detect(video).then(preds=>{
        if(preds.length>0){
            const p=preds[0];
            const [x,y,w,h]=p.bbox
            const centerY=y+h/2
            let conf=0 
            if(lastY!== null){
                const dy=centerY-lastY
            }
        }

    })
    }