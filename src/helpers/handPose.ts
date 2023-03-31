/**
 * @license
 * Copyright 2021 Google LLC. All Rights Reserved.
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 * https://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 * =============================================================================
 */

import "@tensorflow/tfjs-backend-webgl";
import * as tf from '@tensorflow/tfjs-core'
import * as tfjsWasm from "@tensorflow/tfjs-backend-wasm";

tfjsWasm.setWasmPaths(
  `https://cdn.jsdelivr.net/npm/@tensorflow/tfjs-backend-wasm@${tfjsWasm.version_wasm}/dist/`
);

import * as handpose from "@tensorflow-models/handpose";

import { Camera } from "./camera";
import { GE } from "./gestureEstimator";

import { drawHand, newDrawHand } from "./handPoseDraw";

const staticCamera = { targetFPS: 60, sizeOption: "640 X 480" };

let detector: handpose.HandPose, camera: Camera;
let rafId: number;

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

        if (estimatedGestures.gestures && estimatedGestures.gestures.length > 0) {
          const confidence = estimatedGestures.gestures.map(p => p.score)
          const maxConfidence = confidence.indexOf(
            Math.max.apply(undefined, confidence)
          )
  
          console.log(maxConfidence, estimatedGestures.gestures);
          
          console.log(estimatedGestures.gestures[maxConfidence].name);
        }
      }
    } catch (error) {
      detector = null;
      alert(error);
    }
  }

  camera.drawCtx();
  drawHand(hands, camera.ctx);
  // newDrawHand(hands, camera.ctx);
}

async function renderPrediction() {
  await renderResult();
  rafId = requestAnimationFrame(renderPrediction);
}

export async function app() {
  camera = await Camera.setupCamera(staticCamera);

  detector = await createDetector();

  renderPrediction();
}
