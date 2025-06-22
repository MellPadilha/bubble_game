export class UI {
    constructor() {
      this.startButton = null;
      this.aboutButton = null;
      this.backButton = null;
      this.restartButton = null;
      this.playAgainButton = null;
      this.showAbout = false;
    }
  
    createButtons(p, onStart, onAbout, onBack, onRestart, onPlayAgain) {
      this.startButton = p.createButton('Iniciar');
      this.startButton.position(p.width / 2 - 100, p.height / 2 + 50);
      this.startButton.style('background-color', '#0066cc');
      this.startButton.style('color', 'white');
      this.startButton.style('border', 'none');
      this.startButton.style('padding', '15px 30px');
      this.startButton.style('font-size', '20px');
      this.startButton.style('border-radius', '5px');
      this.startButton.style('cursor', 'pointer');
      this.startButton.mousePressed(onStart);
  
      this.aboutButton = p.createButton('Sobre');
      this.aboutButton.position(p.width / 2 - 100, p.height / 2 + 120);
      this.aboutButton.style('background-color', '#888');
      this.aboutButton.style('color', 'white');
      this.aboutButton.style('border', 'none');
      this.aboutButton.style('padding', '15px 30px');
      this.aboutButton.style('font-size', '20px');
      this.aboutButton.style('border-radius', '5px');
      this.aboutButton.style('cursor', 'pointer');
      this.aboutButton.mousePressed(onAbout);
  
      this.backButton = p.createButton('Voltar');
      this.backButton.position(p.width / 2 - 50, p.height - 100);
      this.backButton.style('background-color', '#0066cc');
      this.backButton.style('color', 'white');
      this.backButton.style('border', 'none');
      this.backButton.style('padding', '10px 20px');
      this.backButton.style('font-size', '18px');
      this.backButton.style('border-radius', '5px');
      this.backButton.style('cursor', 'pointer');
      this.backButton.hide();
      this.backButton.mousePressed(onBack);
  
      this.restartButton = p.createButton('↻ Restart');
      this.restartButton.position(20, 20);
      this.restartButton.style('background-color', '#0066cc');
      this.restartButton.style('color', 'white');
      this.restartButton.style('border', 'none');
      this.restartButton.style('padding', '15px 30px');
      this.restartButton.style('font-size', '20px');
      this.restartButton.style('border-radius', '5px');
      this.restartButton.style('cursor', 'pointer');
      this.restartButton.mousePressed(onRestart);
      this.restartButton.hide();
  
      this.playAgainButton = p.createButton('Play Again');
      this.playAgainButton.position(p.width / 2 - 50, p.height / 2 + 100);
      this.playAgainButton.style('background-color', '#0066cc');
      this.playAgainButton.style('color', 'white');
      this.playAgainButton.style('border', 'none');
      this.playAgainButton.style('padding', '15px 30px');
      this.playAgainButton.style('font-size', '20px');
      this.playAgainButton.style('border-radius', '5px');
      this.playAgainButton.style('cursor', 'pointer');
      this.playAgainButton.mousePressed(onPlayAgain);
      this.playAgainButton.hide();
    }
  
    showStartAbout() {
      this.startButton.show();
      this.aboutButton.show();
      this.backButton.hide();
      this.playAgainButton.hide();
    }
  
    showBack() {
      this.backButton.show();
      this.startButton.hide();
      this.aboutButton.hide();
      this.playAgainButton.hide();
    }
  
    showRestart(p) {
      this.restartButton.show();
      const bw = this.restartButton.elt.offsetWidth;
      const bh = this.restartButton.elt.offsetHeight;
      this.restartButton.position(p.width / 2 - bw / 2, p.height / 2 + 100 - bh / 2);
    }
  
    hideRestart() {
      this.restartButton.hide();
    }

    showPlayAgain(p) {
      this.playAgainButton.show();
      const bw = this.playAgainButton.elt.offsetWidth;
      const bh = this.playAgainButton.elt.offsetHeight;
      this.playAgainButton.position(p.width / 2 - bw / 2, p.height / 2 + 150 - bh / 2);
    }

    hidePlayAgain() {
      this.playAgainButton.hide();
    }
  }