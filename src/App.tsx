import { useEffect, useState } from "react";
// import { app } from "./helpers/handDetection"; // TODO TEST
// import { app as app2 } from "./helpers/handPose"; // TODO TEST
import "./App.css";

// TODO TEST
import "@tensorflow/tfjs-backend-webgl";
import * as tf from "@tensorflow/tfjs-core";
import * as tfjsWasm from "@tensorflow/tfjs-backend-wasm";

tfjsWasm.setWasmPaths(
  `https://cdn.jsdelivr.net/npm/@tensorflow/tfjs-backend-wasm@${tfjsWasm.version_wasm}/dist/`
);

import * as handpose from "@tensorflow-models/handpose";

import { Camera } from "./helpers/camera";
import { GE } from "./helpers/gestureEstimator";

import { drawHand, newDrawHand } from "./helpers/handPoseDraw";

export function App() {
  const [loading, setLoading] = useState(true);
  const [currentLetter, setCurrentLetter] = useState<string>();
  const [selectedLetter, setSelectedLetter] = useState<string>();
  const [confidence, setConfidence] = useState<number>(0);
  const [timeoutID, setTimeoutID] = useState<NodeJS.Timeout>();
  const [intervalID, setIntervalID] = useState<NodeJS.Timeout>();
  const [selectedLetterProgress, setSelectedLetterProgress] = useState<number>(0);

  useEffect(() => {
    clearTimeout(timeoutID);
    // TODO make interval to track progress on holding the same letter for 3 seconds
    // clearInterval(intervalID);
    
    // const selectedInterval = setInterval(() => {
    //   if (selectedLetterProgress >= 100) {
    //     console.log('finished interval fuck');
        
    //     clearInterval(selectedInterval);
    //     setSelectedLetterProgress(0);
    //     return;
    //   } else {        
    //     setSelectedLetterProgress(currProgress => currProgress + (100/3000 * 100));
    //   }
    // }, 100)

    const timeoutid = setTimeout((previousLetter) => {
      if (previousLetter && currentLetter && previousLetter === currentLetter) {
        setSelectedLetter(currentLetter);
      }
      console.log(currentLetter);
    }, 3000, currentLetter)

    setTimeoutID(timeoutid);
    // setIntervalID(selectedInterval)
  
    return () => {
      clearTimeout(timeoutID);
      // clearInterval(selectedInterval);
    }
  }, [currentLetter])
  
  const staticCamera = { targetFPS: 60, sizeOption: "640 X 480" };

  let detector: handpose.HandPose, camera: Camera;

  async function createDetector() {
    return await handpose.load();
  }

  async function renderResult() {
    if (camera?.video?.readyState < 2) {
      await new Promise((resolve) => {
        camera.video.onloadeddata = () => {
          resolve(camera.video);
        };
      });
    }

    let hands: handpose.AnnotatedPrediction[] = null;

    // Detector can be null if initialization failed (for example when loading
    // from a URL that does not exist).
    if (detector != null) {
      // Detectors can throw errors, for example when using custom URLs that
      // contain a model that doesn't provide the expected output.
      try {
        hands = await detector.estimateHands(camera.video, false);

        if (hands.length > 0) {
          const estimatedGestures = await GE.estimate(hands[0].landmarks, 6.5);

          if (
            estimatedGestures.gestures &&
            estimatedGestures.gestures.length > 0
          ) {
            const confidence = estimatedGestures.gestures.map((p) => p.score);
            const maxConfidence = Math.max.apply(undefined, confidence);
            const maxConfidenceIndex = confidence.indexOf(maxConfidence);

            // console.log(estimatedGestures);
            setCurrentLetter(
              estimatedGestures.gestures[maxConfidenceIndex].name
            );
            setConfidence(maxConfidence);
          }
        }
        else {
          setCurrentLetter(null);
        }
      } catch (error) {
        detector = null;
        alert(error);
      }
    }

    camera.drawCtx();
    drawHand(hands, camera.ctx); // Blue and yellow hands
    // newDrawHand(hands, camera.ctx); // Red and white hands
  }

  // Render on each frame
  async function renderPrediction() {
    await renderResult();
    requestAnimationFrame(renderPrediction);
  }

  // Initialize camera and detector
  async function app() {
    camera = await Camera.setupCamera(staticCamera);
    detector = await createDetector();
    renderPrediction();
  }

  useEffect(() => {
    app().then(() => {
      console.log("finished loading");

      setLoading(false);
    });
    // app().then(() => {
    //   console.log("finished loading");

    //   setLoading(false);
    // });
  }, []);

  return (
    <div className="App">
      <h1>Handle</h1>
      {loading && <h2>Loading 🔃</h2>}
      <div className="canvas-wrapper">
        <canvas id="output"></canvas>
        <video
          id="video"
          playsInline
          style={{
            WebkitTransform: "scaleX(-1)",
            transform: "scaleX(-1)",
            visibility: "hidden",
            width: "auto",
            height: "auto",
          }}
        ></video>
      </div>
      <div id="webcam-container"></div>
      {!loading && (
        <>
          <h2>{currentLetter}</h2>
          <h3>Confidence score: {confidence * 10}%</h3>
          <h2>CONFIRMED letter: {selectedLetter}</h2>
          <div>
            <div className="bg-green-500" style={{ width: `${selectedLetterProgress}%` }}>s</div>
            <p>{selectedLetterProgress}%</p>
          </div>
        </>
      )}
    </div>
  );
}

export default App;
