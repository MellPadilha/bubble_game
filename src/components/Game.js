import { Player } from "./Player";
import { UI } from "./UI";
import { Fish } from "./Finish";
import { Whale } from "./While";
import { MenuBubble } from "./MenuBubble";
import { Bubble } from "./Bubble";
import { FinalBoss } from "./FinalBoss";
import parado from '/src/assets/images/parado.png';
import nadando1 from '/src/assets/images/nadando_1.png';
import nadando2 from '/src/assets/images/nadando_2.png';
import bubble_pop_sound from '/src/assets/sounds/bubble_pop.mp3';
import game_over_sound from '/src/assets/sounds/game_over.wav';
import seagulls_sound from '/src/assets/sounds/seagulls_sound.wav';
import dano_sound from '/src/assets/sounds/dano_sound.wav';
import baleia from '/src/assets/images/baleia.png';
import bossFinal from '/src/assets/images/boss_final.png';
import bossBubble from '/src/assets/images/boss_bubble.png';
import {
    BASE_FISH_SPEED_MAX,
    BASE_FISH_SPEED_MIN, 
    BURST_BUBBLE_COUNT, 
    DURACAO_MENSAGEM_FASE, 
    INITIAL_SPAWN_DELAY, 
    MAX_BUBBLE_SIZE, 
    MAX_VIDAS, 
    MAX_VOLUME, 
    MENU_BUBBLE_SPAWN_RATE, 
    MIN_BUBBLE_SIZE, 
    MIN_VOLUME, 
    SPEED_INCREASE_AMOUNT, 
    SPEED_INCREASE_INTERVAL, 
    WHALE_MAX_INTERVAL, 
    WHALE_MIN_INTERVAL, 
    WHALE_SIZE, 
    WHALE_SPEED_MULTIPLIER 
    } from "../utils/constants";

export class Game {
    constructor(p) {
      this.p = p;
      this.audioContext = null;
      this.danoBuffer = null;
      this.seagullsSound = null;
      this.bubblePopSound = null;
      this.gameOverSound = null;
      this.player = null;
      this.fishes = [];
      this.fishImages = [];
      this.bubbles = [];
      this.whales = [];
      this.menuBubbles = [];
      this.bubbleImage = null;
      this.whaleImage = null;
      this.gameLogo = null;
      this.characterImages = [];
      this.paradoImg = null;
      this.bossFinalImage = null;
      this.bossBubbleImage = null;
      this.finalBoss = null;
      this.isBossFight = false;
      this.playerBubbles = [];
      this.lastPlayerBubbleSpawn = 0;
      this.playerBubbleCooldown = 500; // 500ms entre tiros
      this.gameOver = false;
      this.gameStarted = false;
      this.victory = false;
      this.victorySoundPlayed = false;
      this.vidas = MAX_VIDAS;
      this.piscarVidaFrames = 0;
      this.pontuacao = 0;
      this.currentSpeedMultiplier = 1;
      this.lastSpeedIncreaseTime = 0;
      this.nextWhaleSpawn = 0;
      this.nextSeagullFrame = 0;
      this.gameStartTime = 0;
      this.faseAtual = 1;
      this.mostrarMensagemFase = false;
      this.tempoMensagemFase = 0;
      this.ui = new UI();
      this.showAbout = false;
      this.gameOverSoundPlayed = false;
      this.contagemRegressiva = false;
    this.valorContagem = 3;
    this.tempoContagem = 0;
    this.tempoGo = 0;
    this.bossMessageStartTime = 0; // Tempo de início da mensagem do boss

    }
  
    async preload() {
      this.audioContext = new (window.AudioContext)();
      const response = await fetch(dano_sound);
      const arrayBuffer = await response.arrayBuffer();
      this.danoBuffer = await this.audioContext.decodeAudioData(arrayBuffer);
  
      this.paradoImg = await this.p.loadImage(parado);
      this.characterImages = await Promise.all([this.p.loadImage(nadando1), this.p.loadImage(nadando2)]);
      this.whaleImage = await this.p.loadImage(baleia);
      this.bossFinalImage = await this.p.loadImage(bossFinal);
      this.bossBubbleImage = await this.p.loadImage(bossBubble);
      this.gameLogo = await this.p.loadImage('/src/assets/images/game_logo.png');
      const fishFilenames = [
        '/src/assets/images/peixe_azul.png',
        '/src/assets/images/peixe_roxo.png',
        '/src/assets/images/peixe_amarelo.png',
        '/src/assets/images/peixe_verde.png',
        '/src/assets/images/peixe_vermelho.png'
      ];
      this.fishImages = await Promise.all(fishFilenames.map(filename => this.p.loadImage(filename)));
      this.bubbleImage = await this.p.loadImage('/src/assets/images/bubble.png');
      this.bubblePopSound = new Audio(bubble_pop_sound);
      this.gameOverSound = new Audio(game_over_sound);
      this.seagullsSound = new Audio(seagulls_sound);
  
      this.player = new Player(this.characterImages, this.paradoImg, 50, this.p.height / 2 - 50, 5);
    }
  
    setupUI() {
      this.ui.createButtons(
        this.p,
        () => { // onStart
            this.createBurstEffect();
            this.contagemRegressiva = true;
            this.valorContagem = 3;
            this.tempoContagem = this.p.millis();
            this.ui.startButton.hide();
            this.ui.aboutButton.hide();
            this.ui.testBossButton.hide();
            this.menuBubbles = [];
          },
          
        () => { // onAbout
          this.showAbout = true;
          this.ui.showBack();
        },
        () => { // onBack
          this.showAbout = false;
          this.ui.showStartAbout();
        },
        () => { // onRestart
          this.reset();
        },
        () => { // onTestBoss
          this.testBossMode();
        },
        () => { // onPlayAgain
          this.reset();
        }
      );
    }
  
    draw() {
      const p = this.p;
      p.clear();

      if (this.contagemRegressiva) {
        const tempoAtual = this.p.millis();
        const tempoDecorrido = tempoAtual - this.tempoContagem;
      
        if (this.valorContagem > 0) {
          if (tempoDecorrido > 1000) {
            this.valorContagem--;
            this.tempoContagem = tempoAtual;
          }
      
          this.p.push();
          this.p.fill(255);
          this.p.textAlign(this.p.CENTER, this.p.CENTER);
          this.p.textSize(120);
          this.p.text(this.valorContagem, this.p.width / 2, this.p.height / 2);
          this.p.pop();
          return;
        } else if (this.tempoGo === 0) {
          this.tempoGo = tempoAtual;
        }
      
        if (tempoAtual - this.tempoGo < 1000) {
          this.p.push();
          this.p.fill(255, 255, 0);
          this.p.textAlign(this.p.CENTER, this.p.CENTER);
          this.p.textSize(100);
          this.p.text("GO!", this.p.width / 2, this.p.height / 2);
          this.p.pop();
          return;
        }
      
        this.contagemRegressiva = false;
        this.tempoGo = 0;
        this.gameStarted = true;
        this.gameStartTime = this.p.millis();
      }
      
    
      if (!this.gameStarted) {
        if (this.showAbout) {
          p.push();
          // Fundo escurecido
          p.fill(0, 180);
          p.noStroke();
          p.rect(0, 0, p.width, p.height);
    
          // Card centralizado com sombra
          const cardWidth = p.width * 0.7;
          const cardHeight = Math.min(p.height * 0.9, 700);
          const cardX = (p.width - cardWidth) / 2;
          const cardY = (p.height - cardHeight) / 2;
    
          // Sombra do card
          p.fill(0, 100);
          p.noStroke();
          p.rect(cardX + 10, cardY + 10, cardWidth, cardHeight, 28);
    
          // Card branco com borda azul e cantos arredondados
          p.fill(255);
          p.stroke(50, 150, 200);
          p.strokeWeight(4);
          p.rect(cardX, cardY, cardWidth, cardHeight, 28);
    
          // Título estilizado
          p.fill(50, 100, 200);
          p.noStroke();
          p.textAlign(p.CENTER, p.TOP);
          p.textSize(42);
          p.text('Sobre o Jogo', p.width / 2, cardY + 32);
    
          // Texto da descrição com espaçamento, alinhamento e destaque
          p.fill(30);
          p.textSize(14);
          p.textAlign(p.LEFT, p.TOP);
          const padding = 48;
          const textX = cardX + padding;
          const textY = cardY + 100;
          const textWidth = cardWidth - 2 * padding;
    
          const description =
            "🫧 **Uma aventura subaquática cheia de desafios e magia!**\n" +
            "Você está pronto para mergulhar em um mundo onde cada bolha pode ser a diferença entre a vitória e o fracasso? " +
            "Em *Bubble Game*, você assume o papel de **Bubbly**, um destemido explorador dos sete mares, em busca das lendárias Bolhas de Luz — bolhas mágicas que, segundo a lenda, concedem sorte e alegria a quem as coleta.\n" +
            "⚠️ **Mas cuidado!** As águas estão repletas de peixes travessos e baleias gigantes, guardiões naturais desse tesouro submerso. Eles farão de tudo para impedir que você alcance seu objetivo. Com reflexos rápidos, "+
            "coragem e um pouco de estratégia, você precisa desviar dos perigos, coletar o máximo de bolhas possível e provar que é o verdadeiro mestre dos oceanos!\n" +
            "💨 Cada fase traz novos desafios e aumenta a velocidade da correnteza, testando seus limites e sua habilidade de sobreviver nas profundezas. O mar é lindo, mas só os mais habilidosos conseguem chegar ao topo do placar!\n" +
            "✨ Entre nessa jornada mágica, desafie seus amigos, bata recordes e descubra até onde você consegue ir nesse universo de bolhas, cores e emoção!\n" +
            "🫧 **Prepare-se: as bolhas estão esperando por você. O oceano nunca foi tão divertido!**";
    
          // Função para desenhar texto multiline (quebra automática)
          function drawMultilineText(p, text, x, y, maxWidth, lineHeight) {
            const paragraphs = text.split('\n');
            let currY = y;
            for (let para of paragraphs) {
              let words = para.split(' ');
              let line = '';
              for (let n = 0; n < words.length; n++) {
                let testLine = line + words[n] + ' ';
                let testWidth = p.textWidth(testLine);
                if (testWidth > maxWidth && n > 0) {
                  p.text(line, x, currY, maxWidth, lineHeight);
                  line = words[n] + ' ';
                  currY += lineHeight;
                } else {
                  line = testLine;
                }
              }
              p.text(line, x, currY, maxWidth, lineHeight);
              currY += lineHeight * 1.3;
            }
          }
    
          drawMultilineText(p, description, textX, textY, textWidth, 24);
    
          // Desenvolvedores no rodapé do card
          p.textAlign(p.CENTER, p.BOTTOM);
          p.textSize(20);
          p.fill(80, 80, 80);
          p.text(
            'Desenvolvedores: Johnny Carvalho - Mellanie Taveira - Rafael Giroldo - Vinícius Kuchnir',
            p.width / 2,
            cardY + cardHeight - 78
          );
    
          p.pop();
          return;
        }
    
        // Tela inicial padrão
        const logoWidth = 500;
        const logoHeight = 500;
        p.image(this.gameLogo, p.width / 2 - logoWidth / 2, p.height / 2 - logoHeight - 150, logoWidth, logoHeight);
    
        if (p.frameCount % MENU_BUBBLE_SPAWN_RATE === 0) {
          this.spawnMenuBubble();
        }
        this.updateMenuBubbles();
        this.player.draw(p);
        return;
      }
  
      if (this.mostrarMensagemFase && p.millis() - this.tempoMensagemFase < DURACAO_MENSAGEM_FASE) {
        // Não mostrar mensagem de fase durante boss fight
        if (!this.isBossFight) {
          p.push();
          p.textAlign(p.CENTER, p.TOP);
          p.textSize(48);
          p.fill(0, 180);
          p.rect(0, 0, p.width, 80);
          p.fill(255, 220, 40);
          p.text(`Fase ${this.faseAtual}`, p.width / 2, 20);
          p.pop();
        }
      } else if (this.mostrarMensagemFase) {
        this.mostrarMensagemFase = false;
      }

      // Mensagem do boss na fase 4
      if (this.isBossFight) {
        p.push();
        p.textAlign(p.CENTER, p.TOP);
        p.textSize(24);
        p.fill(255, 0, 0);
        // Mostrar mensagem apenas por 30 segundos a partir do início do boss fight
        if (p.millis() - this.bossMessageStartTime < 30000) {
          p.text("Use F para atirar bolhas!", p.width / 2, 60);
        }
        p.pop();
      }
  
      p.textSize(24);
      p.textAlign(p.LEFT, p.TOP);
      if (this.piscarVidaFrames > 0) {
        const alpha = p.map(this.piscarVidaFrames, 0, 15, 0, 255);
        p.fill(255, 100, 100, alpha);
        this.piscarVidaFrames--;
      } else {
        p.fill(255);
      }
      p.text(`❤️ ${this.vidas} Lifes   |   🫧 ${this.pontuacao} Points`, 20, 20);
  
      if (p.frameCount >= this.nextSeagullFrame) {
        this.emitirSomGaivota();
        this.nextSeagullFrame = p.frameCount + p.int(p.random(300, 1000));
      }
  
      if (this.player.dying) {
        if (this.player.deathAnimation(p)) {
          this.emitirSomGameOver();
          this.player.dying = false;
          this.gameOver = true;
        }
        return;
      }
      
  
      if (this.gameOver) {
        p.fill(255);
        p.textSize(64);
        p.textAlign(p.CENTER, p.CENTER);
        p.text('Game Over', p.width / 2, p.height / 2 - 40);
        p.textSize(32);
        p.text(`Bolhas coletadas: ${this.pontuacao}`, p.width / 2, p.height / 2 + 20);
        this.ui.showRestart(p);
        return;
      }

      if (this.victory) {
        this.showVictoryScreen(p);
        return;
      }
  
      this.player.animate(p.frameCount, 10);
      this.player.draw(p);
  
      // Spawn de peixes reduzido na fase 4
      if (p.frameCount % 60 === 0 && p.millis() - this.gameStartTime > INITIAL_SPAWN_DELAY) {
        if (!this.isBossFight || p.random() < 0.3) { // 30% de chance de spawnar peixes na fase 4
          const randomImage = this.fishImages[Math.floor(p.random(this.fishImages.length))];
          this.fishes.push(new Fish(
            randomImage,
            p.width,
            p.random(50, p.height - 50),
            p.random(BASE_FISH_SPEED_MIN, BASE_FISH_SPEED_MAX) * this.currentSpeedMultiplier,
            p.random(30, 60)
          ));
        }
      }
  
      const currentTime = p.millis();
      if (currentTime - this.lastSpeedIncreaseTime >= SPEED_INCREASE_INTERVAL * 1000) {
        this.currentSpeedMultiplier += SPEED_INCREASE_AMOUNT;
        this.lastSpeedIncreaseTime = currentTime;
        this.faseAtual++;
        this.mostrarMensagemFase = true;
        this.tempoMensagemFase = p.millis();
        
        // Ativar boss na fase 4
        if (this.faseAtual === 4 && !this.isBossFight) {
          this.startBossFight();
        }
      }
  
      for (let i = this.fishes.length - 1; i >= 0; i--) {
        const fish = this.fishes[i];
        fish.draw(p);
        if (this.handleFishCollision(fish)) {
          this.fishes.splice(i, 1);
          continue;
        }
        if (fish.isOffscreen()) {
          this.fishes.splice(i, 1);
        }
      }
  
      if (p.frameCount % 160 === 0) this.spawnBubble();
  
      for (let i = this.bubbles.length - 1; i >= 0; i--) {
        const b = this.bubbles[i];
        b.draw(p);
        if (this.handleBubbleCollision(b)) {
          this.bubbles.splice(i, 1);
          continue;
        }
        if (b.isOffscreen()) this.bubbles.splice(i, 1);
      }
  
      if (p.frameCount >= this.nextWhaleSpawn) {
        // Parar spawn de baleias na fase 4
        if (!this.isBossFight) {
          this.whales.push(new Whale(
            this.whaleImage,
            p.width,
            p.random(50, p.height - 50),
            p.random(BASE_FISH_SPEED_MIN, BASE_FISH_SPEED_MAX) * this.currentSpeedMultiplier * WHALE_SPEED_MULTIPLIER,
            WHALE_SIZE
          ));
        }
        this.nextWhaleSpawn = p.frameCount + p.int(p.random(WHALE_MIN_INTERVAL, WHALE_MAX_INTERVAL) * 60);
      }
  
      for (let i = this.whales.length - 1; i >= 0; i--) {
        const whale = this.whales[i];
        whale.draw(p);
        if (this.handleWhaleCollision(whale)) {
          this.whales.splice(i, 1);
          continue;
        }
        if (whale.isOffscreen()) this.whales.splice(i, 1);
      }

      // Lógica do boss final - só executar se não estiver em vitória
      if (this.isBossFight && this.finalBoss && !this.victory) {
        this.finalBoss.update(p);
        this.finalBoss.draw(p);
        
        // Verificar colisão com o boss
        if (this.finalBoss.checkPlayerCollision(this.player)) {
          this.vidas--;
          this.emitirSomDano();
          this.piscarVidaFrames = 15;
          if (this.vidas <= 0) {
            this.player.startDeath();
          }
        }
        
        // Verificar colisão com bolhas do boss
        if (this.finalBoss.checkBossBubbleCollision(this.player)) {
          this.vidas--;
          this.emitirSomDano();
          this.piscarVidaFrames = 15;
          if (this.vidas <= 0) {
            this.player.startDeath();
          }
        }
        
        // Atualizar e desenhar bolhas do jogador
        for (let i = this.playerBubbles.length - 1; i >= 0; i--) {
          const bubble = this.playerBubbles[i];
          bubble.update();
          bubble.draw(p);
          
          // Verificar colisão com o boss
          if (this.checkPlayerBubbleBossCollision(bubble)) {
            this.playerBubbles.splice(i, 1);
            this.finalBoss.takeDamage();
            this.emitirSomBolha(50);
            
            // Verificar se o boss morreu
            if (this.finalBoss.isDead) {
              this.bossDefeated();
            }
            continue;
          }
          
          if (bubble.isOffscreen(p)) {
            this.playerBubbles.splice(i, 1);
          }
        }
      }
    }
  
    handleFishCollision(fish) {
      const p = this.p;
      const fishW = fish.size;
      const fishH = fish.size / 1.5;
      const cxChar = this.player.x + 50;
      const cyChar = this.player.y + 50;
      const cxFish = fish.x + fishW / 2;
      const cyFish = fish.y + fishH / 2;
      const d = p.dist(cxChar, cyChar, cxFish, cyFish);
      const rChar = 50;
      const rFish = Math.min(fishW, fishH) / 2;
      if (d < rChar + rFish) {
        this.vidas--;
        this.emitirSomDano();
        this.piscarVidaFrames = 15;
        if (this.vidas <= 0) {
          this.player.startDeath();
        }
        return true;
      }
      return false;
    }
  
    handleBubbleCollision(bubble) {
      const p = this.p;
      const charCenterX = this.player.x + 50;
      const charCenterY = this.player.y + 50;
      const bubbleCenterX = bubble.x + bubble.size / 2;
      const bubbleCenterY = bubble.y + bubble.size / 2;
      const distance = p.dist(charCenterX, charCenterY, bubbleCenterX, bubbleCenterY);
      if (distance < 50 + bubble.size / 2) {
        this.emitirSomBolha(bubble.size);
        this.pontuacao++;
        if (this.pontuacao > 0 && this.pontuacao % SPEED_INCREASE_INTERVAL === 0) {
          this.player.speed += SPEED_INCREASE_AMOUNT;
        }
        return true;
      }
      return false;
    }
  
    handleWhaleCollision(whale) {
      const p = this.p;
      const whaleW = whale.size * 2;
      const whaleH = whale.size;
      const cxChar = this.player.x + 50;
      const cyChar = this.player.y + 50;
      const cxWhale = whale.x + whaleW / 2;
      const cyWhale = whale.y + whaleH / 2;
      const d = p.dist(cxChar, cyChar, cxWhale, cyWhale);
      const rChar = 50;
      const rWhale = Math.min(whaleW, whaleH) / 2;
      if (d < rChar + rWhale) {
        this.vidas -= 2;
        this.emitirSomDano();
        this.piscarVidaFrames = 15;
        if (this.vidas <= 0) {
          this.player.startDeath();
        }
        return true;
      }
      return false;
    }
  
    spawnBubble() {
      const p = this.p;
      const size = p.random(MIN_BUBBLE_SIZE, MAX_BUBBLE_SIZE);
      this.bubbles.push(new Bubble(
        this.bubbleImage,
        p.width,
        p.random(20, p.height - 20),
        p.random(1, 3),
        size
      ));
    }
  
    emitirSomBolha(bubbleSize) {
      const t = (bubbleSize - MIN_BUBBLE_SIZE) / (MAX_BUBBLE_SIZE - MIN_BUBBLE_SIZE);
      const vol = t * (MAX_VOLUME - MIN_VOLUME) + MIN_VOLUME;
      this.bubblePopSound.volume = Math.min(Math.max(vol, 0), 1);
      this.bubblePopSound.currentTime = 0;
      this.bubblePopSound.play();
    }
  
    emitirSomGameOver() {
      this.gameOverSound.currentTime = 0;
      this.gameOverSound.volume = 0.5;
      this.gameOverSound.play();
    }
  
    emitirSomGaivota() {
      this.seagullsSound.currentTime = 0;
      this.seagullsSound.volume = 0.7;
      this.seagullsSound.play();
    }
  
    emitirSomDano() {
      if (!this.audioContext || !this.danoBuffer) return;
      const source = this.audioContext.createBufferSource();
      source.buffer = this.danoBuffer;
      const gain = this.audioContext.createGain();
      gain.gain.value = 0.5;
      source.connect(gain);
      gain.connect(this.audioContext.destination);
      source.start(0);
    }
  
    startBossFight() {
      this.isBossFight = true;
      this.bossMessageStartTime = this.p.millis(); // Definir tempo de início da mensagem
      this.finalBoss = new FinalBoss(
        this.bossFinalImage,
        this.bossBubbleImage,
        this.p.width - 200,
        this.p.height / 2 - 200
      );
      
      // Dar 100 bolhas ao jogador se não tiver
      if (this.pontuacao < 100) {
        this.pontuacao = 100;
      }
    }

    spawnPlayerBubble() {
      if (!this.isBossFight || this.pontuacao <= 0) return;
      
      const currentTime = this.p.millis();
      if (currentTime - this.lastPlayerBubbleSpawn < this.playerBubbleCooldown) return;
      
      this.playerBubbles.push(new PlayerBubble(
        this.bubbleImage,
        this.player.x + 100,
        this.player.y + 50,
        8, // velocidade
        50 // tamanho
      ));
      
      this.pontuacao--;
      this.lastPlayerBubbleSpawn = currentTime;
    }

    checkPlayerBubbleBossCollision(bubble) {
      if (!this.finalBoss || this.finalBoss.isDead) return false;
      
      const p = this.p;
      const bubbleCenterX = bubble.x + bubble.size / 2;
      const bubbleCenterY = bubble.y + bubble.size / 2;
      const bossCenterX = this.finalBoss.x + this.finalBoss.size / 2;
      const bossCenterY = this.finalBoss.y + this.finalBoss.size / 2;
      
      const distance = p.dist(bubbleCenterX, bubbleCenterY, bossCenterX, bossCenterY);
      const collisionRadius = this.finalBoss.size / 2;
      
      return distance < collisionRadius;
    }

    bossDefeated() {
      this.isBossFight = false;
      this.finalBoss = null;
      this.playerBubbles = [];
      this.victory = true;
      // Adicionar pontuação extra por derrotar o boss
      this.pontuacao += 500;
      // Criar efeito de bolhas de vitória
      this.createBurstEffect();
    }
  
    spawnMenuBubble(fromBottom = true) {
      const p = this.p;
      const size = p.random(MIN_BUBBLE_SIZE, MAX_BUBBLE_SIZE);
      const x = p.random(0, p.width);
      const y = fromBottom ? p.height + size : p.random(p.height, p.height + 100);
      const speedY = p.random(2, 5);
      this.menuBubbles.push(new MenuBubble(this.bubbleImage, x, y, size, speedY, p.random(0, p.TWO_PI)));
    }
  
    updateMenuBubbles() {
      for (let i = this.menuBubbles.length - 1; i >= 0; i--) {
        const bubble = this.menuBubbles[i];
        bubble.draw(this.p);
        if (bubble.isOffscreen()) {
          this.menuBubbles.splice(i, 1);
        }
      }
    }
  
    createBurstEffect() {
      for (let i = 0; i < BURST_BUBBLE_COUNT; i++) {
        this.spawnMenuBubble(false);
      }
    }
  
    reset() {
      const p = this.p;
      this.fishes = [];
      this.bubbles = [];
      this.whales = [];
      this.player.reset(p.height / 2 - 50);
      this.gameOver = false;
      this.gameStarted = false;
      this.victory = false;
      this.victorySoundPlayed = false;
      this.vidas = MAX_VIDAS;
      this.piscarVidaFrames = 0;
      this.pontuacao = 0;
      this.currentSpeedMultiplier = 1;
      this.lastSpeedIncreaseTime = p.millis();
      this.nextWhaleSpawn = p.frameCount + p.int(p.random(WHALE_MIN_INTERVAL, WHALE_MAX_INTERVAL) * 60);
      this.ui.hideRestart();
      this.ui.hidePlayAgain();
      this.ui.showStartAbout();
      p.loop();
      this.menuBubbles = [];
      this.gameStartTime = p.millis();
      this.faseAtual = 1;
      this.mostrarMensagemFase = false;
      this.tempoMensagemFase = 0;
      this.showAbout = false;
      this.gameOverSoundPlayed = false;
      this.isBossFight = false;
      this.finalBoss = null;
      this.playerBubbles = [];
      this.bossMessageStartTime = 0;
    }

    testBossMode() {
      // Pular direto para a fase 4
      this.faseAtual = 4;
      this.pontuacao = 100;
      this.vidas = MAX_VIDAS;
      this.currentSpeedMultiplier = 1 + (this.faseAtual - 1) * SPEED_INCREASE_AMOUNT;
      
      // Iniciar o jogo
      this.gameStarted = true;
      this.gameStartTime = this.p.millis();
      
      // Esconder botões
      this.ui.startButton.hide();
      this.ui.aboutButton.hide();
      this.ui.testBossButton.hide();
      this.ui.hidePlayAgain();
      
      // Limpar menu bubbles
      this.menuBubbles = [];
      
      // Iniciar boss fight imediatamente
      this.startBossFight();
    }

    showVictoryScreen(p) {
      // Gerar bolhas de vitória continuamente
      if (p.frameCount % 30 === 0) { // A cada 30 frames (0.5 segundos a 60fps)
        this.spawnMenuBubble(false);
      }
      
      // Atualizar e desenhar as bolhas
      this.updateMenuBubbles();

      // Mensagem de vitória sem fundo
      p.push();
      p.textAlign(p.CENTER, p.CENTER);
      p.textSize(48);
      p.fill(255, 255, 0);
      p.text('🎉 VITÓRIA! 🎉', p.width / 2, p.height / 2 - 100);
      
      p.textSize(24);
      p.fill(255);
      p.text('Parabéns! Você derrotou o espigão do mal', p.width / 2, p.height / 2 - 40);
      p.text('e ajudou os mares!', p.width / 2, p.height / 2 - 10);
      
      p.textSize(20);
      p.fill(255, 255, 0);
      p.text(`Pontuação final: ${this.pontuacao}`, p.width / 2, p.height / 2 + 30);
      p.pop();

      // Mostrar botão "Jogar Novamente"
      this.ui.showPlayAgain(p);
    }
  }

class PlayerBubble {
  constructor(img, x, y, speed, size) {
    this.img = img;
    this.x = x;
    this.y = y;
    this.speed = speed;
    this.size = size;
  }

  update() {
    this.x += this.speed;
  }

  draw(p) {
    p.image(this.img, this.x, this.y, this.size, this.size);
  }

  isOffscreen(p) {
    return this.x > p.width;
  }
}