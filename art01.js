
//https://editor.p5js.org/wvnl/sketches/5wnuHAXKd

var stars = [];
var n;
function setup() {
  createCanvas(windowWidth, windowHeight);
  n=windowWidth*windowHeight / 1000;
	for (var i = 0; i < n; i++) {
		stars[i] = new Star();
	}
}

function draw() {
  background(255,255,255,140);

	for (var i = 0; i < stars.length; i++) {
		stars[i].draw();
	}
}


// star class //
class Star {
	constructor() {
		this.x = random(width);
		this.y = random(height);
		this.size = random(0.1, 3);
		this.t = random(TAU);
	}

	draw() {
		this.t += 0.1;
		var scale = this.size + sin(this.t) * 2;
		noStroke();
      fill(0,155)
		ellipse(this.x, this.y, scale, scale);
	}
}
