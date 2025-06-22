export class UI {
    constructor() {
      this.startButton = null;
      this.aboutButton = null;
      this.backButton = null;
      this.restartButton = null;
      this.showAbout = false;
    }
  
    createButtons(p, onStart, onAbout, onBack, onRestart) {
      this.startButton = p.createButton('Iniciar');
      this.startButton.position(p.width / 2 - 150, p.height / 2 + 50);
      this.startButton.style('background-color', '#0066cc');
      this.startButton.style('color', 'white');
      this.startButton.style('border', 'none');
      this.startButton.style('padding', '15px 30px');
      this.startButton.style('font-size', '20px');
      this.startButton.style('border-radius', '5px');
      this.startButton.style('cursor', 'pointer');
      this.startButton.mousePressed(onStart);
  
      this.aboutButton = p.createButton('Sobre');
      this.aboutButton.position(p.width / 2 + 20, p.height / 2 + 50);
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
    }
  
    showStartAbout() {
      this.startButton.show();
      this.aboutButton.show();
      this.backButton.hide();
    }
  
    showBack() {
      this.backButton.show();
      this.startButton.hide();
      this.aboutButton.hide();
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
  }