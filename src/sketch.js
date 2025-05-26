import parado from '/parado.png';
import nadando1 from '/nadando_1.png';
import nadando2 from '/nadando_2.png';
import bubble_pop_sound from '/bubble_pop.mp3';
import game_over_sound from '/game_over.wav';

let character;
let characterImages = [];
let characterIndex = 0;
let characterX = 50;
let characterY;
let fishes = [];
let fishImages = [];
let isMoving = false;
let gameOver = false;


const MIN_BUBBLE_SIZE = 30;
const MAX_BUBBLE_SIZE = 50;
const MIN_VOLUME = 0.2;
const MAX_VOLUME = 1.0;
let bubbles = [];
let bubbleImage;
let bubblePopSound;

let gameOverSound;
let restartButton;

//Para animação de morte do personagem
let dying       = false;
let deathVy     = 0;
let deathAngle  = 0;
const DEATH_GRAVITY  = 0.5;
const DEATH_ANG_VEL  = 0.15;


export function createSketch(p) {
  p.setup = async () => {
    p.createCanvas(window.innerWidth, window.innerHeight);
    p.frameRate(60);

    // Load images asynchronously
    characterImages = await Promise.all([p.loadImage(nadando1), p.loadImage(nadando2)]);
    character = await p.loadImage(parado);
    characterY = p.height / 2 - 50;

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

    // cria o botão e esconde
    restartButton = p.createButton('↻ Restart');
    restartButton.position(20, 20);
    restartButton.style('font-size', '18px');
    restartButton.mousePressed(() => resetGame(p));
    restartButton.hide();

  };

  p.draw = () => {
    p.clear();


    //Se estiver morrendo, faz a animação de queda
    if (dying) {
      animateDeath(p);
      return;
    }

    if (gameOver) {
      p.fill(255, 255, 255);
      p.textSize(64);
      p.textAlign(p.CENTER, p.CENTER);
      p.text('Game Over', p.width / 2, p.height / 2);
      
      // mostra e centraliza o botão de restart
      restartButton.show();
      const bw = restartButton.elt.offsetWidth;
      const bh = restartButton.elt.offsetHeight;
      restartButton.position(
        p.width/2 - bw/2,
        (p.height/2 - bh/2) + 100
      );
      return;
    }

    const frameDelay = 10; // Altere para ajustar a suavidade (quanto maior, mais lento)

    if (isMoving) {
      if (p.frameCount % frameDelay === 0) {
        characterIndex = (characterIndex + 1) % characterImages.length;
      }
      character = characterImages[characterIndex];
    } else {
      character = characterImages[0];
    }
    // Personagem parado ou em movimento
    p.image(character, characterX, characterY, 100, 100);

    if (p.frameCount % 60 === 0) {
      const randomImage = fishImages[Math.floor(p.random(fishImages.length))];
      const newFish = {
        x: p.width,
        y: p.random(50, p.height - 50),
        speed: p.random(2, 5),
        size: p.random(30, 60),
        img: randomImage
      };
      fishes.push(newFish);
    }

    for (let i = fishes.length - 1; i >= 0; i--) {
      const fish = fishes[i];
      desenharEColidirPeixe(p, fish);
      if (gameOver) break;


      if (fish.x < -fish.size) {
        fishes.splice(i, 1);
      }
    }

     // Spawn de bolhas (por exemplo, a cada 80 frames)
     if (p.frameCount % 160 === 0) spawnBolha(p);

     // Desenha e atualiza bolhas
     atualizarBolhas(p);
  };

  p.keyPressed = () => {
    isMoving = true;
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
  // tamanho desenhado
  const fishW = fish.size;
  const fishH = fish.size / 1.5;

  const cxChar = characterX + 50;      // personagem 100×100 = raio 50
  const cyChar = characterY + 50;
  const cxFish = fish.x + fishW / 2;
  const cyFish = fish.y + fishH / 2;

  // desenha e move o peixe
  p.image(fish.img, fish.x, fish.y, fishW, fishH);
  fish.x -= fish.speed;

  // calcula distância dos centros
  const d = p.dist(cxChar, cyChar, cxFish, cyFish);

  const rChar = 50;
  const rFish = Math.min(fishW, fishH) / 2;

  if (d < rChar + rFish) {
    startDeathAnimation();
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

    // Calcula os centros do personagem e da bolha
    const charCenterX = characterX + 50; // personagem tem 100 de largura
    const charCenterY = characterY + 50; // personagem tem 100 de altura
    const bubbleCenterX = b.x + b.size / 2;
    const bubbleCenterY = b.y + b.size / 2;

    //Calcula a distância entre personagem e bolha
    const distance = p.dist(charCenterX, charCenterY, bubbleCenterX, bubbleCenterY);

    // Raio do personagem = 50 (metade de 100), raio da bolha = b.size/2
    if (distance < 50 + b.size / 2) {
      // Houve colisão, então remove a bolha
      bubbles.splice(i, 1);
      emitirSomBolha(b.size)

      continue; 
    }

    // Remove bolhas que sairem da tela
    if (b.x < -b.size) bubbles.splice(i, 1);
  }
}

function emitirSomBolha(bubbleSize) {
  // normaliza tamanho entre 0 e 1
  const t = (bubbleSize - MIN_BUBBLE_SIZE) / (MAX_BUBBLE_SIZE - MIN_BUBBLE_SIZE);
  // mapeia para o intervalo de volume desejado
  const vol = t * (MAX_VOLUME - MIN_VOLUME) + MIN_VOLUME;
  // garante ficar entre 0.0 e 1.0
  bubblePopSound.volume = Math.min(Math.max(vol, 0), 1);
  // reinicia e toca
  bubblePopSound.currentTime = 0;
  bubblePopSound.play();
}

function emitirSomGameOver(){
  gameOverSound.currentTime = 0;
  gameOverSound.volume = 0.5
  gameOverSound.play();
}

function resetGame(p) {
  // limpa tudo
  fishes = [];
  bubbles = [];
  characterX = 50;
  characterY = p.height / 2 - 50;
  gameOver = false;
  // esconde o botão
  restartButton.hide();
  // recomeça o loop
  p.loop();
}

function startDeathAnimation() {
  dying      = true;
  deathVy    = -8;   // “pulo” inicial pra cima
  deathAngle = 0;    // sem giro no início
  // toca o som de morrer
  emitirSomGameOver();
}

function animateDeath(p) {
  // Física da queda
  deathVy += DEATH_GRAVITY;
  characterY += deathVy;
  deathAngle += DEATH_ANG_VEL;

  // Rotaciona personagem
  p.push();
  p.translate(characterX + 50, characterY + 50);
  p.rotate(deathAngle);
  p.image(characterImages[0], -50, -50, 100, 100);
  p.pop();

  // Quando acabar de cair faz o set de game over
  if (characterY > p.height + 100) {
    dying    = false;   // parar animação
    gameOver = true;    // habilita tela de Game Over
  }
}
