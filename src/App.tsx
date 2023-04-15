import { useEffect, useRef, useState } from "react";
// import { app } from "./helpers/handDetection"; // TODO TEST
// import { app as app2 } from "./helpers/handPose"; // TODO TEST
import "./App.css";
import { CountdownCircleTimer } from "react-countdown-circle-timer";
import Wordle from "./wordle";
import Modal from "react-modal";

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
import Box from "./wordle/components/Box";

export function App() {
  const [loading, setLoading] = useState(true);
  const [currentLetter, setCurrentLetter] = useState<string>();
  const [selectedLetter, setSelectedLetter] = useState<string>();
  const [confidence, setConfidence] = useState<number>(0);
  const [timeoutID, setTimeoutID] = useState<NodeJS.Timeout>();
  const [isCountingDown, setIsCountingDown] = useState(false);
  const [input, setInput] = useState<string>("");
  const [modalIsOpen, setModalIsOpen] = useState(false);

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
      {/* {!loading && (
        <>
          <h2>{currentLetter}</h2>
          <h3>Confidence score: {confidence * 10}%</h3>
          <h2>CONFIRMED letter: {selectedLetter}</h2>
        </>
      )} */}
      <div className="flex flex-row gap-2">
        {input?.split("").map((letter) => (
          <Box t="display" letter={letter} />
        ))}
      </div>
      {input ? (
        <div className="my-4">
          <button
            className="rounded border border-slate-600 bg-slate-200 text-black transition-colors hover:bg-slate-400 disabled:bg-slate-300 dark:border-0 dark:bg-gray-800 dark:text-slate-100 dark:hover:bg-gray-600"
            onClick={() => setInput("")}
          >
            {" "}
            Clear Input{" "}
          </button>
        </div>
      ) : (
        <div />
      )}

      <button
        onClick={() => setModalIsOpen(true)}
        className="rounded border border-slate-600 bg-slate-200 text-black transition-colors hover:bg-slate-400 disabled:bg-slate-300 dark:border-0 dark:bg-gray-800 dark:text-slate-100 dark:hover:bg-gray-600"
      >
        Need Help?
      </button>

      <Modal
        isOpen={modalIsOpen}
        onRequestClose={() => setModalIsOpen(false)}
        className="rounded border border-slate-600 bg-slate-200 dark:border-0 dark:bg-gray-800 dark:text-slate-100 w-3/4 h-auto absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2"
      >
        <button
          className="absolute top-0 right-0 m-4"
          onClick={() => setModalIsOpen(false)}
        >
          X
        </button>
        <h1 className="text-white text-center my-6">ASL Cheat Sheet</h1>
        <div className="flex items-center justify-center">
          <img
            src="https://images.fineartamerica.com/images/artworkimages/mediumlarge/3/asl-sign-language-hand-alphabet-teacher-qwerty-designs.jpg"
            alt="Image description"
            className="w-3/5 h-auto flex justify-center mb-20"
          />
        </div>
      </Modal>
    </div>
  );
}

export default App;
