export class MenuBubble {
    constructor(img, x, y, size, speedY, rotation) {
      this.img = img;
      this.x = x;
      this.y = y;
      this.size = size;
      this.speedY = speedY;
      this.rotation = rotation;
    }
  
    draw(p) {
      this.y -= this.speedY;
      this.rotation += 0.02;
      p.push();
      p.translate(this.x, this.y);
      p.rotate(this.rotation);
      p.image(this.img, -this.size / 2, -this.size / 2, this.size, this.size);
      p.pop();
    }
  
    isOffscreen() {
      return this.y < -this.size;
    }
  }