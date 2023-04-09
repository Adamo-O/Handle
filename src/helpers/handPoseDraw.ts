import { AnnotatedPrediction } from "@tensorflow-models/handpose";
import { Coords3D } from "@tensorflow-models/handpose/dist/pipeline";

const DEFAULT_LINE_WIDTH = 2;

//finger points
const fingerJoints = {
  thumb:[0,1,2,3,4],
  index:[0,5,6,7,8],
  mid:[0,9,10,11,12],
  ring:[0,13,14,15,16],
  pinky:[0,17,18,19,20]
};

//drawing function
export const drawHand = (prediction: AnnotatedPrediction[], ctx: CanvasRenderingContext2D) => {
  //check the prediction
  if(prediction.length > 0){
    //loop to the preditions
    prediction.forEach((prediction) =>{        
        const cdtimer = document.getElementById('countdown-timer');
        cdtimer.style.display = 'inline';
                
        cdtimer.style.top = (prediction.annotations.middleFinger[0][1] - 100).toString() + "px";
        cdtimer.style.left = (ctx.canvas.width - prediction.annotations.middleFinger[0][0] - 100).toString() + "px";

          //grab landmarks
          const landmarks = prediction.landmarks;

          //loop the finger joints
          for(let j = 0; j<Object.keys(fingerJoints).length; j++){
              let finger = Object.keys(fingerJoints)[j];
              for(let k=0; k<fingerJoints[finger].length -1; k++){
                  const firstJointIndex = fingerJoints[finger][k];
                  const secondJointIndex = fingerJoints[finger][k+1];

                  //draw joints
                  ctx.beginPath();
                  ctx.moveTo(
                      landmarks[firstJointIndex][0],
                      landmarks[firstJointIndex][1]);
                      ctx.lineTo(
                          landmarks[secondJointIndex][0],
                          landmarks[secondJointIndex][1]
                      );
                  ctx.strokeStyle = "gold";
                  ctx.lineWidth = 2;
                  ctx.stroke();
              }
          }

          //loop to landmarks and draw them
          for(let i = 0; i<landmarks.length; i++){
              //get x point
              const x = landmarks[i][0];

              //get y point
              const y = landmarks[i][1];

              //start drawing
              ctx.beginPath();
              ctx.arc(x,y, 5, 0, 3*Math.PI);

              //set line color
              ctx.fillStyle = "navy";
              ctx.fill();
          }
      })
  }
}

export const newDrawHand = (hands: AnnotatedPrediction[], ctx: CanvasRenderingContext2D) => {
  ctx.fillStyle = "Red";
  ctx.strokeStyle = "White";
  ctx.lineWidth = DEFAULT_LINE_WIDTH;

  if (hands.length > 0) {
    hands.forEach(hand => {
      hand.landmarks.forEach(landmark => {
        for (let i = 0; i < landmark.length; i++) {
          const y = landmark[0];
          const x = landmark[1];
          drawPoint(x - 2, y - 2, 3, ctx);
        }
      })
    
      const fingers = Object.keys(fingerJoints);
      for (let i = 0; i < fingers.length; i++) {
        const finger = fingers[i];
        const points: Coords3D = fingerJoints[finger].map((idx: number) => hand.landmarks[idx]);
        drawPath(points, false, ctx);
      }
    })
  }
}

function drawPath(points: Coords3D, closePath: boolean, ctx: CanvasRenderingContext2D) {
  const region = new Path2D();
  region.moveTo(points[0][0], points[0][1]);
  for (let i = 1; i < points.length; i++) {
    const point = points[i];
    region.lineTo(point[0], point[1]);
  }

  if (closePath) {
    region.closePath();
  }
  ctx.stroke(region);
}

function drawPoint(y: number, x: number, r: number, ctx: CanvasRenderingContext2D) {
  ctx.beginPath();
  ctx.arc(x, y, r, 0, 2 * Math.PI);
  ctx.fill();
}
