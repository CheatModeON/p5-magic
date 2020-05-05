let mic;
let h_img, r_img;
let angle = 0;
let charge = 0;
let threshold = 0.05;

var bgImg;
var x1 = 0;
var x2;

var scrollSpeed = 2;
function preload() {
  h_img = loadImage('assets/helicopter.png');
  r_img = loadImage('assets/rock.png');
  bgImg = loadImage("assets/bg.jpg");
}

let d=100;
let start;
let score = 0;
let highscore = 0;
let reset = 1;

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
  
  x2 = width;
}

function draw() {
  if(reset==1){
    background(220);
    image(bgImg, 0, 0, width, height);
    textSize(42);
    textAlign(CENTER);
    text("CLICK TO PLAY",width/2,height/2);
    text("SCORE: "+score,width/2,height/2+50);
    
    if(score==highscore){
    	text("NEW HIGHSCORE!!!",width/2,height/2 - 100);
    }
    score = 0;
    noLoop();
  } else {
    background(220);
    push();
    translate(width,0); // move to far corner
    scale(-1.0,1.0);    // flip x-axis backwards
    image(bgImg, x1, 0, width+5, height);
    pop();
    image(bgImg, x2, 0, width, height);

      x1 += scrollSpeed;
      x2 -= scrollSpeed;

      if (x1 > width){
        x1 = -width;
      }
      if (x2 < -width){
        x2 = width;
      }
    
    fill(255);

    r.display();
    h.display();
    r.playspeed(5);
    h.fall(10);
    let vol = mic.getLevel();

    // draw the propeller
    push();
    translate(h.x-h.size/2+5,h.y-h.size/2+5);
    rotate(angle);
    stroke(0);
    fill(255)
    rect(0,0,15,2,5,5);
    pop();

    // when to fly
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

    if(h.y<h.size/2){
      //h.setY(h.r);
      gameOver();
    }
    if(h.y>height-h.size/2){
      //h.setY(height-h.r);
      gameOver();
    }

    // collision detection
    if (r.x < h.x + h.size &&
       r.x + r.size > h.x &&
       r.y < h.y + h.size &&
       r.y + r.size > h.y) {
      gameOver();
    }

    if(r.x < -r.size){
      r.setX(width);
      r.setY(random(0,height));
      r.setSize(random(50,100));
      score += 1;
    }
  
    fill(255)
    textSize(22);
    textAlign(LEFT);
    text("score: "+nfc(score,0),20,30);
    textAlign(RIGHT);
    text("highscore: "+nfc(highscore,0),width-20,30);

    let barsize=100;
    noStroke()
    rect(20+barsize/2,50,barsize,5, 5, 5);
    fill(0);

    if(vol>threshold) {
      vol=threshold;
    }
    let actual = map(vol,0,threshold,0,1,true);
    let x = 20+actual * barsize;
    ellipse(x, 50, 10, 10);
  }
}

function gameOver(){
  r.setX(width);
  r.setY(random(0,height));
  r.setSize(random(50,100));
  h.setY(height/2);
  if(score>highscore){
    highscore = score;
  }
  reset=1;
  r.history = [];
}

function Helicopter(){
  this.x = 200;
  this.y = height/2;
  this.size = 50;
  this.col = color(255);
  
  this.display = function() {
    //ellipse(this.x, this.y, this.r*2);
    //fill(this.col);
    image(h_img, this.x-this.size/2, this.y-this.size/2, this.size, this.size);
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
  
  this.changeColor = function() {
    this.col = color(150);
  }
}

function Rock(){
  this.x = width;
  this.y = random(0,height);
  this.size = 100;
  this.col = color(255);
  this.history = [];
  
  this.display = function() {
    this.history.push(createVector(this.x,this.y));
    for(var i=0; i<this.history.length; i++){
      noStroke();
      colorMode(HSB);
      fill(70-(i*7),255,255,i/10);
      ellipse(this.history[i].x + random(20,30), this.history[i].y + random(-5,5), this.size-i*5);
    }
    colorMode(RGB);
    image(r_img, this.x-this.size/2, this.y - this.size/2 + random(-5,5), this.size, this.size);
    //rect(this.x, this.y, this.size, this.size,10,10);
    //fill(this.col);
    
    if(this.history.length>10) {
      this.history.splice(0,1);
    }
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
}


function mousePressed() {
  reset = 0;
  userStartAudio();
  loop();
}
