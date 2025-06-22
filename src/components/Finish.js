export class Fish {
    constructor(img, x, y, speed, size) {
      this.img = img;
      this.x = x;
      this.y = y;
      this.speed = speed;
      this.size = size;
    }
  
    draw(p) {
      const fishW = this.size;
      const fishH = this.size / 1.5;
      p.image(this.img, this.x, this.y, fishW, fishH);
      this.x -= this.speed;
    }
  
    isOffscreen() {
      return this.x < -this.size;
    }
  }