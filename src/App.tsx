import { useEffect, useRef, useState } from "react";
// import { app } from "./helpers/handDetection"; // TODO TEST
// import { app as app2 } from "./helpers/handPose"; // TODO TEST
import "./App.css";
import { CountdownCircleTimer } from "react-countdown-circle-timer";
import Wordle from "./wordle";

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
  const [isCountingDown, setIsCountingDown] = useState(false);
  const [input, setInput] = useState<string>("");

  const addWordButtonRef = useRef<HTMLButtonElement>(null);

  useEffect(() => {
    clearTimeout(timeoutID);
    const timeoutid = setTimeout(
      (previousLetter) => {
        if (
          previousLetter &&
          currentLetter &&
          previousLetter === currentLetter
        ) {
          if (input.length < 5 && currentLetter !== "👍") {
            setSelectedLetter(currentLetter);
            setInput((currInput) => currInput + currentLetter);
          } else if (input.length === 5 && currentLetter === "👍") {
            addWordButtonRef.current.click();
          }
        }
        console.log(currentLetter);
      },
      3000,
      currentLetter
    );

    setTimeoutID(timeoutid);
    setIsCountingDown(true);

    return () => {
      clearTimeout(timeoutID);
    };
  }, [currentLetter]);

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
        } else {
          document.getElementById("countdown-timer").style.display = "none";
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
    <div
      className="App"
      tabIndex={0}
      onKeyDown={(e) => {
        if (e.key === "Enter") {
          addWordButtonRef.current.click();
        }
      }}
    >
      <h1>Handle</h1>
      {loading && <h2>Loading 🔃</h2>}
      <div className="flex flex-wrap gap-6">
        <div>
          <div className="canvas-wrapper relative inline">
            <canvas id="output"></canvas>
            <video
              id="video"
              playsInline
              style={{
                WebkitTransform: "scaleX(-1)",
                transform: "scaleX(-1)",
                display: "none",
                visibility: "hidden",
                width: "auto",
                height: "auto",
              }}
            ></video>
            <div
              id="countdown-timer"
              style={{ position: "absolute", display: "none" }}
            >
              {currentLetter && isCountingDown && (
                <CountdownCircleTimer
                  key={currentLetter}
                  onComplete={() => {
                    setIsCountingDown(false);
                    document.getElementById("countdown-timer").style.display =
                      "none";
                    return { shouldRepeat: false };
                  }}
                  isPlaying
                  colors="#E5007B"
                  duration={3}
                  size={250}
                >
                  {({ remainingTime }) => (
                    <div className="flex flex-col">
                      <h2 className="font-bold text-2xl">{currentLetter}</h2>
                      <h3 className="font-bold text-lg">{remainingTime}</h3>
                    </div>
                  )}
                  {/* <p>{countDown}</p> */}
                </CountdownCircleTimer>
              )}
            </div>
          </div>
          <div id="webcam-container"></div>
        </div>
        <Wordle
          input={input}
          setInput={setInput}
          addWordButtonRef={addWordButtonRef}
        />
      </div>
      {!loading && (
        <>
          <h2>{currentLetter}</h2>
          <h3>Confidence score: {confidence * 10}%</h3>
          <h2>CONFIRMED letter: {selectedLetter}</h2>
        </>
      )}
      <input
        value={input}
        placeholder="temp input"
        onChange={(e) => {
          if (
            e.target.value.length <= 5 &&
            (/^[a-zA-Z]+$/.test(e.target.value) || e.target.value === "")
          ) {
            setInput(e.target.value);
          }
        }}
      />
    </div>
  );
}

export default App;
