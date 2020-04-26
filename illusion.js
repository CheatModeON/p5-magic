// https://codepen.io/mattboldt/pen/hcoJC
// the beggining: https://math.stackexchange.com/questions/206659/dividing-circle-into-six-equal-parts-and-know-the-coordinates-of-each-diving-poi


let r = 400;
let n = 16;
let speed = [1,1,1,1,1,1,1,1];
let extra_speed = [1,1,1,1,1,1,1,1];
let start_pxl = 40;
let x = [-r+start_pxl,-r+start_pxl,-r+start_pxl,-r+start_pxl,-r+start_pxl,-r+start_pxl,-r+start_pxl,-r+start_pxl]
let dir = [1,1,1,1,1,1,1,1];
let show_lines = 0;

function setup() {  
  createCanvas(r*2, r*2);
  angleMode(DEGREES);
  background(255);
}

function draw() {
  fill(0);
  ellipse(width/2, width/2,r*2, r*2)
  
  translate(r,r);
  
  fill(255)
  ellipse(x[0],0,20,20);
  
  if(x[0]>r-start_pxl || x[0]<-r+start_pxl){
    speed[0] = -speed[0];
    dir[0] = -dir[0];
  }
  if(dir[0] == 1){
    if(x[0]<0){
      speed[0] = speed[0] + extra_speed[0]*0.5;
    }
    if(x[0]>0){
      speed[0] = speed[0] - extra_speed[0]*0.5;
    }
  }
  if(dir[0] == -1){
    if(x[0]<0){
      speed[0] = speed[0] - extra_speed[0]*0.5;
    }
    if(x[0]>0){
      speed[0] = speed[0] + extra_speed[0]*0.5;
    }
  }
  
  
  for(i=1; i<n/2 ; i++){
    if(frameCount>i*10){

      if(x[i]>r-start_pxl || x[i]<-r+start_pxl){
        speed[i] = -speed[i];
        //extra_speed = -extra_speed;
        dir[i] = -dir[i];
      }
      if(dir[i] == 1){
        if(x[i]<0){
          speed[i] = speed[i] + extra_speed[i]*0.5;
        }
        if(x[i]>0){
          speed[i] = speed[i] - extra_speed[i]*0.5;
        }
      }
      if(dir[i] == -1){
        if(x[i]<0){
          speed[i] = speed[i] - extra_speed[i]*0.5;
        }
        if(x[i]>0){
          speed[i] = speed[i] + extra_speed[i]*0.5;
        }
      }
      rotate(22.5);
      ellipse(x[i],0,20,20);

      x[i] = x[i] + speed[i] ;
    }


  }
  x[0] = x[0] + speed[0] ;
  
  if(frameCount%500==0){
    show_lines = 1;
  } 
  
  if(frameCount%1000==0){
    show_lines = 0;
  } 
  
  
  if(show_lines == 1){
    stroke(100);
    for(i=0;i<n/2;i++){
      rotate(22.5);
      line(-r,0,r,0);
    }
  }
   
}


