

let mic;
let img;
let angle = 0;
let charge = 0;
function preload() {
  img = loadImage('assets/helicopter.png');
}

let d=100;
let start;
let score = 0;

function setup() {
  mic = new p5.AudioIn();
  mic.start();
  
  createCanvas(800, 600);
  h = new Helicopter();
  r = new Rock();
  angleMode(DEGREES);
  rectMode(CENTER);
  
  let div = createDiv('').size(100, 100);
  div.html('<h1>Helix - The Game<h1>');
}

function draw() {
  background(220);
  r.display();
  h.display();
  r.playspeed(5);
  h.fall(10);
  let vol = mic.getLevel();
  
  push();
  translate(h.getX()-20,h.getY()-20);
  rotate(angle);
  rect(0,0,15,2,5,5);
    
  pop();
  console.log(vol);
  
  if(mouseIsPressed || vol > 0.10){
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
  
  
  if(h.getY()<h.r){
    //h.setY(h.r);
    h.setY(height/2);
    r.setX(width);
    r.setY(random(0,height));
    score=0;
  }
  if(h.getY()>height-h.r){
    //h.setY(height-h.r);
    h.setY(height/2);
    r.setX(width);
    r.setY(random(0,height));
    score=0;
  }
  
  var d = dist(h.x, h.y, r.x+r.size/2, r.y+r.size/2);
  if (d < h.r + (r.size/2)) {
    //fill(150);
    //fill(changeColor());
    r.setX(width);
    r.setY(random(0,height));
    r.setSize(random(50,100));
    score = 0;
  }
  
  if(r.getX()<0){
    r.setX(width);
    r.setY(random(0,height));
    r.setSize(random(50,100));
    score += 1;
  }
  text("score: "+nfc(score,0),10,20);
}

function Helicopter(){
  this.x = random(100, 175);
  this.y = random(height);
  this.r = 25;
  this.col = color(255);
  
  this.display = function() {
    //ellipse(this.x, this.y, this.r*2);
    //fill(this.col);
    
    image(img, this.x-this.r, this.y-this.r, this.r*2, this.r*2);
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
  this.getY = function() {
    return this.y;
  }
  this.getX = function() {
    return this.x;
  }
  this.getR = function() {
    return this.r;
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
  this.getX = function() {
    return this.x;
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
  
}
