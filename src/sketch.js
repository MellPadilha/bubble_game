import parado from '/parado.png';
import nadando1 from '/nadando_1.png';
import nadando2 from '/nadando_2.png';

let character;
let characterImages = [];
let characterIndex = 0;
let characterX = 50;
let characterY;
let fishes = [];
let fishImages = [];
let isMoving = false;

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
