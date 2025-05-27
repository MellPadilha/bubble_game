import parado from '/parado.png';
import nadando1 from '/nadando_1.png';
import nadando2 from '/nadando_2.png';
import bubble_pop_sound from '/bubble_pop.mp3';
import game_over_sound from '/game_over.wav';
import seagulls_sound from '/seagulls_sound.wav';
import dano_sound from '/dano_sound.wav';
import baleia from '/baleia.png';

let character;
let characterImages = [];
let characterIndex = 0;
let characterX = 50;
let characterY;
let fishes = [];
let fishImages = [];
let isMoving = false;
let gameOver = false;
let gameStarted = false;
let vidas = 5;
let piscarVidaFrames = 0;
let audioContext;
let danoBuffer;
let pontuacao = 0;
let whaleImage;
let nextWhaleSpawn = 0;
let whales = [];
let paradoImg;
let gameLogo;

const MIN_BUBBLE_SIZE = 30;
const MAX_BUBBLE_SIZE = 50;
const MIN_VOLUME = 0.2;
const MAX_VOLUME = 1.0;
const MAX_VIDAS = 5;
const BASE_FISH_SPEED_MIN = 2;
const BASE_FISH_SPEED_MAX = 5;
const SPEED_INCREASE_INTERVAL = 30;
const SPEED_INCREASE_AMOUNT = 0.5;
const WHALE_MIN_INTERVAL = 15;
const WHALE_MAX_INTERVAL = 30;
const WHALE_SIZE = 120;
const WHALE_SPEED_MULTIPLIER = 0.8;

let bubbles = [];
let bubbleImage;
let bubblePopSound;
let lastSpeedIncreaseTime = 0;
let currentSpeedMultiplier = 1;

let gameOverSound;
let restartButton;
let startButton;

let dying = false;
let deathVy = 0;
let deathAngle = 0;
const DEATH_GRAVITY = 0.5;
const DEATH_ANG_VEL = 0.15;

let nextSeagullFrame = 0;
let seagullsSound;

export function createSketch(p) {
  p.setup = async () => {
    p.createCanvas(window.innerWidth, window.innerHeight);
    p.frameRate(60);
    audioContext = new (window.AudioContext || window.webkitAudioContext)();

    const response = await fetch(dano_sound);
    const arrayBuffer = await response.arrayBuffer();
    danoBuffer = await audioContext.decodeAudioData(arrayBuffer);

    paradoImg = await p.loadImage(parado);
    characterImages = await Promise.all([p.loadImage(nadando1), p.loadImage(nadando2)]);
    character = paradoImg;
    characterY = p.height / 2 - 50;
    whaleImage = await p.loadImage(baleia);
    gameLogo = await p.loadImage('/game_logo.png');

    const fishFilenames = [
      '/peixe_azul.png',
      '/peixe_roxo.png',
      '/peixe_amarelo.png',
      '/peixe_verde.png',
      '/peixe_vermelho.png'
    ];
    fishImages = await Promise.all(fishFilenames.map(filename => p.loadImage(filename)));

    bubbleImage = await p.loadImage('/bubble.png');

    bubblePopSound = new Audio(bubble_pop_sound);
    gameOverSound = new Audio(game_over_sound);

    startButton = p.createButton('Iniciar');
    startButton.position(p.width / 2 - 50, p.height / 2 + 50);
    startButton.style('background-color', '#0066cc');
    startButton.style('color', 'white');
    startButton.style('border', 'none');
    startButton.style('padding', '15px 30px');
    startButton.style('font-size', '20px');
    startButton.style('border-radius', '5px');
    startButton.style('cursor', 'pointer');
    startButton.mousePressed(() => {
      gameStarted = true;
      startButton.hide();
    });

    restartButton = p.createButton('↻ Restart');
    restartButton.position(20, 20);
    restartButton.style('font-size', '18px');
    restartButton.mousePressed(() => resetGame(p));
    restartButton.hide();

    seagullsSound = new Audio(seagulls_sound)
    nextSeagullFrame = p.frameCount + p.int(p.random(300, 1000));
    lastSpeedIncreaseTime = p.millis();

    nextWhaleSpawn = p.frameCount + p.int(p.random(WHALE_MIN_INTERVAL, WHALE_MAX_INTERVAL) * 60);
  };

  p.draw = () => {
    p.clear();
    
    if (!gameStarted) {
      const logoWidth = 300;
      const logoHeight = 300;
      p.image(gameLogo, p.width / 2 - logoWidth / 2, p.height / 2 - logoHeight - 30, logoWidth, logoHeight);
      
      p.image(character, characterX, characterY, 100, 100);
      return;
    }

    p.textSize(24);
    p.textAlign(p.LEFT, p.TOP);
    
    if (piscarVidaFrames > 0) {
      const alpha = p.map(piscarVidaFrames, 0, 15, 0, 255);
      p.fill(255, 100, 100, alpha);
      piscarVidaFrames--;
    } else {
      p.fill(255);
    }
    
    p.text(`❤️ ${vidas} + Lifes   |   🫧 ${pontuacao} + Points`, 20, 20);

    if (p.frameCount >= nextSeagullFrame) {
      emitirSomGaivota();
      nextSeagullFrame = p.frameCount + p.int(p.random(300, 1000));
    }

    if (dying) {
      animacaoMorte(p);
      return;
    }

    if (gameOver) {
      p.fill(255, 255, 255);
      p.textSize(64);
      p.textAlign(p.CENTER, p.CENTER);
    
      p.text('Game Over', p.width / 2, p.height / 2 - 40);
    
      p.textSize(32);
      p.fill(255);
      p.text(`🫧 Bolhas coletadas: ${pontuacao}`, p.width / 2, p.height / 2 + 20);
    
      restartButton.show();
      const bw = restartButton.elt.offsetWidth;
      const bh = restartButton.elt.offsetHeight;
      restartButton.position(
        p.width / 2 - bw / 2,
        (p.height / 2 - bh / 2) + 100
      );
      return;
    }

    const frameDelay = 10;

    if (p.frameCount % frameDelay === 0) {
      characterIndex = (characterIndex + 1) % characterImages.length;
      character = characterImages[characterIndex];
    }

    p.image(character, characterX, characterY, 100, 100);

    if (p.frameCount % 60 === 0) {
      const randomImage = fishImages[Math.floor(p.random(fishImages.length))];
      const newFish = {
        x: p.width,
        y: p.random(50, p.height - 50),
        speed: p.random(BASE_FISH_SPEED_MIN, BASE_FISH_SPEED_MAX) * currentSpeedMultiplier,
        size: p.random(30, 60),
        img: randomImage
      };
      fishes.push(newFish);
    }

    const currentTime = p.millis();
    if (currentTime - lastSpeedIncreaseTime >= SPEED_INCREASE_INTERVAL * 1000) {
      currentSpeedMultiplier += SPEED_INCREASE_AMOUNT;
      lastSpeedIncreaseTime = currentTime;
    }

    for (let i = fishes.length - 1; i >= 0; i--) {
      const fish = fishes[i];
      desenharEColidirPeixe(p, fish);
      if (gameOver) break;

      if (fish.x < -fish.size) {
        fishes.splice(i, 1);
      }
    }

    if (p.frameCount % 160 === 0) spawnBolha(p);

    atualizarBolhas(p);

    if (p.frameCount >= nextWhaleSpawn) {
      const newWhale = {
        x: p.width,
        y: p.random(50, p.height - 50),
        speed: p.random(BASE_FISH_SPEED_MIN, BASE_FISH_SPEED_MAX) * currentSpeedMultiplier * WHALE_SPEED_MULTIPLIER,
        size: WHALE_SIZE
      };
      whales.push(newWhale);
      nextWhaleSpawn = p.frameCount + p.int(p.random(WHALE_MIN_INTERVAL, WHALE_MAX_INTERVAL) * 60);
    }

    for (let i = whales.length - 1; i >= 0; i--) {
      const whale = whales[i];
      desenharEColidirBaleia(p, whale);
      if (gameOver) break;

      if (whale.x < -whale.size) {
        whales.splice(i, 1);
      }
    }
  };

  p.keyPressed = () => {
    if (!gameStarted || gameOver) return;
    
    if (!isMoving) {
      isMoving = true;
      character = characterImages[0];
    }
    
    if (p.key === 'w') {
      characterY -= 5;
    } else if (p.key === 's') {
      characterY += 5;
    } else if (p.key === 'a') {
      characterX -= 5;
    } else if (p.key === 'd') {
      characterX += 5;
    }
  };

  p.keyReleased = () => {
    isMoving = false;
  };

  p.windowResized = () => {
    p.resizeCanvas(window.innerWidth, window.innerHeight);
  };
}

function desenharEColidirPeixe(p, fish) {
  const fishW = fish.size;
  const fishH = fish.size / 1.5;

  const cxChar = characterX + 50;
  const cyChar = characterY + 50;
  const cxFish = fish.x + fishW / 2;
  const cyFish = fish.y + fishH / 2;

  p.image(fish.img, fish.x, fish.y, fishW, fishH);
  fish.x -= fish.speed;

  const d = p.dist(cxChar, cyChar, cxFish, cyFish);

  const rChar = 50;
  const rFish = Math.min(fishW, fishH) / 2;

  if (d < rChar + rFish) {
    fishes.splice(fishes.indexOf(fish), 1);
    vidas--;
    emitirSomDano();

    piscarVidaFrames = 15;
    
    if (vidas <= 0) {
      iniciaAnimacaoMorte();
    }
  }
}

function spawnBolha(p) {
  const size = p.random(MIN_BUBBLE_SIZE, MAX_BUBBLE_SIZE);
  bubbles.push({
    x: p.width,
    y: p.random(20, p.height - 20),
    speed: p.random(1, 3),
    size,
    img: bubbleImage
  });
}

function desenharBolha(p, bolha) {
  p.image(
    bolha.img,
    bolha.x,
    bolha.y,
    bolha.size,
    bolha.size
  );
  bolha.x -= bolha.speed;
}

function atualizarBolhas(p) {
  for (let i = bubbles.length - 1; i >= 0; i--) {
    const b = bubbles[i];
    desenharBolha(p, b);

    const charCenterX = characterX + 50;
    const charCenterY = characterY + 50;
    const bubbleCenterX = b.x + b.size / 2;
    const bubbleCenterY = b.y + b.size / 2;

    const distance = p.dist(charCenterX, charCenterY, bubbleCenterX, bubbleCenterY);

    if (distance < 50 + b.size / 2) {
      bubbles.splice(i, 1);
      emitirSomBolha(b.size)
      pontuacao++;

      continue;
    }

    if (b.x < -b.size) bubbles.splice(i, 1);
  }
}

function emitirSomBolha(bubbleSize) {
  const t = (bubbleSize - MIN_BUBBLE_SIZE) / (MAX_BUBBLE_SIZE - MIN_BUBBLE_SIZE);
  const vol = t * (MAX_VOLUME - MIN_VOLUME) + MIN_VOLUME;
  bubblePopSound.volume = Math.min(Math.max(vol, 0), 1);
  bubblePopSound.currentTime = 0;
  bubblePopSound.play();
}

function emitirSomGameOver() {
  gameOverSound.currentTime = 0;
  gameOverSound.volume = 0.5
  gameOverSound.play();
}

function resetGame(p) {
  fishes = [];
  bubbles = [];
  whales = [];
  characterX = 50;
  characterY = p.height / 2 - 50;
  gameOver = false;
  gameStarted = false;
  isMoving = false;
  character = paradoImg;
  vidas = MAX_VIDAS;
  pontuacao = 0;
  currentSpeedMultiplier = 1;
  lastSpeedIncreaseTime = p.millis();
  nextWhaleSpawn = p.frameCount + p.int(p.random(WHALE_MIN_INTERVAL, WHALE_MAX_INTERVAL) * 60);
  restartButton.hide();
  startButton.show();
  p.loop();
}

function iniciaAnimacaoMorte() {
  dying = true;
  deathVy = -8;
  deathAngle = 0;
  emitirSomGameOver();
}

function animacaoMorte(p) {
  deathVy += DEATH_GRAVITY;
  characterY += deathVy;
  deathAngle += DEATH_ANG_VEL;

  p.push();
  p.translate(characterX + 50, characterY + 50);
  p.rotate(deathAngle);
  p.image(characterImages[0], -50, -50, 100, 100);
  p.pop();

  if (characterY > p.height + 100) {
    dying = false;
    gameOver = true;
  }
}

function emitirSomGaivota() {
  seagullsSound.currentTime = 0;
  seagullsSound.volume = 0.7
  seagullsSound.play();
}

function emitirSomDano() {
  if (!audioContext || !danoBuffer) return;

  const source = audioContext.createBufferSource();
  source.buffer = danoBuffer;
  const gain = audioContext.createGain();
  gain.gain.value = 0.5;
  source.connect(gain);
  gain.connect(audioContext.destination);
  source.start(0);
}

function desenharEColidirBaleia(p, whale) {
  const whaleW = whale.size * 2;
  const whaleH = whale.size;

  const cxChar = characterX + 50;
  const cyChar = characterY + 50;
  const cxWhale = whale.x + whaleW / 2;
  const cyWhale = whale.y + whaleH / 2;

  p.image(whaleImage, whale.x, whale.y, whaleW, whaleH);
  whale.x -= whale.speed;

  const d = p.dist(cxChar, cyChar, cxWhale, cyWhale);
  const rChar = 50;
  const rWhale = Math.min(whaleW, whaleH) / 2;

  if (d < rChar + rWhale) {
    whales.splice(whales.indexOf(whale), 1);
    vidas -= 2;
    emitirSomDano();
    piscarVidaFrames = 15;
    
    if (vidas <= 0) {
      iniciaAnimacaoMorte();
    }
  }
}
