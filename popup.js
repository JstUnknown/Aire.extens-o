let video = document.getElementById("video");
let canvas = document.getElementById("canvas");
let ctx = canvas.getContext("2d");
let statusText = document.getElementById("status");


let model = null;
let lastScrollTime = 0;
let canScroll = false; // ⬅️ NOVA FLAG


const modelParams = {
 flipHorizontal: true,
 maxNumBoxes: 1,
 scoreThreshold: 0.6
};


// ------------------------
// INICIAR CÂMERA E MODELO
// ------------------------
handTrack.startVideo(video).then(function (status) {
 if (status) {
   navigator.mediaDevices.getUserMedia({ video: true })
     .then(stream => { video.srcObject = stream; })
     .catch(err => console.log("Erro ao acessar câmera:", err));


   handTrack.load(modelParams).then(lm => {
     model = lm;
     statusText.innerText = "Modelo carregado! Faça um gesto.";
     runDetection();
   });
 } else {
   statusText.innerText = "Habilite a câmera!";
 }
});


// ------------------------
// DETECÇÃO + SCROLL
// ------------------------
function runDetection() {
 if (!model) return requestAnimationFrame(runDetection);


 model.detect(video).then(predictions => {


   ctx.clearRect(0, 0, canvas.width, canvas.height);


   // Vídeo espelhado
   ctx.save();
   ctx.scale(-1, 1);
   ctx.drawImage(video, -canvas.width, 0, canvas.width, canvas.height);
   ctx.restore();


   // Linha guia do meio
   let mid = canvas.height / 2;
   ctx.strokeStyle = "yellow";
   ctx.beginPath();
   ctx.moveTo(0, mid);
   ctx.lineTo(canvas.width, mid);
   ctx.stroke();


   if (predictions.length > 0) {
     canScroll = true; // ⬅️ HABILITA SCROLL QUANDO TEM MÃO


     let hand = predictions[0];
     let [x, y, w, h] = hand.bbox;


     // 🔥 TAMANHO FIXO DO RETÂNGULO
     const boxSize = 60;


     // Coordenadas compensadas por espelhamento
     const drawX = canvas.width - x - boxSize;
     const drawY = y;


     // Desenha o quadrado fixo
     ctx.strokeStyle = "lime";
     ctx.lineWidth = 3;
     ctx.strokeRect(drawX, drawY, boxSize, boxSize);


     // Centro do quadrado
     let handCenterY = drawY + boxSize / 2;


     // Sensibilidade
     const threshold = 25;


     if (handCenterY < mid - threshold) {
       statusText.innerText = "🟢 Subindo página...";
       scrollPage("up");
     }
     else if (handCenterY > mid + threshold) {
       statusText.innerText = "🔵 Descendo página...";
       scrollPage("down");
     }
     else {
       statusText.innerText = "✋ Mantenha a mão no centro.";
     }
   }


   // -------------------------
   // ❌ SEM MÃO => PARA TUDO
   // -------------------------
   else {
     statusText.innerText = "Nenhuma mão detectada.";
     canScroll = false; // ⬅️ DESATIVA O SCROLL
   }


   requestAnimationFrame(runDetection);
 });
}


// ------------------------
// FUNÇÃO DE SCROLL
// ------------------------
function scrollPage(direction) {


 if (!canScroll) return; // ⬅️ BLOQUEIA SCROLL SE NÃO HOUVER MÃO


 const now = Date.now();
 if (now - lastScrollTime < 300) return;
 lastScrollTime = now;


 chrome.tabs.query({ active: true, currentWindow: true }, tabs => {
   chrome.scripting.executeScript({
     target: { tabId: tabs[0].id },
     func: dir => {
       window.scrollBy({
         top: dir === "up" ? -80 : 80,
         behavior: "smooth"
       });
     },
     args: [direction]
   });
 });
}



