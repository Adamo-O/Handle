import { useEffect, useRef, useState } from "react";
import "./App.css";
import { CountdownCircleTimer } from "react-countdown-circle-timer";
import Wordle from "./wordle";
import wavingHandUrl from "./assets/waving-hand.gif";
import "@tensorflow/tfjs-backend-webgl";
import * as tfjsWasm from "@tensorflow/tfjs-backend-wasm";

tfjsWasm.setWasmPaths(
  `https://cdn.jsdelivr.net/npm/@tensorflow/tfjs-backend-wasm@${tfjsWasm.version_wasm}/dist/`
);

import * as handpose from "@tensorflow-models/handpose";

import { Camera } from "./helpers/camera";
import { GE } from "./helpers/gestureEstimator";

import { drawHand } from "./helpers/handPoseDraw";
import Box from "./wordle/components/Box";

export function App() {
  const [loading, setLoading] = useState(true);
  const [currentLetter, setCurrentLetter] = useState<string>();
  const [timeoutID, setTimeoutID] = useState<NodeJS.Timeout>();
  const [isCountingDown, setIsCountingDown] = useState(false);
  const [input, setInput] = useState<string>("");
  const [modalIsOpen, setModalIsOpen] = useState(false);

  const addWordButtonRef = useRef<HTMLButtonElement>(null);

  // New letter shown, reset countdown
  useEffect(() => {
    clearTimeout(timeoutID);
    const timeoutid = setTimeout(
      (previousLetter) => {
        if (
          previousLetter &&
          currentLetter &&
          previousLetter === currentLetter
        ) {
          // Confirm full word using thumbs up sign
          if (input.length < 5 && currentLetter !== "👍") {
            setInput((currInput) => currInput + currentLetter);
          } else if (input.length === 5 && currentLetter === "👍") {
            addWordButtonRef.current.click();
          }
        }
        console.log(currentLetter);
      },
      2000,
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

            setCurrentLetter(
              estimatedGestures.gestures[maxConfidenceIndex].name
            );
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
      setLoading(false);
    });
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
      <div className="flex gap-3 items-center">
        <h1 className="font-bold align-middle">Handle</h1>
        <img width={50} height={50} className="inline" src={wavingHandUrl} />
      </div>
      <div className="max-w-xl mb-2">
        <h2 className="text-xl mb-2">Welcome to the Handle prototype!</h2>
        <div className="mb-2">
          <p>Use American Sign Language letters to spell a five-letter word.</p>
          <p>
            If you would like help with the ASL alphabet, click the "Show alphabet"
            button for a cheat sheet.
          </p>
        </div>
        <h2 className="text-2xl font-semibold">Rules</h2>
        <p className="mb-2">
          The game works like the popular game Wordle. Guess a 5 letter word,
          and the letters will change colour depending on its presence in the
          correct word.
        </p>
        <div className="flex flex-col gap-3 mb-2">
          <div className="flex flex-row gap-2">
            <Box
              style={{ maxWidth: "2rem", height: "2rem" }}
              t="wrong"
              letter=""
            />
            <p className="self-center">
              Incorrect letter. It does not belong to the word.
            </p>
          </div>
          <div className="flex flex-row gap-2">
            <Box
              style={{ maxWidth: "2rem", height: "2rem" }}
              t="wplaced"
              letter=""
            />
            <p className="self-center">
              Misplaced letter. It belongs to the word, but is in the wrong
              position.
            </p>
          </div>
          <div className="flex flex-row gap-2">
            <Box
              style={{ maxWidth: "2rem", height: "2rem" }}
              t="right"
              letter=""
            />
            <p className="self-center">
              Correct letter. It belongs to the word, and is in the right
              position.
            </p>
          </div>
        </div>
      </div>

      <h2 className="text-2xl font-semibold">Ways to confirm your guess</h2>
      <ul className="list-disc ml-6 mb-3">
        <li>Make a Thumbs Up 👍 gesture</li>
        <li>Press the "Enter" key</li>
        <li>Click the "Enter" button on the bottom right</li>
      </ul>

      {loading && <h2>Loading Video... 🔃</h2>}
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
                  duration={2}
                  size={250}
                >
                  {({ remainingTime }) => (
                    <div className="flex flex-col">
                      <h2 className="font-bold text-2xl text-white">
                        {currentLetter}
                      </h2>
                      <h3 className="font-bold text-lg text-white">
                        {remainingTime}
                      </h3>
                    </div>
                  )}
                </CountdownCircleTimer>
              )}
            </div>
          </div>
          <div id="webcam-container"></div>
        </div>
        {modalIsOpen && (
          <div>
            <img
              src="https://images.fineartamerica.com/images/artworkimages/mediumlarge/3/asl-sign-language-hand-alphabet-teacher-qwerty-designs.jpg"
              alt="ASL Alphabet hint"
              className="h-[425px] mb-3"
            />
            <button
              className="w-full rounded border border-slate-600 bg-slate-200 text-black transition-colors hover:bg-slate-400 disabled:bg-slate-300 dark:border-0 dark:bg-gray-800 dark:text-slate-100 dark:hover:bg-gray-600 "
              onClick={() => setModalIsOpen(false)}
            >
              Hide
            </button>
          </div>
        )}
        <Wordle
          input={input}
          setInput={setInput}
          addWordButtonRef={addWordButtonRef}
        />
      </div>
      <div className="flex flex-row gap-2">
        {input?.split("").map((letter, index) => (
          <Box key={index} t="display" letter={letter} />
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
        onClick={() => setModalIsOpen((curr) => !curr)}
        className="rounded border border-slate-600 bg-slate-200 text-black transition-colors hover:bg-slate-400 disabled:bg-slate-300 dark:border-0 dark:bg-gray-800 dark:text-slate-100 dark:hover:bg-gray-600 mb-3"
      >
        {modalIsOpen ? "Hide" : "Show"} alphabet
      </button>
    </div>
  );
}

export default App;
