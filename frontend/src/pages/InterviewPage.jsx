import React, { useState, useRef, useEffect } from "react";
import { Model, Recognizer } from "vosk-browser";
import "../components/InterviewPage.css";

const VOSK_MODEL_URL = "/vosk_model/vosk-model-small-en-us-0.15";

const InterviewPage = () => {
  const [text, setText] = useState("");
  const [isRecording, setIsRecording] = useState(false);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(true);
  const videoRef = useRef(null);
  const recognizerRef = useRef(null);
  const mediaStreamRef = useRef(null);
  const audioContextRef = useRef(null);
  // Load Vosk model
  useEffect(() => {
    const loadModel = async () => {
      try {
        // Use the Model constructor to load the model
        const model = await new Model(VOSK_MODEL_URL); 
        recognizerRef.current = new Recognizer(model, {
          // Set options as needed
        });
        setLoading(false);
      } catch (err) {
        console.error("Failed to load Vosk model:", err);
        setError("Failed to load speech model.");
      }
    };

    loadModel();

    return () => {
      if (recognizerRef.current) {
        recognizerRef.current.free();
      }
    };
  }, []);  

  // Access the user's camera
  useEffect(() => {
    const enableCamera = async () => {
      try {
        const stream = await navigator.mediaDevices.getUserMedia({ video: true });
        if (videoRef.current) {
          videoRef.current.srcObject = stream;
        }
      } catch (err) {
        console.error("Error accessing the camera:", err);
        setError("Camera access denied. Please allow access.");
      }
    };

    enableCamera();

    return () => {
      if (videoRef.current?.srcObject) {
        videoRef.current.srcObject.getTracks().forEach(track => track.stop());
      }
    };
  }, []);

  const startListening = async () => {
    if (!recognizerRef.current) {
      setError("Vosk model not loaded.");
      return;
    }

    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      mediaStreamRef.current = stream;
      audioContextRef.current = new AudioContext();
      const source = audioContextRef.current.createMediaStreamSource(stream);
      const processor = audioContextRef.current.createScriptProcessor(4096, 1, 1);

      source.connect(processor);
      processor.connect(audioContextRef.current.destination);

      processor.onaudioprocess = (event) => {
        const input = event.inputBuffer.getChannelData(0);
        recognizerRef.current.acceptWaveform(input);
        
        const result = recognizerRef.current.finalResult();
        if (result && result.text) {
          setText((prev) => prev + " " + result.text);
        }
      };

      setIsRecording(true);
    } catch (err) {
      console.error("Error accessing microphone:", err);
      setError("Microphone access denied.");
    }
  };

  const stopListening = () => {
    if (mediaStreamRef.current) {
      mediaStreamRef.current.getTracks().forEach(track => track.stop());
    }
    if (audioContextRef.current) {
      audioContextRef.current.close();
    }
    setIsRecording(false);
  };

  return (
    <div className="interview-container">
      <h2>Your Screen</h2>
      <video ref={videoRef} autoPlay playsInline style={{ width: "100%", maxWidth: "500px", margin: "20px 0" }} />
      <button onClick={startListening} disabled={isRecording || loading}>
        {isRecording ? "Listening..." : loading ? "Loading Model..." : "Start Recording"}
      </button>
      <button onClick={stopListening} disabled={!isRecording} className="stop-button">
        Stop Recording
      </button>
      <button onClick={() => setText("")} disabled={!text}>
        Clear Text
      </button>
      <p><strong>Live Speech Output:</strong> {text}</p>
      {error && <p className="error-message">{error}</p>}
    </div>
  );
};

export default InterviewPage;
