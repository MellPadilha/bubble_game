export class Bubble {
    constructor(img, x, y, speed, size) {
      this.img = img;
      this.x = x;
      this.y = y;
      this.speed = speed;
      this.size = size;
    }
  
    draw(p) {
      p.image(this.img, this.x, this.y, this.size, this.size);
      this.x -= this.speed;
    }
  
    isOffscreen() {
      return this.x < -this.size;
    }
  }