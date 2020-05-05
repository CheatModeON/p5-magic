let mic;
let img;
let angle = 0;
let charge = 0;
let threshold = 0.05;
function preload() {
  img = loadImage('assets/helicopter.png');
}

let d=100;
let start;
let score = 0;

function setup() {
  userStartAudio();
  let title = select('#title');
  title.html('Helix - The Game');
  
  mic = new p5.AudioIn();
  mic.start();
  
  createCanvas(800, 600);
  h = new Helicopter();
  r = new Rock();
  angleMode(DEGREES);
  rectMode(CENTER);
}

function draw() {
  background(220);
  fill(255);
  
  r.display();
  h.display();
  r.playspeed(5);
  h.fall(10);
  let vol = mic.getLevel();
  
  // draw the propeller
  push();
  translate(h.getX()+5,h.getY()+5);
  rotate(angle);
  rect(0,0,15,2,5,5);
  pop();
  
  if(mouseIsPressed || vol > threshold){
    h.fly(15);
    if(charge < 70){
      charge += 1;
    }
  } else {
    if(charge > 10){
      charge -= 3;
    }
  }
  angle = angle + charge;
  
  
  if(h.getY()<0){
    //h.setY(h.r);
    h.setY(height/2);
    r.setX(width);
    r.setY(random(0,height));
    score=0;
  }
  if(h.getY()>height-h.size){
    //h.setY(height-h.r);
    h.setY(height/2);
    r.setX(width);
    r.setY(random(0,height));
    score=0;
  }
  
  if (r.getX() < h.getX() + h.getSize() &&
     r.getX() + r.getSize() > h.getX() &&
     r.getY() < h.getY() + h.getSize() &&
     r.getY() + r.getSize() > h.getY()) {
      // collision detected!
    r.setX(width);
    r.setY(random(0,height));
    r.setSize(random(50,100));
    h.setY(height/2);
    score = 0;
  }
  
  /*var d = dist(h.x, h.y, r.x+r.size/2, r.y+r.size/2);
  if (d < h.r + (r.size/2)) {
    //fill(150);
    //fill(changeColor());
    r.setX(width);
    r.setY(random(0,height));
    r.setSize(random(50,100));
    score = 0;
  }*/
  
  if(r.getX()<0){
    r.setX(width);
    r.setY(random(0,height));
    r.setSize(random(50,100));
    score += 1;
  }
  
  textSize(22);
  text("score: "+nfc(score,0),10,20);
  
  fill(255)
  let barsize=100;
  rect(20+barsize/2,50,barsize,10);
  fill(0);
  let actual = map(vol,0,threshold,0,1);
  let x = 20+actual * barsize;
  //let x = 20+vol * barsize;
  ellipse(x, 50, 10, 10);
}

function Helicopter(){
  this.x = 200;
  this.y = height/2;
  this.size = 50;
  this.col = color(255);
  
  this.display = function() {
    //ellipse(this.x, this.y, this.r*2);
    //fill(this.col);
    rect(this.x, this.y, this.size, this.size);
    image(img, this.x, this.y, this.size, this.size);
  }
  this.fall = function(d) {
    this.y=this.y+d;
  }
  this.fly = function(d) {
    this.y=this.y-d;
  }
  
  this.setY = function(y) {
    this.y = y;
  }
  this.getX = function() {
    return this.x;
  }
  this.getY = function() {
    return this.y;
  }
  this.getSize = function() {
    return this.size;
  }
  
  this.changeColor = function() {
    this.col = color(150);
  }
}

function Rock(){
  this.x = width;
  this.y = random(0,height);
  this.size = 100;
  this.col = color(255);
  
  this.display = function() {
    rect(this.x, this.y, this.size, this.size,10,10);
    fill(this.col);
  }
  this.playspeed = function(d) {
    this.x=this.x-d;
  }
  this.setX = function(x) {
    this.x = x;
  }
  this.setY = function(y) {
    this.y = y;
  }
  this.setSize = function(s) {
    this.size = s;
  }
  this.getX = function() {
    return this.x;
  }
  this.getY = function() {
    return this.y;
  }
  this.getSize = function() {
    return this.size;
  }
}


function mousePressed() {
  userStartAudio();
}
