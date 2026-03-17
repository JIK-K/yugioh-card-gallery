// 엑조디아 비밀 엔딩 전용 스크립트
const EXODIA_PART_NAMES = [
  "봉인된 엑조디아",
  "봉인된 자의 왼쪽 팔",
  "봉인된 자의 왼쪽 다리",
  "봉인된 자의 오른쪽 팔",
  "봉인된 자의 오른쪽 다리",
];

let exodiaClickedSet = new Set();
let exodiaStreakCount = 0;

function isLobPackActive() {
  const active = document.querySelector(".nav-item.active");
  return active && active.dataset.file === "LOB.json";
}

function triggerExodiaEnding() {
  const existing = document.getElementById("exodiaEndingOverlay");
  if (existing) return;

  const overlay = document.createElement("div");
  overlay.id = "exodiaEndingOverlay";
  Object.assign(overlay.style, {
    position: "fixed",
    inset: "0",
    backgroundColor: "black",
    zIndex: "9999",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
  });

  const video = document.createElement("video");
  video.src = "img/end.mp4";
  video.autoplay = true;
  video.controls = false;
  video.playsInline = true;
  video.style.width = "100%";
  video.style.height = "100%";
  video.style.objectFit = "cover";

  overlay.appendChild(video);
  document.body.appendChild(overlay);

  const fullscreen =
    overlay.requestFullscreen ||
    overlay.webkitRequestFullscreen ||
    overlay.mozRequestFullScreen ||
    overlay.msRequestFullscreen;
  if (fullscreen) {
    fullscreen.call(overlay).catch(() => {});
  }

  video.addEventListener("ended", () => {
    try {
      window.open("", "_self");
      window.close();
    } catch (e) {}
    setTimeout(() => {
      try {
        location.replace("about:blank");
      } catch (e) {}
    }, 500);
  });
}

function initExodiaClickHandlers() {
  document.querySelectorAll(".card-item").forEach((cardEl) => {
    cardEl.addEventListener("click", () => {
      if (!isLobPackActive()) return;

      const nameEl = cardEl.querySelector(".info-name");
      const name = nameEl ? nameEl.textContent.trim() : "";
      if (!EXODIA_PART_NAMES.includes(name)) {
        // 엑조디아 파츠가 아닌 카드를 누르면 연속 시퀀스 초기화
        exodiaClickedSet = new Set();
        exodiaStreakCount = 0;
        return;
      }

      // 엑조디아 파츠를 연속으로 누른 경우만 카운트 업
      if (exodiaClickedSet.has(name)) {
        // 이미 눌렀던 파츠를 다시 누르면, 그 카드부터 새로운 시퀀스를 시작
        exodiaClickedSet = new Set([name]);
        exodiaStreakCount = 1;
      } else {
        exodiaClickedSet.add(name);
        exodiaStreakCount += 1;
      }

      // 연속 5번 모두 다른 엑조디아 파츠를 클릭했을 때만 발동
      if (
        exodiaStreakCount === EXODIA_PART_NAMES.length &&
        exodiaClickedSet.size === EXODIA_PART_NAMES.length
      ) {
        exodiaClickedSet = new Set();
        exodiaStreakCount = 0;
        triggerExodiaEnding();
      }
    });
  });
}

if (typeof renderCards === "function") {
  const _origRenderCards = renderCards;
  renderCards = function patchedRenderCards(cards) {
    _origRenderCards(cards);
    initExodiaClickHandlers();
  };
}

