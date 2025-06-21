import parado from '/parado.png';
import nadando1 from '/nadando_1.png';
import nadando2 from '/nadando_2.png';
import bubble_pop_sound from '/bubble_pop.mp3';
import game_over_sound from '/game_over.wav';
import seagulls_sound from '/seagulls_sound.wav';
import dano_sound from '/dano_sound.wav';
import extra_life_sound from '/extra_life.wav';


let character;
let characterImages = [];
let characterPos;
let characterVel;
let characterIndex = 0;
let fishes = [];
let fishImages = [];
let isMoving = false;
let gameOver = false;
let vidas = 5;
let piscarVidaFrames = 0;
let audioContext;
let danoBuffer;
let pontuacao = 0;

const MIN_BUBBLE_SIZE = 30;
const MAX_BUBBLE_SIZE = 50;
const MIN_VOLUME = 0.2;
const MAX_VOLUME = 1.0;
const MAX_VIDAS = 5;
const LIFE_CHANCE = 0.1;
let extraLifeSound;
let bubbles = [];
let bubbleImage;
let lifeIconImage;
let bubblePopSound;

let gameOverSound;
let restartButton;

//Para animação de morte do personagem
let dying = false;
let deathVel;    // p5.Vector para velocidade de queda
let deathAcc;    // p5.Vector para aceleração (gravidade)
let deathAngle;
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


    // Load images asynchronously
    characterImages = await Promise.all([p.loadImage(nadando1), p.loadImage(nadando2)]);
    character = await p.loadImage(parado);
    characterPos = p.createVector(50, p.height/2 - 50);
    characterVel = p.createVector(0, 0);
    deathVel   = p.createVector(0, 0);
    deathAcc   = p.createVector(0, DEATH_GRAVITY);
    deathAngle = 0;

    const fishFilenames = [
      '/peixe_azul.png',
      '/peixe_roxo.png',
      '/peixe_amarelo.png',
      '/peixe_verde.png',
      '/peixe_vermelho.png'
    ];
    fishImages = await Promise.all(fishFilenames.map(filename => p.loadImage(filename)));

    bubbleImage = await p.loadImage('/bubble.png');
    lifeIconImage  = await p.loadImage('/life-icon.webp'); 

    bubblePopSound = new Audio(bubble_pop_sound);
    gameOverSound = new Audio(game_over_sound);
    extraLifeSound = new Audio(extra_life_sound);

    // cria o botão e esconde
    restartButton = p.createButton('↻ Restart');
    restartButton.position(20, 20);
    restartButton.style('font-size', '18px');
    restartButton.mousePressed(() => resetGame(p));
    restartButton.hide();

    seagullsSound = new Audio(seagulls_sound)
    // agenda o primeiro som num intervalo entre 300 e 1000 frames
    nextSeagullFrame = p.frameCount + p.int(p.random(300, 1000));

  };

  p.draw = () => {
    p.clear();
    // Exibir vidas restantes
    p.textSize(24);
    p.textAlign(p.LEFT, p.TOP);
    
    // Pisca em vermelho claro se levou dano
    if (piscarVidaFrames > 0) {
      const alpha = p.map(piscarVidaFrames, 0, 15, 0, 255);
      p.fill(255, 100, 100, alpha); // vermelho claro com opacidade
      piscarVidaFrames--;
    } else {
      p.fill(255); // branco normal
    }
    
    p.text(`❤️ ${vidas} + Lifes   |   💠 ${pontuacao} + Points`, 20, 20);

    // checa se já passou do frame agendado
    if (p.frameCount >= nextSeagullFrame) {
      emitirSomGaivota();

      // agenda o próximo em 300 a 1000 frames
      nextSeagullFrame = p.frameCount + p.int(p.random(300, 1000));
    }

    //Se estiver morrendo, faz a animação de queda
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
      p.text(`💠 Bolhas coletadas: ${pontuacao}`, p.width / 2, p.height / 2 + 20);
    
      // mostra e centraliza o botão de restart
      restartButton.show();
      const bw = restartButton.elt.offsetWidth;
      const bh = restartButton.elt.offsetHeight;
      restartButton.position(
        p.width / 2 - bw / 2,
        (p.height / 2 - bh / 2) + 100
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

    characterPos.add(characterVel);
    p.image(character, characterPos.x, characterPos.y, 100, 100);

    if (p.frameCount % 60 === 0) {
      spawnFish(p, fishImages);
    }

    for (let i = fishes.length - 1; i >= 0; i--) {
      const fish = fishes[i];
      desenharEColidirPeixe(p, fish, i);
    }

    // Spawn de bolhas (por exemplo, a cada 80 frames)
    if (p.frameCount % 160 === 0) spawnBolha(p);

    // Desenha e atualiza bolhas
    atualizarBolhas(p);
  };

  p.keyPressed = () => {
    isMoving = true;
    if (p.key === 'w') {
      characterVel.set(0, -5);
    } else if (p.key === 's') {
      characterVel.set(0,  5);
    } else if (p.key === 'a') {
      characterVel.set(-5, 0);
    } else if (p.key === 'd') {
      characterVel.set( 5, 0);
    }
  };

  p.keyReleased = () => {
    isMoving = false;
    characterVel.set(0, 0);
  };

  p.windowResized = () => {
    p.resizeCanvas(window.innerWidth, window.innerHeight);
  };
}


function desenharEColidirPeixe(p, fish, index) {
  const w = fish.size;
  const h = fish.size / 1.5;

  // Desenha peixe
  p.image(fish.img, fish.pos.x, fish.pos.y, w, h);

  // Move o peixe
  fish.pos.add(fish.vel);

  // Colisão
  const charCenter = characterPos.copy().add(50, 50);
  const fishCenter = fish.pos.copy().add(w / 2, h / 2);
  const d = charCenter.dist(fishCenter);
  const rChar = 50;
  const rFish = Math.min(w, h) / 2;

  if (d < rChar + rFish) {
    fishes.splice(index, 1);
    vidas--;
    emitirSomDano();
    piscarVidaFrames = 15;
    if (vidas <= 0) iniciaAnimacaoMorte();
  }
}

function spawnBolha(p) {
  const pos = p.createVector(p.width, p.random(20, p.height - 20));
  const vel = p.createVector(-p.random(1,3), 0);
  const size = p.random(MIN_BUBBLE_SIZE, MAX_BUBBLE_SIZE);

  const isLife = p.random() < LIFE_CHANCE;
  const img = isLife ? lifeIconImage : bubbleImage;

  if (isLife) {
    bubbles.push({ pos, vel, size: 30, img,  isLife });
  } else{
    bubbles.push({ pos, vel, size, img,  isLife });
  }
}

function atualizarBolhas(p) {
  for (let i = bubbles.length - 1; i >= 0; i--) {
    const b = bubbles[i];

    // Desenha e atualiza posição da bolha
    p.image(b.img, b.pos.x, b.pos.y, b.size, b.size);
    b.pos.add(b.vel);

    // Calcula centros usando cópias dos vetores
    const charCenter = characterPos.copy().add(50, 50);
    const bubbleCenter = b.pos.copy().add(b.size/2, b.size/2);

    // Distância por instância também
    const dist = charCenter.dist(bubbleCenter);
    const rChar   = 50;
    const rBubble = b.size / 2;

    // Colisão
    if (dist < rChar + rBubble) {
      bubbles.splice(i, 1);
      if(b.isLife){
        vidas = Math.min(vidas + 1, MAX_VIDAS);
        emitirSomVidaExtra();
      } else {
        emitirSomBolha(b.size);
        pontuacao++;
      }
    }

    // Remove bolha que saiu da tela
    if (b.pos.x < -b.size) {
      bubbles.splice(i, 1);
    }
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

function spawnFish(p, images) {
  const size = p.random(30, 60);
  const pos  = p.createVector(p.width, p.random(50, p.height - 50));
  const vel  = p.createVector(-p.random(2, 5), 0);

  const imgIndex = Math.floor(p.random(images.length));
  const img = images[imgIndex];

  fishes.push({ pos, vel, size, img });
}

function emitirSomGameOver() {
  gameOverSound.currentTime = 0;
  gameOverSound.volume = 0.5
  gameOverSound.play();
}

function resetGame(p) {
  // limpa tudo
  fishes = [];
  bubbles = [];
  characterPos.x = 50;
  characterPos.y = p.height / 2 - 50;
  gameOver = false;
  vidas = MAX_VIDAS; // ← resetando as vidas 
  pontuacao = 0;
  restartButton.hide();
  p.loop();
}

function iniciaAnimacaoMorte() {
   dying = true;
  deathVel.set(0, -8); // “pulo” inicial pra cima
  deathAcc.set(0, DEATH_GRAVITY); // gravidade
  deathAngle = 0; // zera o ângulo antes de começar a girar
  emitirSomGameOver();
}

function animacaoMorte(p) {
  deathVel.add(deathAcc);
  characterPos.add(deathVel);
  deathAngle += DEATH_ANG_VEL;       

  // Desenha o personagem girando em torno do centro
  p.push();
    p.translate(characterPos.x + 50, characterPos.y + 50);
    p.rotate(deathAngle);
    p.image(characterImages[0], -50, -50, 100, 100);
  p.pop();

  // Quando cair além da tela, termina a animação
  if (characterPos.y > p.height + 100) {
    dying   = false; // para animação
    gameOver = true; // habilita tela de Game Over
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
  gain.gain.value = 0.5; // volume
  source.connect(gain);
  gain.connect(audioContext.destination);
  source.start(0);
}

function emitirSomVidaExtra() {
  extraLifeSound.currentTime = 0;
  extraLifeSound.volume = 0.7
  extraLifeSound.play();
}
