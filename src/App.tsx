import { useEffect, useState } from "react";
import { app } from "./helpers/handDetection";
import { app as app2 } from "./helpers/handPose";
import "./App.css";

export function App() {
  const [loading, setLoading] = useState(true);
  useEffect(() => {
    app2().then(() => {
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
    </div>
  );
}

export default App;
