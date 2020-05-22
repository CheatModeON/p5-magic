// Original game: https://www.helicoptergame.net

let LOW_GRAPHICS = false;

let g_one ;
let g_two ;

var clouds = [];
var rocks = [];
var count = 0;
var old_vol = 0;
let mic;
let h_img, r_img;
let angle = 0;
let charge = 0;
let mic_threshold = 0.05;
let altitude = 0;

let score = 0;
let highscore = 0;
let reset = 1;
let firstLoad = 1;

var bgImg;
var x1 = 0;
var x2;
var scrollSpeed = 2;

var ghosts = [];

var resizeFactor;
function preload() {
  h_img = loadImage('assets/helicopter.png');
  r_img = loadImage('assets/rock.png');
  //bgImg = loadImage("assets/bg.jpg");
}

function setup() {
  userStartAudio();
  frameRate(30);

  socket = io.connect('https://helix-server.herokuapp.com');

  socket.on('state', newGhost);

  //let title = select('#title');
  //title.html('Helix - The Game');

  mic = new p5.AudioIn();
  mic.start();

  createCanvas(windowWidth, windowHeight);

  resizeFactor=windowWidth*windowHeight/15000;
  if(resizeFactor<35) {
    h = new Helicopter(30);
  } else if(resizeFactor<80) {
    h = new Helicopter(50);
  } else {
    h = new Helicopter(80);
  }
  r = new Rock();

  rectMode(CENTER);

  background(50,180,250,140);
  initClouds(windowWidth*windowHeight/50000);
  drawClouds();
  g_speed = new gauge(width-2*windowWidth/7, height-50, windowWidth/8, 'speed')
  g_altitude = new gauge(width-windowWidth/8, height-50, windowWidth/8, 'altitude')
  //x2 = width;
}

function draw() {


  if(reset==1){
    //background(220,100);
    //background(50,180,250,140);
    ///image(bgImg, 0, 0, width, height);
    background(50,180,250,140);
    noLoop();
    if(firstLoad==1) {
      shadowText(0, width/10, CENTER, "Welcome to Helix",width/2,height/4, 180);
      shadowText(0, width/25, CENTER, "The voice controlled helicopter",width/2,height/3, 180);
      shadowText(0, width/10, CENTER, "Click once to PLAY",width/2,height/1.2, 180);
      fill(0,100)
      stroke(10);
      rect(width/2,height/1.2 - (width/10) /3, width-width/8, (width/10) * height/ 600)
      firstLoad = 0;
    } else {
      shadowText(0, 32, CENTER, "Click to PLAY again",width/2,height/2-50, 210);
      shadowText(0, 42, CENTER, " Your score: "+score,width/2,height/2, 210);
    }

    if(score==highscore && highscore > 0){
    	shadowText(0, 42, CENTER, "NEW HIGHSCORE!!!",width/2,height/2 + 50, 210);
    }
    score = 0;
  } else {
    sendstate(h.y,reset);

    angleMode(RADIANS);
    // display

    if(!LOW_GRAPHICS){
      drawClouds();
      generateClouds();
    }

    background(50,180,250,140);

    altitude = (height-(h.size/2)-h.y) * 40

    //background(220);
    // background movement

    /*
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
    */
    // background movement

    fill(255);

    r.display();
    h.display();

    for(g=0; g<ghosts.length; g++){
      //fill(0,0,255);
      //noStroke();
      //ellipse(width/6, (ghosts[g].y/100)*height, 20, 20);
      var currY = (ghosts[g].y/100)*height;
      tint(255, 126);
      image(h_img, h.x-h.size/2, currY-h.size/2, h.size, h.size);
      ghosts.splice(g,1)
      tint(255, 255);
    }

    r.playspeed(5); // set play speed
    h.fall(8);     // set falling speed
    let vol = mic.getLevel();

    // draw the propeller
    push();
    angleMode(DEGREES);
    if(resizeFactor<35) {
      translate(h.x-h.size/2 + 3, h.y-h.size/2 + 3);
    } else if(resizeFactor<80) {
      translate(h.x-h.size/2 + 5, h.y-h.size/2 + 8);
    } else {
      translate(h.x-h.size/2 + 8, h.y-h.size/2 + 20);
    }
    rotate(angle);
    stroke(0);
    fill(255)
    rect(0,0,h.size/3.5,h.size/25, 5,5);
    pop();

    // when to fly

    vol = lerp(old_vol,vol,0.1); // LERPing to reduce noice on volume
    let maxSpeed = 20;
    let flightSpeed = 0;

    if(/*mouseIsPressed ||*/ vol > 0.01 /*&& window.global_wink==1*/){
      //map the voice volume to flight speed
      if(vol>mic_threshold) {
        vol=mic_threshold;
      }
      let actual = map(vol,0,mic_threshold,0,1,true);

      flightSpeed = actual * maxSpeed
      h.fly(flightSpeed); // set fly speed
      if(charge < 70){
        charge += 1; // propeller motion
      }
    } else {
      if(charge > 10){
        charge -= 5; // propeller motion
      }
    }
    angle = angle + charge;

    // collision detection (with top-bottom)
    if(h.y<h.size/2){
      gameOver();
    }
    if(h.y>height-h.size/2){
      altitude=0;
      gameOver();
    }

    // collision detection (with a rock)
    if (r.x < h.x + h.size &&
       r.x + r.size > h.x &&
       r.y < h.y + h.size &&
       r.y + r.size > h.y) {
      gameOver();
    }

    // reset rock's random position and size
    if(r.x < -r.size){
      r.setX(width); // it appears on the right edge
      r.setY(random(0,height));
      r.setSize(random(50,100));
      score += 1;
    }

    fill(100,100);
    rect(width/2,0,width,140);
    fill(255);

    // set the texts
    shadowText(255, 22, LEFT, "score: "+nfc(score,0), 20, 30, 150);
    shadowText(255, 22, RIGHT, "highscore: "+nfc(highscore,0), width-20, 30, 150);

    // set the volume bar
    let barsize=width - 40;
    noStroke()
    rect(20+barsize/2,50,barsize,5, 5, 5);
    fill(0,100);
    if(vol>mic_threshold) {
      vol=mic_threshold;
    }
    let actual = map(vol,0,mic_threshold,0,1,true);
    let x = 20+actual * barsize;
    fill(0);
    ellipse(x, 50, 15, 15);

    shadowText(255, 22, RIGHT, "altitude: "+nfc(altitude,0)+ " feet", width/2 + 80, 30, 150);
    old_vol = vol;

    angleMode(RADIANS);

    let gSpeed = map(flightSpeed,0,maxSpeed,0,100);
    let gAlt = map(altitude,0,(height-(h.size/2)) * 40,0,100);
    g_speed.drw(int(gSpeed));
    g_altitude.drw(int(gAlt));
  }

}

function shadowText(f, size, align, txt, x, y, op){
  fill(f, op);
  textSize(size);
  textAlign(align);
  text(txt,x,y);
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

function Helicopter(size){
  this.x = width/6;
  this.y = height/2;
  this.size = size;
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

    if(!LOW_GRAPHICS) {
      this.history.push(createVector(this.x,this.y));
      for(var i=0; i<this.history.length; i++){
        noStroke();
        colorMode(HSB);
        fill(70-(i*7),255,255,i/10);
        ellipse(this.history[i].x + random(20,30), this.history[i].y + random(-5,5), this.size-i*5);
      }
    }

    colorMode(RGB);
    image(r_img, this.x-this.size/2, this.y - this.size/2 + random(-2,2), this.size, this.size);
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

// cloud generation by https://editor.p5js.org/jackiezen/sketches/rJEziNOR
function cloud(x, y, size) {
	fill(255, 255, 255);
	noStroke();
  /*ellipse(x,y,50,30);
ellipse(x,y+20,80,30);
ellipse(x+20,y,40,30);
ellipse(x+30,y+10,70,40);*/
	arc(x, y, 25 * size, 20 * size, PI + TWO_PI, TWO_PI);
	arc(x + 10, y, 25 * size, 45 * size, PI + TWO_PI, TWO_PI);
	arc(x + 25, y, 25 * size, 35 * size, PI + TWO_PI, TWO_PI);
	arc(x + 40, y, 30 * size, 20 * size, PI + TWO_PI, TWO_PI);
}

function initClouds(n){
  clouds = []
  for(var i=0; i<n; i++) {
    var newCloud = {
  		xpos: random(0,width),
  		ypos: random(0,height),
  		size: random(1.8, 2.3)
  	};
  	clouds.push(newCloud);
  }
}

function drawClouds(){
  for (i = 0; i < clouds.length; i++) {
    var currentObj = clouds[i];
    cloud(currentObj.xpos, currentObj.ypos, currentObj.size);
    currentObj.xpos -= 0.5;
    currentObj.ypos += random(-0.5, 0.5);
    if (clouds[i].xpos > width+20) {
      clouds.splice(i, 1);
    }
  }
}

function generateClouds(){
  if(count%100==0){
    var newCloud = {
          xpos: width,
          ypos: random(0,height),
          size: random(1.8, 2.3)
      };
      clouds.push(newCloud);
  }
  count += 1;
}


class gauge {
    constructor(x, y, size, title) {
        this.x = x;
        this.y = y;
        this.size = size;
        this.title = title;
    }
    drw(value) {
        this.value = value;

        stroke(5);
        fill(255);
        //arc(this.x, this.y, 200, 200, 5*QUARTER_PI, -QUARTER_PI);
        arc(this.x, this.y, this.size, this.size, PI, 0, CHORD);

        //fill('#17202A');
        fill(0);
        if(this.value!=0){
          arc(this.x, this.y, this.size, this.size, PI,  (-PI * (100-this.value)/100));
        }
        //fill('#5D6D7E');

        fill(100,100,100);
        if( (this.value<20 || this.value>80) && this.title=="altitude"){
          fill((255* (1+sin(millis() / 80)) /2),0,0);
        }
        if( (this.value<30 || this.value>90) && this.title=="speed"){
          fill((255* (1+sin(millis() / 80)) /2),0,0);
        }
        arc(this.x, this.y, this.size-this.size/10, this.size-this.size/10, -PI, 0);
        noStroke();

        textAlign(CENTER);
        textSize(this.size/6);
        fill(255); //text color
        text( this.value + '%', this.x, this.y-(width/80));
        textSize(this.size/8);
        fill(0); //text color
        text( this.title, this.x, this.y+(width/45));

        fill('#C0392B'); //arrow color
        let angle = -2*QUARTER_PI + (PI * this.value/100) ;
        let x = this.x + this.size/2 * sin(angle);
        let y = this.y - this.size/2 * cos(angle);
        let y1 = this.y - this.size/3 * cos(angle) + this.size/25  * sin(angle);
        let x1 = this.x + this.size/3 * sin(angle) + this.size/25  * cos(angle);
        let y2 = this.y - this.size/3 * cos(angle) - this.size/25  * sin(angle);
        let x2 = this.x + this.size/3 * sin(angle) - this.size/25  * cos(angle);
        triangle(x, y, x1, y1, x2, y2);
    }

}

function newGhost(data){
  if(reset==0){
    ghosts.push(data);
  }
}


function sendstate(ypos, status) {
  yratio = map(ypos, 0, height, 0, 100);
  console.log("sendstate: " + yratio + " " + status);

  var data = {
    y: yratio,
    status: status
  };

  socket.emit('state',data);
}
