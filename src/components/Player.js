export class Player {
    constructor(imgs, paradoImg, x, y, speed) {
      this.imgs = imgs;
      this.paradoImg = paradoImg;
      this.x = x;
      this.y = y;
      this.speed = speed;
      this.index = 0;
      this.img = paradoImg;
      this.isMoving = false;
      this.dying = false;
      this.deathVy = 0;
      this.deathAngle = 0;
    }
  
    animate(frameCount, frameDelay) {
      if (frameCount % frameDelay === 0) {
        this.index = (this.index + 1) % this.imgs.length;
        this.img = this.imgs[this.index];
      }
    }
  
    draw(p) {
      p.image(this.img, this.x, this.y, 100, 100);
    }
  
    move(key) {
      if (key === 'w') this.y -= this.speed*3;
      else if (key === 's') this.y += this.speed*3;
      else if (key === 'a') this.x -= this.speed*3;
      else if (key === 'd') this.x += this.speed*4;
    }
  
    reset(y) {
      this.x = 50;
      this.y = y;
      this.speed = 5;
      this.img = this.paradoImg;
      this.isMoving = false;
      this.dying = false;
      this.deathVy = 0;
      this.deathAngle = 0;
    }
  
    startDeath() {
      this.dying = true;
      this.deathVy = -8;
      this.deathAngle = 0;
    }
  
    deathAnimation(p) {
      this.deathVy += 0.5;
      this.y += this.deathVy;
      this.deathAngle += 0.15;
      p.push();
      p.translate(this.x + 50, this.y + 50);
      p.rotate(this.deathAngle);
      p.image(this.imgs[0], -50, -50, 100, 100);
      p.pop();
      if (this.y > p.height + 100) {
        this.dying = false;
        return true;
      }
      return false;
    }
  }