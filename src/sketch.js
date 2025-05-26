import parado from '/parado.png';
import nadando1 from '/nadando_1.png';
import nadando2 from '/nadando_2.png';
import bubble_pop_sound from '/bubble_pop.mp3';

let character;
let characterImages = [];
let characterIndex = 0;
let characterX = 50;
let characterY;
let fishes = [];
let fishImages = [];
let isMoving = false;


const MIN_BUBBLE_SIZE = 30;
const MAX_BUBBLE_SIZE = 50;
const MIN_VOLUME = 0.2;
const MAX_VOLUME = 1.0;
let bubbles = [];
let bubbleImage;
let bubblePopSound;

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
  };

  p.draw = () => {
    p.clear();

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
      fish.x -= fish.speed;
      p.image(fish.img, fish.x, fish.y, fish.size, fish.size / 1.5);

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
