let video = document.getElementById("video");
let statusText = document.getElementById("status");

let model;

const modelParams = {
  flipHorizontal: true,
  maxNumBoxes: 1
};

// ======== START CAMERA ========
handTrack.startVideo(video).then(started => {
  if (started) {

    statusText.innerText = "Câmera ligada. Carregando modelo...";

    handTrack.load(modelParams).then(m => {
      model = m;
      statusText.innerText = "Modelo carregado!";

      video.addEventListener("loadeddata", () => {
        detect();
      });
    });

  } else {
    statusText.innerText = "Permita o uso da câmera!";
  }
});

// === CONTROLE DE MOVIMENTO ===
let lastY = null;
const sensitivity = 4;
let lastSend = 0;

// ======= DETECT LOOP ========
function detect() {
  model.detect(video).then(preds => {

    if (preds.length > 0) {

      const [x, y, w, h] = preds[0].bbox;
      const centerY = y + h / 2;

      if (lastY !== null) {
        const dy = centerY - lastY;
        const now = Date.now();

        // rate limit
        if (now - lastSend > 150) {
          if (dy < -sensitivity) {
            sendMessage("scrollUp");
            lastSend = now;
          }

          if (dy > sensitivity) {
            sendMessage("scrollDown");
            lastSend = now;
          }
        }
      }

      // gesto topo da tela
      if (y < 80) {
        sendMessage("openTab");
      }

      lastY = centerY;

    } else {
      lastY = null;
    }

    requestAnimationFrame(detect);
  });
}

// ======= SEND MESSAGE =======
function sendMessage(cmd) {
  chrome.tabs.query({ active: true, currentWindow: true }, tabs => {

    if (!tabs[0]) return;

    chrome.scripting.executeScript({
      target: { tabId: tabs[0].id },
      func: (command) => {
        if (command === "scrollUp") {
          window.scrollBy({ top: -120, behavior: "smooth" });
        }

        if (command === "scrollDown") {
          window.scrollBy({ top: 120, behavior: "smooth" });
        }

        if (command === "openTab") {
          window.open("https://www.youtube.com", "_blank");
        }
      },
      args: [cmd]
    });

  });
}
