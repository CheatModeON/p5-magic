var questions;

var currentQ = 0;

var questionsArr;

var results = "";

var progressBar = [];

function preload() {
  let url = 'questions.json';
  questions = loadJSON(url);
}
function setup() {
  createCanvas(windowWidth, windowHeight);
  //noLoop();

  questionsArr = questions.questions

  for(var i=0; i<questionsArr.length; i++) {
    let question = questionsArr[i].question;
    let answers =  questionsArr[i].answers;
    let correct =  questionsArr[i].correct;

    console.log(question)
    console.log(answers)
    console.log(correct)
    if(i==0){
      progressBar.push(0);
    } else {
      progressBar.push(255);
    }
  }
}

function draw() {
  background(255);
  fill(0);
  textSize(60);
  textAlign(CENTER);
  text(currentQ+1+". "+questionsArr[currentQ].question+"?", width/2, height/4);

  textSize(45);
  text(1+") "+questionsArr[currentQ].answers[0], width/4, height/2);
  text(2+") "+questionsArr[currentQ].answers[1], width/2 + width/4, height/2);
  text(3+") "+questionsArr[currentQ].answers[2], width/4, height/2 + height/4);
  text(4+") "+questionsArr[currentQ].answers[3], width/2 + width/4, height/2 + height/4);

  text(results, width/2, height - (height/8));

  showProgress();
}

function keyPressed() {
  if (keyCode === LEFT_ARROW) {
    previousQ();
  } else if (keyCode === RIGHT_ARROW) {
    nextQ();
  }

  if (`${key}` === "1") {
    selectQ(1);
  } else if (`${key}` === "2") {
    selectQ(2);
  } else if (`${key}` === "3") {
    selectQ(3);
  } else if (`${key}` === "4") {
    selectQ(4);
  }
}

function selectQ(sel){
  if(sel == questionsArr[currentQ].correct){
    results = "Correct";
  } else {
    results = "False";
  }

}
function nextQ(){
  if(currentQ<questionsArr.length-1){
    currentQ += 1;
    results = "";
    progressBar[currentQ]=0;
  }
}
function previousQ(){
  if(currentQ>0){
    currentQ -= 1;
    results = "";
    progressBar[currentQ+1]=255;
  }
}

function showProgress(){

  for(var i = 0; i<questionsArr.length; i++){
    fill(progressBar[i]);
    rect( (i*(width/questionsArr.length-10)) + 10, height-20, width/questionsArr.length, 10);
  }
}
