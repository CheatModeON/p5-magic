// https://github.com/gsongsong/mlat/tree/master/js

var [W, L, H] = [window.innerWidth, window.innerHeight, 0]
var anchors = [[50, 50, H],
               [W-50, 50, H],
               [W-50, L-50, H],
               [50, L-50, H]]
var node = [W * Math.random(), L * Math.random(), 0];
var ranges = new_vector(anchors.length)
var error = 0.5 + 5
var ranges_with_error = ranges.slice()
for (var i = 0; i < anchors.length; i++) {
  ranges[i] = d(anchors[i], node)
  ranges_with_error[i] = ranges[i] + 2 * error * (Math.random() - 0.5)
}

// TODO: You need to define search space boundary to prevent UNEXPECTED RESULT
// If not, search space boundary is defined as a cube constrained to
// minimum and maximum coordinates of x, y, z of anchors
// If anchors are in the same plane, i.e., all anchors have the same (similar)
// coordinate of at least one axes, you MUST define search space boundary
// So, defining search space boundary is all up to you
/*var bounds =[];
for (var i = 0; i < 2; i++) {
  var row = []
  for (var j = 0; j < numeric.dim(anchors)[1]; j++) {
    row.push(0)
  }
  bounds.push(row)
}
for (var i = 0; i < numeric.dim(anchors)[1]; i++) {
  var column = []
  for (var j = 0; j < numeric.dim(anchors)[0]; j++) {
    column.push(anchors[j][i])
  }
  bounds[0][i] = Math.min.apply(null, column) // minimum boundary of ith axis
  bounds[1][i] = Math.max.apply(null, column) // maximum boundary of ith axis
}
// hard coded minimum height (0 m) of search boundary
bounds[0][numeric.dim(anchors)[1] - 1] = 0;
*/

var all_error = 0;
var measurements = 0;
var bluetooth = [];
var person;
var n;
var grid;
function setup() {
  createCanvas(windowWidth, windowHeight);
  n=4;
  frameRate(25);

  bluetooth[0] = new BLE();
  bluetooth[0].x = anchors[0][0];
  bluetooth[0].y = anchors[0][1];
  bluetooth[0].color = color(255,0,0);
  bluetooth[0].text = "BLE Beacon "+bluetooth.length;

  bluetooth[1] = new BLE();
  bluetooth[1].x = anchors[1][0];
  bluetooth[1].y = anchors[1][1];
  bluetooth[1].color = color(0,255,0);
  bluetooth[1].text = "BLE Beacon "+bluetooth.length;

  bluetooth[2] = new BLE();
  bluetooth[2].x = anchors[2][0];
  bluetooth[2].y = anchors[2][1];
  bluetooth[2].color = color(255,0,255);
  bluetooth[2].text = "BLE Beacon "+bluetooth.length;

  bluetooth[3] = new BLE();
  bluetooth[3].x = anchors[3][0];
  bluetooth[3].y = anchors[3][1];
  bluetooth[3].color = color(0,0,255);
  bluetooth[3].text = "BLE Beacon "+bluetooth.length;

  person = new HUMAN();
  person.x = node[0];
  person.y = node[1];
  gdescent_result = mlat(anchors, ranges_with_error);
  person.oldX = gdescent_result.estimator[0];
  person.oldY = gdescent_result.estimator[1];

  grid = new Grid();
}

function draw() {
  background(255,255,255);
  grid.draw();

  ranges = new_vector(anchors.length)
  error = 0.5 + 5
  ranges_with_error = ranges.slice()
  for (var i = 0; i < anchors.length; i++) {
    ranges[i] = d(anchors[i], node)
    ranges_with_error[i] = ranges[i] + 2 * error * (Math.random() - 0.5)
  }

	for (var i = 0; i < bluetooth.length; i++) {
  	bluetooth[i].draw();

    bluetooth[i].radius = int(ranges_with_error[i])
    //bluetooth[i].radius = int(dist(person.x, person.y, bluetooth[i].x, bluetooth[i].y));
    //bluetooth[i].oldradius = bluetooth[i].radius;

    //bluetooth[i].radius += random (0,100); // add noise

    //bluetooth[i].radius = lerp(bluetooth[i].oldradius, bluetooth[i].radius, 0.2);

    noFill();
    stroke(bluetooth[i].color);
    strokeWeight(4);

    ellipse(bluetooth[i].x, bluetooth[i].y,bluetooth[i].radius*2,bluetooth[i].radius*2);
	}

  gdescent_result = mlat(anchors, ranges_with_error);

  person.x = gdescent_result.estimator[0];
  person.y = gdescent_result.estimator[1];

  //print actual position and estimate error
  stroke(122);
  ellipse(node[0],node[1],30,30);
  noStroke();
  fill(122);
  text("Actual Position",node[0],node[1]+30);

  //person.error = dist(node[0],node[1],person.x,person.y);


  noStroke();
  text("Error: " + person.error, width/2, height-40);
  text("Mean Error: " + all_error/measurements, width/2, height-20);

  var lerp_val = 0.05; // this must be dynamically set based on user's speed and frameRate (or measurements per sec), the faster the bigger the amount of lerp
  person.x = lerp(person.oldX,person.x,lerp_val);
  person.y = lerp(person.oldY,person.y,lerp_val);

  stroke(0);
  line(node[0],node[1],person.x,person.y);
  person.error = dist(node[0],node[1],person.x,person.y);

  person.draw();

  person.oldX = person.x;
  person.oldY = person.y;
  person.oldError = person.error;

  all_error += person.error;
  measurements += 1;
}

function mouseClicked() {
  anchors.push([mouseX,mouseY,0]);

  var ble = new BLE();
  ble.x = anchors[anchors.length-1][0];
  ble.y = anchors[anchors.length-1][1];
  ble.text = "BLE Beacon "+(bluetooth.length+1);
  ble.color = color(random(0,255),random(0,255),random(0,255));

  bluetooth.push(ble);

  all_error = 0;
  measurements = 0;
}



function keyPressed() {
  if (keyCode === LEFT_ARROW) {
    node[0] -= 20
  } else if (keyCode === RIGHT_ARROW) {
    node[0] += 20
  } else if (keyCode === UP_ARROW) {
    node[1] -= 20
  } else if (keyCode === DOWN_ARROW) {
    node[1] += 20
  }

  if (keyCode === ENTER) {
    anchors.splice(-1,1);
    bluetooth.splice(-1,1);
  }
  all_error = 0;
  measurements = 0;
}


class Grid {
  constructor() {
    this.gap = 22;
  }
  draw() {
    stroke(0,30);
    strokeWeight(1);
    for(var i = 0; i<width; i+=this.gap){
      line(i,0,i,height);
    }
    for(var i = 0; i<height; i+=this.gap){
      line(0,i,width,i);
    }
  }

}

// HUMAN class //
class HUMAN {
	constructor() {
    this.x = random(width);
    this.y = random(height);
    this.error = 0;

    this.oldX = 0;
    this.oldY = 0;
    this.oldError = 0;

    this.size = 30;
    this.text = "Device estimate";
  }
  draw() {
		noStroke();
    fill(144,120)
		ellipse(this.x, this.y, this.size, this.size);

    noFill();
    stroke(120, 120);
    strokeWeight(4);
    ellipse(this.x, this.y, this.error*2, this.error*2);

    noStroke();
    fill(144,255);
    textAlign(CENTER);
    push();
    translate(this.x, this.y);
    text(this.text,0,-this.size);
    pop();
	}
}

// BLE class //
class BLE {
	constructor() {
		this.x = random(width);
		this.y = random(height);
		this.size = 20;
		this.RSSI = random(TAU);
    this.radius = 0;
    this.oldradius = 0;
    this.color = color(255,0,0);
    this.text = "BLE Beacon";
	}

	draw() {
		noStroke();
    fill(this.color);
    //fill(0,155)
		ellipse(this.x, this.y, this.size, this.size);

    //noStroke();
    //textAlign(CENTER);
    //fill(this.color);
    push();
    translate(this.x,this.y);
    text(this.text,0,this.size);
    pop();
	}
}
