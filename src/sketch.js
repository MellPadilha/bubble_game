import { Game } from './components/Game';

// Instância principal para p5.js
export function createSketch(p) {
  let game;
  p.setup = async () => {
    p.createCanvas(window.innerWidth, window.innerHeight);
    p.frameRate(60);
    game = new Game(p);
    await game.preload();
    game.setupUI();
  };

  p.draw = () => {
    if (game) game.draw();
  };

  p.keyPressed = () => {
    if (!game) return; // Garante que o objeto foi criado
    if (!game.gameStarted || game.gameOver) return;
    
    if (p.key === 'f' || p.key === 'F') {
      // Atirar bolha no boss
      if (game.isBossFight) {
        game.spawnPlayerBubble();
      }
      return;
    }
    
    if (!game.player.isMoving) {
      game.player.isMoving = true;
      game.player.img = game.characterImages[0];
    }
    game.player.move(p.key);
  };
  

  p.keyReleased = () => {
    if (!game) return; // Garante que o objeto foi criado
    if (game) game.player.isMoving = false;
  };

  p.windowResized = () => {
    p.resizeCanvas(window.innerWidth, window.innerHeight);
  };
}
