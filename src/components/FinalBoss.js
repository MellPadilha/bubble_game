export class FinalBoss {
  constructor(img, bossBubbleImg, x, y) {
    this.img = img;
    this.bossBubbleImg = bossBubbleImg;
    this.x = x;
    this.y = y;
    this.size = 400;
    this.health = 50;
    this.maxHealth = 50;
    this.speed = 1;
    this.direction = 1; 
    this.bossBubbles = [];
    this.lastBubbleSpawn = 0;
    this.bubbleSpawnInterval = 2000; // Intervalo para ataques aleatórios
    this.isDead = false;
    this.deathAnimation = false;
    this.deathTimer = 0;
    
    // Sistema de rajadas
    this.lastBurstTime = 0;
    this.burstInterval = 45000; // 45 segundos
    this.isBursting = false;
    this.burstBubbleCount = 0;
    this.maxBurstBubbles = 8; // Número de bolhas na rajada
    this.burstBubbleDelay = 200; // Delay entre bolhas na rajada
    this.lastBurstBubbleTime = 0;
    
    // Sistema de ataques aleatórios
    this.lastRandomAttackTime = 0;
    this.randomAttackInterval = 2000; // 2 segundos entre ataques aleatórios (mais frequente)
    this.randomAttackChance = 0.5; // 50% de chance de atacar a cada intervalo (mais agressivo)
    
    // Sistema de ataques em grupo
    this.isGroupAttacking = false;
    this.groupAttackCount = 0;
    this.maxGroupAttackCount = 0;
    this.lastGroupAttackTime = 0;
    this.groupAttackDelay = 120; // 120ms entre bolhas do grupo (mais rápido)
  }

  update(p) {
    if (this.isDead) {
      this.deathTimer++;
      return;
    }

    this.y += Math.sin(p.frameCount * 0.02) * 0.5;
    
    const currentTime = p.millis();
    
    // Sistema de rajadas a cada 45 segundos
    if (!this.isBursting && !this.isGroupAttacking && currentTime - this.lastBurstTime > this.burstInterval) {
      this.isBursting = true;
      this.burstBubbleCount = 0;
      this.lastBurstBubbleTime = currentTime;
    }
    
    // Spawn de bolhas durante a rajada
    if (this.isBursting) {
      if (currentTime - this.lastBurstBubbleTime > this.burstBubbleDelay && this.burstBubbleCount < this.maxBurstBubbles) {
        this.spawnBossBubble(p, true); // true = rajada
        this.burstBubbleCount++;
        this.lastBurstBubbleTime = currentTime;
        
        // Finalizar rajada quando todas as bolhas foram spawnadas
        if (this.burstBubbleCount >= this.maxBurstBubbles) {
          this.isBursting = false;
          this.lastBurstTime = currentTime;
        }
      }
    }
    
    // Sistema de ataques em grupo
    if (this.isGroupAttacking) {
      if (currentTime - this.lastGroupAttackTime > this.groupAttackDelay && this.groupAttackCount < this.maxGroupAttackCount) {
        this.spawnBossBubble(p, false);
        this.groupAttackCount++;
        this.lastGroupAttackTime = currentTime;
        
        // Finalizar ataque em grupo
        if (this.groupAttackCount >= this.maxGroupAttackCount) {
          this.isGroupAttacking = false;
        }
      }
    }
    
    // Sistema de ataques aleatórios
    if (!this.isBursting && !this.isGroupAttacking && currentTime - this.lastRandomAttackTime > this.randomAttackInterval) {
      if (p.random() < this.randomAttackChance) {
        // Decidir se vai atacar com uma bolha ou um grupo pequeno
        const attackType = p.random();
        if (attackType < 0.6) {
          // 60% de chance: ataque com uma bolha
          this.spawnBossBubble(p, false);
        } else {
          // 40% de chance: ataque com grupo pequeno (2-4 bolhas)
          this.isGroupAttacking = true;
          this.groupAttackCount = 0;
          this.maxGroupAttackCount = p.int(p.random(2, 5));
          this.lastGroupAttackTime = currentTime;
        }
      }
      this.lastRandomAttackTime = currentTime;
    }

    for (let i = this.bossBubbles.length - 1; i >= 0; i--) {
      const bubble = this.bossBubbles[i];
      bubble.update();
      if (bubble.isOffscreen(p)) {
        this.bossBubbles.splice(i, 1);
      }
    }
  }

  draw(p) {
    if (this.isDead) {
      p.push();
      p.tint(255, 255 - this.deathTimer * 5);
      p.image(this.img, this.x, this.y, this.size, this.size);
      p.pop();
      return;
    }

    p.image(this.img, this.x, this.y, this.size, this.size);

    this.drawHealthBar(p);
    
    // Indicador de rajada
    if (this.isBursting) {
      p.push();
      p.fill(255, 0, 0, 150);
      p.noStroke();
      p.textAlign(p.CENTER, p.CENTER);
      p.textSize(24);
      p.text("RAJADA!", this.x + this.size / 2, this.y - 60);
      p.pop();
    }
    
    // Indicador de ataque em grupo
    if (this.isGroupAttacking) {
      p.push();
      p.fill(255, 165, 0, 150); // Laranja
      p.noStroke();
      p.textAlign(p.CENTER, p.CENTER);
      p.textSize(20);
      p.text("ATAQUE EM GRUPO!", this.x + this.size / 2, this.y - 60);
      p.pop();
    }

    for (const bubble of this.bossBubbles) {
      bubble.draw(p);
    }
  }

  drawHealthBar(p) {
    const barWidth = this.size;
    const barHeight = 20;
    const barX = this.x;
    const barY = this.y - 30;
    
    p.fill(255, 0, 0);
    p.rect(barX, barY, barWidth, barHeight);
    
    const healthWidth = (this.health / this.maxHealth) * barWidth;
    p.fill(0, 255, 0);
    p.rect(barX, barY, healthWidth, barHeight);
    
    p.stroke(0);
    p.strokeWeight(2);
    p.noFill();
    p.rect(barX, barY, barWidth, barHeight);
    p.noStroke();
  }

  spawnBossBubble(p, isRajada = false) {
    const bubbleSize = 60;
    const speed = 3;
    
    // Padrão de rajada: bolhas em diferentes ângulos
    let angle;
    if (isRajada) {
      // Durante rajada, distribuir bolhas em um arco maior
      const angleStep = (Math.PI / 2) / (this.maxBurstBubbles - 1);
      angle = -Math.PI/4 + (this.burstBubbleCount * angleStep);
    } else {
      // Ataque aleatório: ângulo aleatório em um arco menor
      angle = p.random(-Math.PI/6, Math.PI/6); // Arco menor para ataques aleatórios
    }
    
    const vx = -speed * Math.cos(angle);
    const vy = speed * Math.sin(angle);
    
    this.bossBubbles.push(new BossBubble(
      this.bossBubbleImg,
      this.x,
      this.y + this.size / 2,
      vx,
      vy,
      bubbleSize
    ));
  }

  takeDamage() {
    this.health--;
    if (this.health <= 0) {
      this.isDead = true;
      this.deathAnimation = true;
    }
  }

  checkPlayerCollision(player) {
    if (this.isDead) return false;
    
    const bossCenterX = this.x + this.size / 2;
    const bossCenterY = this.y + this.size / 2;
    const playerCenterX = player.x + 50;
    const playerCenterY = player.y + 50;
    
    const distance = Math.sqrt(
      Math.pow(bossCenterX - playerCenterX, 2) + 
      Math.pow(bossCenterY - playerCenterY, 2)
    );
    const collisionRadius = (this.size + 100) / 2;
    
    return distance < collisionRadius;
  }

  checkBossBubbleCollision(player) {
    for (let i = this.bossBubbles.length - 1; i >= 0; i--) {
      const bubble = this.bossBubbles[i];
      const bubbleCenterX = bubble.x + bubble.size / 2;
      const bubbleCenterY = bubble.y + bubble.size / 2;
      const playerCenterX = player.x + 50;
      const playerCenterY = player.y + 50;
      
      const distance = Math.sqrt(
        Math.pow(bubbleCenterX - playerCenterX, 2) + 
        Math.pow(bubbleCenterY - playerCenterY, 2)
      );
      if (distance < 50 + bubble.size / 2) {
        this.bossBubbles.splice(i, 1);
        return true;
      }
    }
    return false;
  }
}

class BossBubble {
  constructor(img, x, y, vx, vy, size) {
    this.img = img;
    this.x = x;
    this.y = y;
    this.vx = vx;
    this.vy = vy;
    this.size = size;
  }

  update() {
    this.x += this.vx;
    this.y += this.vy;
  }

  draw(p) {
    p.image(this.img, this.x, this.y, this.size, this.size);
  }

  isOffscreen(p) {
    return this.x + this.size < 0 || this.x > p.width || 
           this.y + this.size < 0 || this.y > p.height;
  }
}
