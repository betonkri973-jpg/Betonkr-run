const introScreen = document.getElementById("introScreen");
const menuScreen = document.getElementById("menuScreen");
const modalScreen = document.getElementById("modalScreen");
const achievementScreen = document.getElementById("achievementScreen");
const gameOverScreen = document.getElementById("gameOverScreen");
const gamePlayArea = document.getElementById("gamePlayArea");

const startBtn = document.getElementById("startBtn");
const howToPlayBtn = document.getElementById("howToPlayBtn");
const achievementsBtn = document.getElementById("achievementsBtn");
const highScoreBtn = document.getElementById("highScoreBtn");
const backToMenuBtn = document.getElementById("backToMenuBtn");
const backToMenuFromAchBtn = document.getElementById("backToMenuFromAchBtn");
const restartBtn = document.getElementById("restartBtn");
const menuReturnBtn = document.getElementById("menuReturnBtn");

const player = document.getElementById("player");
const gameContainer = document.getElementById("gameContainer");
const scoreDisplay = document.getElementById("score");
const livesDisplay = document.getElementById("livesDisplay");
const timerDisplay = document.getElementById("powerupTimer");
const finalScoreText = document.getElementById("finalScoreText");

let score = 0;
let lives = 3;
let highScore = localStorage.getItem("betomHighScore") || 0;
let isJumping = false;
let isSuperJumpActive = false;
let powerupTimeLeft = 0;
let gameSpeed = 7;
let gameActive = false;
let activeObjects = [];
let spawnInterval, timerInterval;
let isInvulnerable = false;

// İntro Ekranı
setTimeout(() => {
    introScreen.classList.add("hidden");
    menuScreen.classList.remove("hidden");
}, 3000);

// Menü Butonları
howToPlayBtn.addEventListener("click", () => {
    menuScreen.classList.add("hidden");
    modalScreen.classList.remove("hidden");
});

achievementsBtn.addEventListener("click", () => {
    menuScreen.classList.add("hidden");
    achievementScreen.classList.remove("hidden");
});

highScoreBtn.addEventListener("click", () => {
    alert("🏆 En Yüksek Skorun: " + highScore);
});

backToMenuBtn.addEventListener("click", () => {
    modalScreen.classList.add("hidden");
    menuScreen.classList.remove("hidden");
});

backToMenuFromAchBtn.addEventListener("click", () => {
    achievementScreen.classList.add("hidden");
    menuScreen.classList.remove("hidden");
});

startBtn.addEventListener("click", () => {
    menuScreen.classList.add("hidden");
    gamePlayArea.classList.remove("hidden");
    startGame();
});

restartBtn.addEventListener("click", () => {
    gameOverScreen.classList.add("hidden");
    gamePlayArea.classList.remove("hidden");
    startGame();
});

menuReturnBtn.addEventListener("click", () => {
    gameOverScreen.classList.add("hidden");
    menuScreen.classList.remove("hidden");
});

// Zıplama Kontrolleri
document.addEventListener("keydown", (e) => {
    if (!gameActive) return;
    if ((e.code === "Space" || e.code === "ArrowUp") && !isJumping) {
        jump();
    }
});
document.addEventListener("click", () => {
    if (!gameActive) return;
    if (!isJumping) jump();
});

function jump() {
    isJumping = true;
    if (isSuperJumpActive) {
        player.classList.add("super-jump");
        setTimeout(() => {
            player.classList.remove("super-jump");
            isJumping = false;
        }, 800);
    } else {
        player.classList.add("jump");
        setTimeout(() => {
            player.classList.remove("jump");
            isJumping = false;
        }, 600);
    }
}

// Arka Plan Müziği
let audioCtx = null;
function playBGM() {
    if (!audioCtx) {
        audioCtx = new (window.AudioContext || window.webkitAudioContext)();
    }
    const notes = [261.63, 329.63, 392.00, 523.25];
    let index = 0;
    
    window.bgmTimer = setInterval(() => {
        if (!gameActive) return;
        if (audioCtx.state === 'suspended') audioCtx.resume();
        const osc = audioCtx.createOscillator();
        const gain = audioCtx.createGain();
        osc.type = 'triangle';
        osc.frequency.setValueAtTime(notes[index], audioCtx.currentTime);
        gain.gain.setValueAtTime(0.03, audioCtx.currentTime);
        gain.gain.exponentialRampToValueAtTime(0.001, audioCtx.currentTime + 0.3);
        
        osc.connect(gain);
        gain.connect(audioCtx.destination);
        osc.start();
        osc.stop(audioCtx.currentTime + 0.3);
        
        index = (index + 1) % notes.length;
    }, 400);
}

// Nesne Tipleri
const objectTypes = [
    { type: 'obstacle', class: 'obstacle-tas' },
    { type: 'obstacle', class: 'obstacle-diken' },
    { type: 'obstacle', class: 'obstacle-patates' },
    { type: 'collectible', subtype: 'music', content: '🎵', scoreVal: 20 },
    { type: 'collectible', subtype: 'banana', content: '🍌', effect: 'superJump' },
    { type: 'collectible', subtype: 'cd', content: '📀', scoreVal: 100, rare: true }
];

function spawnObject() {
    if (!gameActive) return;
    const randIndex = Math.floor(Math.random() * objectTypes.length);
    const objData = objectTypes[randIndex];

    const elem = document.createElement("div");
    elem.classList.add("game-object");
    if (objData.class) elem.classList.add(objData.class);
    elem.innerHTML = objData.content || '';

    let posX = window.innerWidth + 50;
    elem.style.left = posX + "px";
    
    if (objData.subtype === 'banana' || objData.subtype === 'music') {
        elem.style.bottom = (Math.random() > 0.5 ? 160 : 80) + "px";
    } else if (objData.rare) {
        elem.style.bottom = "200px";
    } else {
        elem.style.bottom = "80px";
    }

    gamePlayArea.appendChild(elem);

    activeObjects.push({
        element: elem,
        x: posX,
        type: objData.type,
        subtype: objData.subtype,
        scoreVal: objData.scoreVal || 0,
        collected: false
    });
}

function updateLivesDisplay() {
    let hearts = "";
    for (let i = 0; i < lives; i++) {
        hearts += "💙";
    }
    livesDisplay.innerText = hearts;
}

function startGame() {
    score = 0;
    lives = 3;
    gameSpeed = 7;
    activeObjects = [];
    isInvulnerable = false;
    scoreDisplay.innerText = "Skor: 0";
    updateLivesDisplay();
    gameActive = true;
    playBGM();

    spawnInterval = setInterval(spawnObject, 2000);

    timerInterval = setInterval(() => {
        if (isSuperJumpActive) {
            powerupTimeLeft--;
            timerDisplay.innerText = "🍌 Süper Zıplama: " + powerupTimeLeft + "s";
            if (powerupTimeLeft <= 0) {
                isSuperJumpActive = false;
                timerDisplay.innerText = "";
            }
        }
    }, 1000);

    gameLoop();
}

function gameLoop() {
    if (!gameActive) return;
    let playerRect = player.getBoundingClientRect();

    activeObjects.forEach((obj, index) => {
        obj.x -= gameSpeed;
        obj.element.style.left = obj.x + "px";

        if (obj.x < -60) {
            obj.element.remove();
            activeObjects.splice(index, 1);
            return;
        }

        let objRect = obj.element.getBoundingClientRect();
        let isColliding = !(
            playerRect.right < objRect.left + 5 ||
            playerRect.left > objRect.right - 5 ||
            playerRect.bottom < objRect.top + 5 ||
            playerRect.top > objRect.bottom - 5
        );

        if (isColliding && !obj.collected) {
            if (obj.type === 'obstacle') {
                if (!isInvulnerable) {
                    loseLife();
                }
            } else if (obj.type === 'collectible') {
                obj.collected = true;
                obj.element.remove();

                if (obj.subtype === 'music' || obj.subtype === 'cd') {
                    score += obj.scoreVal;
                    scoreDisplay.innerText = "Skor: " + score;
                } else if (obj.subtype === 'banana') {
                    isSuperJumpActive = true;
                    powerupTimeLeft = 10;
                    timerDisplay.innerText = "🍌 Süper Zıplama: " + powerupTimeLeft + "s";
                }
            }
        }
    });

    requestAnimationFrame(gameLoop);
}

function loseLife() {
    lives--;
    updateLivesDisplay();
    
    if (lives <= 0) {
        gameOver();
    } else {
        isInvulnerable = true;
        player.classList.add("hit-effect");
        setTimeout(() => {
            isInvulnerable = false;
            player.classList.remove("hit-effect");
        }, 1500);
    }
}

function gameOver() {
    gameActive = false;
    clearInterval(spawnInterval);
    clearInterval(timerInterval);
    clearInterval(window.bgmTimer);

    activeObjects.forEach(obj => obj.element.remove());
    activeObjects = [];

    if (score > highScore) {
        highScore = score;
        localStorage.setItem("betomHighScore", highScore);
    }

    finalScoreText.innerText = "Skorun: " + score;
    gamePlayArea.classList.add("hidden");
    gameOverScreen.classList.remove("hidden");
                   }
                       
