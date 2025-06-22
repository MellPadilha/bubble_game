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
    this.bubbleSpawnInterval = 2000;
    this.isDead = false;
    this.deathAnimation = false;
    this.deathTimer = 0;
  }

  update(p) {
    if (this.isDead) {
      this.deathTimer++;
      return;
    }

    this.y += Math.sin(p.frameCount * 0.02) * 0.5;
    
    const currentTime = p.millis();
    if (currentTime - this.lastBubbleSpawn > this.bubbleSpawnInterval) {
      this.spawnBossBubble(p);
      this.lastBubbleSpawn = currentTime;
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

  spawnBossBubble(p) {
    const bubbleSize = 60;
    const speed = 3;
    const angle = p.random(-Math.PI/4, Math.PI/4);
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
