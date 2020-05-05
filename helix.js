let mic;
let h_img, r_img;
let angle = 0;
let charge = 0;
let threshold = 0.05;
function preload() {
  h_img = loadImage('assets/helicopter.png');
  r_img = loadImage('assets/rock.png');
}

let d=100;
let start;
let score = 0;
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
  
}

function draw() {
  if(reset==1){
    background(220);
    textSize(42);
    textAlign(CENTER);
    text("CLICK TO PLAY",width/2,height/2);
    noLoop();
  } else {
    background(220);
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
      h.setY(height/2);
      r.setX(width);
      r.setY(random(0,height));
      score=0;
      reset=1;
    }
    if(h.y>height-h.size/2){
      //h.setY(height-h.r);
      h.setY(height/2);
      r.setX(width);
      r.setY(random(0,height));
      score=0;
      reset=1;
    }

    // collision detection
    if (r.x < h.x + h.size &&
       r.x + r.size > h.x &&
       r.y < h.y + h.size &&
       r.y + r.size > h.y) {
      r.setX(width);
      r.setY(random(0,height));
      r.setSize(random(50,100));
      h.setY(height/2);
      score = 0;
      reset=1;
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
      let ran = random(10,this.size);
      colorMode(HSB);
      fill(255,255,i*25);
      ellipse(this.history[i].x+random(30,60),this.history[i].y+random(-10,10),ran,ran);
    }
    colorMode(RGB);
    image(r_img, this.x-this.size/2, this.y-this.size/2, this.size, this.size);
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
