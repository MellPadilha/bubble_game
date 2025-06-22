export class Whale {
    constructor(img, x, y, speed, size) {
      this.img = img;
      this.x = x;
      this.y = y;
      this.speed = speed;
      this.size = size;
    }
  
    draw(p) {
      const whaleW = this.size * 2;
      const whaleH = this.size;
      p.image(this.img, this.x, this.y, whaleW, whaleH);
      this.x -= this.speed;
    }
  
    isOffscreen() {
      return this.x < -this.size * 2;
    }
  }