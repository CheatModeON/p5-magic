
var x=50;
var y=50;
var vx=50;
var vy=300;
var angle = 5;
function setup() {
  createCanvas(windowWidth, windowHeight);
  rectMode(CENTER);
  angleMode(DEGREES);
}

function draw() {
  background(200);

  line(0,vy+35,width,vy+35);

  fill(0);
  translate(vx,vy);
  rotate(angle);
  rect(0,0,x,y);
  vx+=1;
  angle+=1;
}
