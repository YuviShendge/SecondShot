import React, { useState, useRef, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import "../components/Peripherals.css";

const PeripheralsCheckPage = () => {
  const navigate = useNavigate();
  const [cameraError, setCameraError] = useState("");
  const [micError, setMicError] = useState("");
  const [speakerError, setSpeakerError] = useState("");
  const [micLevel, setMicLevel] = useState(0);
  const [isMicTesting, setIsMicTesting] = useState(false);
  const [isCameraLoading, setIsCameraLoading] = useState(false);

  const [cameras, setCameras] = useState([]);
  const [microphones, setMicrophones] = useState([]);
  const [speakers, setSpeakers] = useState([]);
  const [selectedCamera, setSelectedCamera] = useState("");
  const [selectedMic, setSelectedMic] = useState("");
  const [selectedSpeaker, setSelectedSpeaker] = useState("");

  const videoRef = useRef(null);
  const audioContextRef = useRef(null);
  const micInputRef = useRef(null);
  const analyserRef = useRef(null);
  const animationFrameRef = useRef(null);
  const micStreamRef = useRef(null);
  const videoStreamRef = useRef(null);
  const [selectedQuestions, setSelectedQuestions] = useState([]);

  const handleQuestionSelect = (question) => {
    setSelectedQuestions((prev) =>
      prev.includes(question)
        ? prev.filter((q) => q !== question)
        : [...prev, question]
    );
  };
  
  const questions = [
    "Tell me about yourself.",
    "What is your greatest accomplishment?",
    "Tell me about a time you had to learn something quickly.",
    "Tell me about a time you made a mistake, how did you handle it?",
    "What is your favorite class you have taken related to your major?",
    "What are your strengths?",
    "What are your weaknesses?",
    "Describe a time you failed and what you learned.",
    "Describe a time where you were under stress or pressure",
    "Describe your favorite project on your resume.",
    "What makes you a good fit for this position?",
    "What do you hope to gain from this role?"
  ];
  useEffect(() => {
    // Fetch available devices
    navigator.mediaDevices.enumerateDevices().then((devices) => {
      setCameras(devices.filter(device => device.kind === "videoinput"));
      setMicrophones(devices.filter(device => device.kind === "audioinput"));
      setSpeakers(devices.filter(device => device.kind === "audiooutput"));

      if (devices.length > 0) {
        setSelectedCamera(devices.find(device => device.kind === "videoinput")?.deviceId || "");
        setSelectedMic(devices.find(device => device.kind === "audioinput")?.deviceId || "");
        setSelectedSpeaker(devices.find(device => device.kind === "audiooutput")?.deviceId || "");
      }
    });
  }, []);

  // Enable selected camera
  const getCameras = async () => {
    try {
      const devices = await navigator.mediaDevices.enumerateDevices();
      const videoDevices = devices.filter(device => device.kind === "videoinput");
      setCameras(videoDevices);
      if (videoDevices.length > 0 && !selectedCamera) {
        setSelectedCamera(videoDevices[0].deviceId);
      }
    } catch (err) {
      console.error("Error fetching cameras:", err);
    }
  };

  useEffect(() => {
    getCameras();
  }, []);

  const stopVideoStream = () => {
    if (videoStreamRef.current) {
      videoStreamRef.current.getTracks().forEach(track => track.stop());
      videoStreamRef.current = null;
    }
    
    if (videoRef.current && videoRef.current.srcObject) {
      const tracks = videoRef.current.srcObject.getTracks();
      tracks.forEach(track => track.stop());
      videoRef.current.srcObject = null;
    }
  };

  useEffect(() => {
    const enableCamera = async () => {
      setIsCameraLoading(true);
      setCameraError("");  // Reset error when attempting to connect
      
      // Stop any previous stream
      stopVideoStream();
      
      // Add a small delay to ensure cleanup is complete
      await new Promise(resolve => setTimeout(resolve, 300));
      
      if (!selectedCamera) {
        setIsCameraLoading(false);
        return;
      }
      
      try {
        // Get new video stream
        const stream = await navigator.mediaDevices.getUserMedia({
          video: { deviceId: selectedCamera ? { exact: selectedCamera } : undefined }
        });
        
        videoStreamRef.current = stream;
        
        // Assign stream to video element if it exists
        if (videoRef.current) {
          videoRef.current.srcObject = stream;
          videoRef.current.onloadedmetadata = () => {
            videoRef.current.play()
              .then(() => {
                setIsCameraLoading(false);
                setCameraError("");
              })
              .catch(err => {
                console.error("Error playing video:", err);
                setIsCameraLoading(false);
                setCameraError("Failed to play camera stream");
              });
          };
        } else {
          setIsCameraLoading(false);
        }
      } catch (err) {
        console.error("Error accessing the camera:", err);
        setCameraError("Camera access denied or unavailable. Please select another camera.");
        setIsCameraLoading(false);
      }
    };

    enableCamera();

    return () => {
      stopVideoStream();
    };
  }, [selectedCamera]);

  const toggleMicrophoneTest = async () => {
    if (isMicTesting) {
      // Stop testing
      stopMicrophoneTesting();
    } else {
      // Start testing
      await startMicrophoneTesting();
    }
    setIsMicTesting(!isMicTesting);
  };

  const startMicrophoneTesting = async () => {
    try {
      // Stop any ongoing stream
      if (micStreamRef.current) {
        micStreamRef.current.getTracks().forEach(track => track.stop());
      }
      
      // Get new audio stream
      const stream = await navigator.mediaDevices.getUserMedia({ 
        audio: { deviceId: selectedMic ? { exact: selectedMic } : undefined } 
      });
      micStreamRef.current = stream;

      // Create new audio context
      if (audioContextRef.current) {
        audioContextRef.current.close();
      }
      audioContextRef.current = new (window.AudioContext || window.webkitAudioContext)();
      micInputRef.current = audioContextRef.current.createMediaStreamSource(stream);
      analyserRef.current = audioContextRef.current.createAnalyser();
      micInputRef.current.connect(analyserRef.current);
      analyserRef.current.fftSize = 256;

      const dataArray = new Uint8Array(analyserRef.current.frequencyBinCount);

      const checkMicLevel = () => {
        if (!analyserRef.current) return;
        
        analyserRef.current.getByteFrequencyData(dataArray);
        const sum = dataArray.reduce((a, b) => a + b, 0);
        const avg = sum / dataArray.length;
        
        // Make the bar less sensitive by:
        // 1. Using a lower scaling factor (0.8 instead of 2)
        // 2. Adding a minimum threshold (only values above 5 register)
        // 3. Using a logarithmic scale to reduce sensitivity at higher volumes
        const adjustedLevel = avg > 5 ? Math.log10(1 + avg) * 20 : 0;
        setMicLevel(Math.min(100, Math.round(adjustedLevel)));
        
        animationFrameRef.current = requestAnimationFrame(checkMicLevel);
      };

      checkMicLevel();
      setMicError("");
    } catch (err) {
      console.error("Error accessing microphone:", err);
      setMicError("Microphone access denied. Please allow access.");
      setIsMicTesting(false);
    }
  };

  const stopMicrophoneTesting = () => {
    if (animationFrameRef.current) {
      cancelAnimationFrame(animationFrameRef.current);
      animationFrameRef.current = null;
    }
    
    if (micStreamRef.current) {
      micStreamRef.current.getTracks().forEach(track => track.stop());
      micStreamRef.current = null;
    }
    
    if (audioContextRef.current) {
      audioContextRef.current.close();
      audioContextRef.current = null;
    }
    
    micInputRef.current = null;
    analyserRef.current = null;
    setMicLevel(0);
  };

  useEffect(() => {
    // Cleanup function to stop audio testing when component unmounts
    return () => {
      stopMicrophoneTesting();
      stopVideoStream();
    };
  }, []);

  const testSpeakers = async () => {
    try {
      const audio = new Audio("/sound-test.mp3"); // Ensure this file exists in the public folder
      const audioDevices = await navigator.mediaDevices.enumerateDevices();
      const speakerDevice = audioDevices.find(device => device.deviceId === selectedSpeaker);

      if (speakerDevice) {
        const audioElement = document.createElement("audio");
        audioElement.src = "/sound-test.mp3";
        audioElement.setSinkId(selectedSpeaker).then(() => {
          audioElement.play();
        }).catch(err => console.error("Error setting speaker output:", err));
      } else {
        audio.play();
      }
    } catch (err) {
      console.error("Error playing test sound:", err);
      setSpeakerError("Unable to play test sound.");
    }
  };
  
  // Determine the color class for the mic level fill
  const getMicLevelColorClass = () => {
    if (micLevel < 70) return "low";
    return "medium";
  };
  
  // Navigate to interview page
  const proceedToInterview = () => {
    // Clean up streams before navigating
    stopMicrophoneTesting();
    stopVideoStream();
    
    // Navigate to interview page
    navigate("/interview", { state: { selectedQuestions } });
  };
  
  return (
    <div className="peripherals-check-container">
      <h2>Pheripherals Check and Question Selection</h2>
      <div className="check-sections">
        {/* Camera Section */}
        <div className="test-section camera-section">
          <h3>Camera Test</h3>
          <div className="camera-display">
            {isCameraLoading ? (
              <div className="loading-indicator">Loading camera...</div>
            ) : cameraError ? (
              <p className="error-message">{cameraError}</p>
            ) : (
              <video ref={videoRef} autoPlay playsInline />
            )}
          </div>
          <label>Select Camera:</label>
          <select 
            value={selectedCamera} 
            onChange={(e) => setSelectedCamera(e.target.value)}
            disabled={isCameraLoading}
          >
            {cameras.map((camera) => (
              <option key={camera.deviceId} value={camera.deviceId}>{camera.label || "Camera " + (cameras.indexOf(camera) + 1)}</option>
            ))}
          </select>
        </div>

        {/* Microphone Section */}
        <div className="test-section av-section">
          <div className="test-item">
            <h3>Microphone Test</h3>
            {micError ? <p className="error-message">{micError}</p> : (
              <>
                <label>Select Microphone:</label>
                <select 
                  value={selectedMic} 
                  onChange={(e) => setSelectedMic(e.target.value)}
                  disabled={isMicTesting}
                >
                  {microphones.map((mic) => (
                    <option key={mic.deviceId} value={mic.deviceId}>{mic.label || "Microphone " + (microphones.indexOf(mic) + 1)}</option>
                  ))}
                </select>
                <button onClick={toggleMicrophoneTest}>
                  {isMicTesting ? "Stop Testing" : "Test Microphone"}
                </button>
                <div className="mic-level-container" style={{ marginTop: "10px", width: "100%" }}>
                  <div className="mic-level-bar">
                    <div className={`mic-level-fill ${getMicLevelColorClass()}`} 
                      style={{ width: `${micLevel}%` }} />
                  </div>
                </div>
              </>
            )}
          </div>

          {/* Speaker Section */}
          <div className="test-item">
            <h3>Speakers Test</h3>
            {speakerError ? <p className="error-message">{speakerError}</p> : (
              <>
                <label>Select Speaker:</label>
                <select value={selectedSpeaker} onChange={(e) => setSelectedSpeaker(e.target.value)}>
                  {speakers.map((speaker) => (
                    <option key={speaker.deviceId} value={speaker.deviceId}>{speaker.label || "Speaker " + (speakers.indexOf(speaker) + 1)}</option>
                  ))}
                </select>
                <button onClick={testSpeakers}>Test Audio</button>
              </>
            )}
          </div>
        </div>
        <div className="question-section">
        <h3>Select Interview Questions</h3>
        <ul className="question-list">
        {questions.map((question, index) => (
          <li
            key={index}
            onClick={() => handleQuestionSelect(question)}
            className={`question-item ${selectedQuestions.includes(question) ? "selected" : ""}`}
          >
            <span>{question}</span>
            {selectedQuestions.includes(question) && <span className="checkmark">✔</span>}
          </li>
        ))}
        </ul>
      </div>    
      </div>  
      <div className="navigation-section">
        <button 
          className={`proceed-button ${selectedQuestions.length === 0 ? "disabled" : ""}`}
          onClick={proceedToInterview}
          disabled={selectedQuestions.length === 0}
        >
          {selectedQuestions.length === 0 ? 
            "Please select at least one question" : 
            "Proceed to interview"}
        </button>
      </div>
    </div>
  );
};

export default PeripheralsCheckPage;