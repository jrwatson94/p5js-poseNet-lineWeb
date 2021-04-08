// Copyright (c) 2019 ml5
//
// This software is released under the MIT License.
// https://opensource.org/licenses/MIT


let video;
let poseNet;
let poses = [];
let song, amplitude;

//BACKGROUND ANIMATION
let a = 0, mw, mh; 
let nC = 36;
let r = 100;
let headPosition;
let handRaised = false;




function setup() {
  song = loadSound('assets/hamlet.mp3');
  let canvas = createCanvas(960, 720);
  video = createCapture(VIDEO);
  video.size(width, height);

  //BACKGROUND
  mw = width/2;
  mh = height/2;

  // Create a new poseNet method with a single detection
  poseNet = ml5.poseNet(video, modelReady);
  // This sets up an event that fills the global variable "poses"
  // with an array every time new poses are detected
  poseNet.on('pose', function(results) {
    poses = results;
  });
  // Hide the video element, and just show the canvas
  video.hide();


  canvas.mouseClicked(toggleSound);
  amplitude = new p5.Amplitude();
}

function toggleSound(){
  if (song.isPlaying() ){
    song.stop();
  } else {
    song.play();
  }
}


function modelReady() {
  select('#status').html('Model Loaded');
}

function drawCircle(position, upperBound, lowerBound){
  if(position){
    r = map(position, 0, height, upperBound, lowerBound);
  }

  for (let i = 1; i <= nC; i++)
  {
    fill(255,200+sin(radians(a+(360/nC)*i))*55,200+cos(a+(360/nC)*i)*55);
    ellipse(mw+sin(radians(a+(360/nC)*i))*r,mh+cos(radians(a+(360/nC)*i))*r,10*(r/100),10*(r/100));
  }
  a++;
}

function draw() {
  if(handRaised){
    background(255,0,0);
  }else{
    image(video, 0, 0, width, height);
  }

  //BACKGROUND CREATE CIRCLE
  fill(0,50);
  rect(0,0,width,height);

  

  // We can call both functions to draw all keypoints and the skeletons
  drawKeypoints();
  drawSkeleton();
}

function drawFace(){
  for(let i = 0; i < poses.length; i++){
    let pose = poses[i].pose;
    let nose = pose.keypoints[0];
    let leftEye = pose.keypoints[1];
    let rightEye = pose.keypoints[2];

    headPosition = nose.position.y;
    if(
      nose.score > 0.3 &&
      leftEye.score > 0.3 &&
      rightEye.score > 0.3 
      ){
        fill('red');
        triangle(
          nose.position.x, nose.position.y + 100, 
          leftEye.position.x + 50, leftEye.position.y - 10, 
          rightEye.position.x - 50, rightEye.position.y - 10);

      }
  }
}

// A function to draw ellipses over the detected keypoints
function drawKeypoints()  {
  let level = amplitude.getLevel();
  let size = map(level, 0, 1, 1, 15);
  // Loop through all the poses detected
  for (let i = 0; i < poses.length; i++) {
    // For each pose detected, loop through all the keypoints
    let pose = poses[i].pose;

    //REMOVE EAR KEYPOINTS- seems like they're a bit distracting
    let newKeyPoints = pose.keypoints.filter(item => item.part !== "leftEar" && item.part !== "rightEar");
  

    //DRAW KEYPOINTS
    for (let j = 0; j < newKeyPoints.length; j++) {
      // A keypoint is an object describing a body part (like rightArm or leftShoulder)
      let keypoint = newKeyPoints[j];
      // Only draw an ellipse if the pose probability is bigger than 0.2
      let kx = keypoint.position.x ;
      let ky = keypoint.position.y;
      if (keypoint.score > 0.2) {
        fill(0, 0, 255);
        // noStroke();
        ellipse(kx, ky, 10, 10);

        if(keypoint.part === "leftEye" || keypoint.part === "rightEye"){
          strokeWeight(size);
          line(kx, 0, kx, ky);
        }else if(keypoint.part === "leftShoulder"){
          strokeWeight(size);
          line(kx, ky, width, ky - 300);
          line(kx, ky, width, ky);
          line(kx, ky, width, ky + 300);
        }else if(keypoint.part === "rightShoulder"){
          strokeWeight(size);
          line(kx, ky, 0, ky - 300);
          line(kx, ky, 0, ky);
          line(kx, ky, 0, ky + 300);
        }else if(keypoint.part === "rightWrist"){
          strokeWeight(size);
          line(kx, ky, 0, height);
          line(kx, ky, 50, height);
          line(kx, ky, 100, height);
          line(kx, ky, 0, height- 50);
          line(kx, ky, 0, height - 100);
          if(ky < pose.keypoints[0].position.y){
            console.log("Hand raised");
            handRaised = true;
          }else{
            handRaised = false;
          }
          
        }else if(keypoint.part === "leftWrist"){
          strokeWeight(size);
          line(kx, ky, width, height);
          line(kx, ky, width, height-50);
          line(kx, ky, width, height -100);
          line(kx, ky, width - 50, height);
          line(kx, ky, width - 100, height);
          if(ky < pose.keypoints[0].position.y){
            handRaised = true;
          }
        }
      }
    }
  }
}

// A function to draw the skeletons
function drawSkeleton() {
  // Loop through all the skeletons detected
  for (let i = 0; i < poses.length; i++) {
    let skeleton = poses[i].skeleton;
    // For every skeleton, loop through all body connections
    for (let j = 0; j < skeleton.length; j++) {
      let partA = skeleton[j][0];
      let partB = skeleton[j][1];
      
      stroke(0, 0, 255);
      strokeWeight(10);
      line(partA.position.x, partA.position.y, partB.position.x, partB.position.y);
    }
  }
}
