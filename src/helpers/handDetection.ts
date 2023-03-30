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
import * as mpHands from "@mediapipe/hands";
import * as tf from '@tensorflow/tfjs-core'
import * as tfjsWasm from "@tensorflow/tfjs-backend-wasm";

tfjsWasm.setWasmPaths(
  `https://cdn.jsdelivr.net/npm/@tensorflow/tfjs-backend-wasm@${tfjsWasm.version_wasm}/dist/`
);

import * as handdetection from "@tensorflow-models/hand-pose-detection";

import { Camera } from "./camera";
import { GE } from "./gestureEstimator";

import * as tm from '@teachablemachine/image';

const maxNumHands = 1;
const modelConfig = "full"; // Maybe switch to 'lite'
const runtime = "mediapipe";
const staticCamera = { targetFPS: 60, sizeOption: "640 X 480" };
const modelType = handdetection.SupportedModels.MediaPipeHands;

// TODO TEST
let model: tm.CustomMobileNet;
// const modelFilePath = '../model2/';
const URL = 'https://teachablemachine.withgoogle.com/models/ovzIo2YJg/';
let webcam: tm.Webcam;

let isModelChanged = false;

let detector: handdetection.HandDetector | null, camera: Camera;

async function createDetector() {
  // * Assuming mediapipe
  return handdetection.createDetector(modelType, {
    runtime,
    modelType: modelConfig,
    maxHands: maxNumHands,
    solutionPath: `https://cdn.jsdelivr.net/npm/@mediapipe/hands@${mpHands.VERSION}`,
  });
}

async function renderResult() {
  if (camera?.video?.readyState < 2) {
    await new Promise((resolve) => {
      camera.video.onloadeddata = () => {
        resolve(camera.video);
      };
    });
  }

  let hands: handdetection.Hand[] = null;

  // Detector can be null if initialization failed (for example when loading
  // from a URL that does not exist).
  if (detector != null) {
    // Detectors can throw errors, for example when using custom URLs that
    // contain a model that doesn't provide the expected output.
    try {
      // camera.drawCtx();
      // tf.browser.fromPixels(camera.video).print();
      // await model.model.predict(tf.browser.fromPixels(camera.video))
      // const prediction = await model.predict(camera.ctx.canvas);
      // const prediction = await model.predict(webcam.canvas);
      // console.log(prediction);

      hands = await detector.estimateHands(camera.video, {
        flipHorizontal: false,
      });

      if (hands.length > 0) {
        // const handOrigin = hands[0].
        const pixelKeypoints3D = hands[0].keypoints3D.map(keypoint => [keypoint.x, keypoint.y, keypoint.z])
        const estimatedGestures = await GE.estimate(hands[0].keypoints.map((keypoint, i) => [keypoint.x, keypoint.y, hands[0].keypoints3D[i].z * 600]), 8.5)
        // const estimatedGestures = await GE.estimate(hands[0].keypoints3D.map(keypoint => [keypoint.x, keypoint.y, keypoint.z]), 8.5)
        console.log(estimatedGestures);
        console.log(hands[0].keypoints);
        console.log(hands[0].keypoints.map((keypoint, i) => [keypoint.x, keypoint.y, hands[0].keypoints3D[i].z * 600]));
        
      }
    } catch (error) {
      detector.dispose();
      detector = null;
      alert(error);
    }
  }

  camera.drawCtx(); // TODO replace

  // The null check makes sure the UI is not in the middle of changing to a
  // different model. If during model change, the result is from an old model,
  // which shouldn't be rendered.
  if (hands && hands.length > 0 && !isModelChanged) {
    camera.drawResults(hands); // TODO REPLACE
  }
}

async function renderPrediction() {
  // TODO TEST
  // webcam.update();
  await renderResult();

  requestAnimationFrame(renderPrediction);
}

export async function app() {
  model = await tm.load(`${URL}model.json`, `${URL}metadata.json`);
  camera = await Camera.setupCamera(staticCamera);

  // TODO TEST
  // webcam = new tm.Webcam(640, 480, false);
  // await webcam.setup();
  // await webcam.play();
  // document.getElementById("webcam-container").appendChild(webcam.canvas);

  detector = await createDetector();

  renderPrediction();
}
