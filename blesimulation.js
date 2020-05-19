// https://github.com/gsongsong/mlat/tree/master/js


var c_width = window.innerWidth; //windowWidth
var c_height = window.innerHeight; //windowHeight
var spacer = 10; // this mustbe divided perdectly with width and height

var [W, L, H] = [c_width, c_height, 0]  //window.innerWidth, window.innerHeight
var anchors = [[50, 50, H],
               [W-50, 50, H],
               [W-50, L-50, H],
               [50, L-50, H]]
var node = [W * Math.random(), L * Math.random(), 0];

var node = [0, 0, 0];
var ranges = new_vector(anchors.length);
var error = 0.5;
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

var maxError=100;
var all_error = 0;
var measurements = 0;
var bluetooth = [];
var person;
var n;
var grid;

var heatMap=[];
var heatMode=true;
var direction=1;

function setup() {
  createCanvas(c_width, c_height);
  n=4;
  frameRate(60);
  rectMode(CENTER);

  // init pixel based heatMap
  for (let x = 0; x < width+2*spacer; x++) {
    heatMap[x] = []; // create nested array
    for (let y = 0; y < height+2*spacer; y++) {
      heatMap[x][y] = 0;
    }
  }

  bluetooth[0] = new BLE();
  bluetooth[0].x = anchors[0][0];
  bluetooth[0].y = anchors[0][1];
  bluetooth[0].color = color(222,0,0);
  bluetooth[0].text = "BLE Beacon "+bluetooth.length;

  bluetooth[1] = new BLE();
  bluetooth[1].x = anchors[1][0];
  bluetooth[1].y = anchors[1][1];
  bluetooth[1].color = color(0,222,0);
  bluetooth[1].text = "BLE Beacon "+bluetooth.length;

  bluetooth[2] = new BLE();
  bluetooth[2].x = anchors[2][0];
  bluetooth[2].y = anchors[2][1];
  bluetooth[2].color = color(222,0,222);
  bluetooth[2].text = "BLE Beacon "+bluetooth.length;

  bluetooth[3] = new BLE();
  bluetooth[3].x = anchors[3][0];
  bluetooth[3].y = anchors[3][1];
  bluetooth[3].color = color(0,0,222);
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
  error = 55.5;
  ranges_with_error = ranges.slice()
  for (var i = 0; i < anchors.length; i++) {
    ranges[i] = d(anchors[i], node)
    ranges_with_error[i] = ranges[i] + 2 * error * (Math.random() - 0.5) // add noise
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
  stroke(0);
  ellipse(node[0],node[1],30,30);
  noStroke();
  fill(0);
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



  heatMap[node[0]][node[1]] = map(all_error/measurements,0,maxError,0,255);
//console.log(heatMap[node[0]][node[1]]);
  // show heatmap
  if(heatMode) {
    colorMode(HSB);
    for (let x = 0; x < width + 2*spacer; x += spacer) {
      for (let y = 0; y < height + 2*spacer; y += spacer) {
        strokeWeight(1);
        noStroke();
        //stroke(255 - heatMap[x][y], 100, 100);
        fill(255 - heatMap[x][y], 100, 100);
        rect(x,y,int(spacer/2),int(spacer/2))
        //point(x  , y  );

        bi_interpol(x,y);
      }
    }
    fill(255);
    strokeWeight(4);
    stroke(255, 100, 100);
    // the stroke of this text is equal to the stroke of the last square of the heatmap - thus blue.
    // when the mapping is finished it changes color
    textAlign(CENTER);
    text("Press SHIFT to disable Heatmap",width/2,height/2);
    colorMode(RGB);
  }

  // simulated movement
  if(node[1]<height+spacer){
    var samples=80;
    if(measurements%samples==0){
      node[0]+=spacer*direction;

      if(node[0]>width+spacer || node[0]<0){
        direction=-direction;

        node[0]+=spacer*direction
        node[1]+=spacer;
      }

      all_error=0;
      measurements=0;
    }
  }

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
    if(node[0]>=spacer) { node[0] -= spacer; }
  } else if (keyCode === RIGHT_ARROW) {
    if(node[0]<width) { node[0] += spacer; }
  } else if (keyCode === UP_ARROW) {
    if(node[1]>=spacer) { node[1] -= spacer; }
  } else if (keyCode === DOWN_ARROW) {
    if(node[1]<height) { node[1] += spacer; }
  }

  if (keyCode === ENTER) {
    anchors.splice(-1,1);
    bluetooth.splice(-1,1);
  }
  all_error = 0;
  measurements = 0;

  if (keyCode === SHIFT) {
    if(heatMode==true){heatMode=false;} else {heatMode=true}
  }
}


class Grid {
  constructor() {
    this.gap = spacer;
  }
  draw() {

    push();
    translate(width/2,height/2);
    stroke(0,50);
    strokeWeight(4);

    line(0,-height,0,height);
    line(-width,0,width,0);

    stroke(0,30);
    strokeWeight(1);
    for(var i = 0; i<width/2; i+=this.gap){
      line(i,-height,i,height);
    }
    for(var i = 0; i>-width/2; i-=this.gap){
      line(i,-height,i,height);
    }
    for(var i = 0; i<height/2; i+=this.gap){
      line(-width,i,width,i);
    }
    for(var i = 0; i>-height/2; i-=this.gap){
      line(-width,i,width,i);
    }
    pop();
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




// https://en.wikipedia.org/wiki/Bilinear_interpolation
// 3 way bilinear interpolarization

function bi_interpol(i,j) {
  if(i<width+spacer && j<height+spacer){
    var x1=i;
    var x2=i+spacer;
    var y1=j;
    var y2=j+spacer;

    var c11 = heatMap[x1][y1];
    var c12 = heatMap[x1][y2];
    var c21 = heatMap[x2][y1];
    var c22 = heatMap[x2][y2];

    // ONE way
    var x = i + int(spacer/2)
    var y = j + int(spacer/2)

    heatMap[x][y1] = ( ( (x2-x)/(x2-x1) ) * c11 ) + ( ( (x-x1)/(x2-x1) ) * c21 );
    heatMap[x][y2] = ( ( (x2-x)/(x2-x1) ) * c12 ) + ( ( (x-x1)/(x2-x1) ) * c22 );

    heatMap[x][y] = ( (y2-y)/(y2-y1) * heatMap[x][y1] ) + ( (y-y1)/(y2-y1) * heatMap[x][y2] )

    colorMode(HSB);
    fill(255 - heatMap[x][y], 100, 100);
    rect(x, y, int(spacer/2),int(spacer/2));

    // TWO way
    var x = i + int(spacer/2)
    var y = j

    heatMap[x][y1] = ( ( (x2-x)/(x2-x1) ) * c11 ) + ( ( (x-x1)/(x2-x1) ) * c21 );
    heatMap[x][y2] = ( ( (x2-x)/(x2-x1) ) * c12 ) + ( ( (x-x1)/(x2-x1) ) * c22 );

    heatMap[x][y] = ( (y2-y)/(y2-y1) * heatMap[x][y1] ) + ( (y-y1)/(y2-y1) * heatMap[x][y2] )

    colorMode(HSB);
    fill(255 - heatMap[x][y], 100, 100);
    rect(x, y, int(spacer/2),int(spacer/2));

    // THREE way
    var x = i
    var y = j + int(spacer/2)

    heatMap[x][y1] = ( ( (x2-x)/(x2-x1) ) * c11 ) + ( ( (x-x1)/(x2-x1) ) * c21 );
    heatMap[x][y2] = ( ( (x2-x)/(x2-x1) ) * c12 ) + ( ( (x-x1)/(x2-x1) ) * c22 );

    heatMap[x][y] = ( (y2-y)/(y2-y1) * heatMap[x][y1] ) + ( (y-y1)/(y2-y1) * heatMap[x][y2] )

    colorMode(HSB);
    fill(255 - heatMap[x][y], 100, 100);
    rect(x, y, int(spacer/2),int(spacer/2));
  }


}
