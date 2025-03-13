import React, { useState, useRef, useEffect } from "react";
import "../components/InterviewPage.css";

const InterviewPage = () => {
  const [isRecording, setIsRecording] = useState(false);
  const [error, setError] = useState("");
  const [currentQuestion, setCurrentQuestion] = useState(0);
  const [timer, setTimer] = useState(20);
  const [countdownActive, setCountdownActive] = useState(false);
  const [interviewStarted, setInterviewStarted] = useState(false);

  const videoRef = useRef(null);
  const mediaRecorderRef = useRef(null);
  const recordedChunksRef = useRef([]);

  // Countdown timer before recording
  useEffect(() => {
    let timeoutId;
    if (countdownActive && timer > 0) {
      timeoutId = setTimeout(() => setTimer(timer - 1), 1000);
    }
    if (countdownActive && timer === 0) {
      setCountdownActive(false);
      startListening();
    }
    return () => clearTimeout(timeoutId);
  }, [timer, countdownActive]);

  // Enable camera
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

  const startCountdown = () => {
    setTimer(20);
    setCountdownActive(true);
  };
  
  const skipCountdown = () => {
    setTimer(0);
    setCountdownActive(false);
    startListening();
  };
  
  const startListening = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      mediaRecorderRef.current = new MediaRecorder(stream);
      recordedChunksRef.current = [];

      mediaRecorderRef.current.ondataavailable = (event) => {
        if (event.data.size > 0) {
          recordedChunksRef.current.push(event.data);
        }
      };

      mediaRecorderRef.current.start();
      setIsRecording(true);
    } catch (err) {
      console.error("Error accessing microphone:", err);
      setError("Microphone access denied.");
    }
  };

  const stopListening = () => {
    if (mediaRecorderRef.current) {
      mediaRecorderRef.current.stop();
      mediaRecorderRef.current.onstop = () => {
        const blob = new Blob(recordedChunksRef.current, { type: "audio/webm" });
        const url = URL.createObjectURL(blob);
        const a = document.createElement("a");
        a.href = url;
        a.download = `question_${currentQuestion + 1}.webm`;
        a.click();
      };
    }
    setIsRecording(false);
  };

  const handleNextQuestion = () => {
    stopListening();
    if (currentQuestion < 2) {
      setCurrentQuestion(currentQuestion + 1);
      startCountdown();
    }
  };

  const startInterview = () => {
    setInterviewStarted(true);
    startCountdown();
  };

  const questions = [
    "Tell me about yourself and your background.",
    "What are your strengths and weaknesses?",
    "Where do you see yourself in five years?"
  ];

  return (
    <div className="interview-container">
      <div className="interview-layout">
        {/* Left side - Interviewer */}
        <div className="interviewer-section">
          <h2>Interviewer</h2>
          <div className="interviewer-image-container">
            <img 
              src="/interviewer.png" 
              alt="Interviewer" 
              className="interviewer-image"
            />
          </div>
          
          {interviewStarted && (
            <div className="question-container">
              <h3>Question {currentQuestion + 1}:</h3>
              <p className="question-text">{questions[currentQuestion]}</p>
            </div>
          )}
        </div>

        {/* Right side - User's camera */}
        <div className="user-section">
          <h2>Your Camera</h2>
          <div className="video-container">
            {error ? (
              <p className="error-message">{error}</p>
            ) : (
              <video 
                ref={videoRef} 
                autoPlay 
                playsInline 
                className="user-video"
              />
            )}
          </div>

          <div className="controls-container">
            {!interviewStarted ? (
              <button 
                className="start-button" 
                onClick={startInterview}
              >
                Start Interview
              </button>
            ) : (
              <div className="interview-controls">
                {countdownActive ? (
                  <div className="countdown-container">
                    <p>Recording will start in {timer} seconds...</p>
                    <button 
                      className="skip-button"
                      onClick={skipCountdown}
                    >
                      Start Answering Now
                    </button>
                  </div>
                ) : (
                  <div className="recording-controls">
                    <div className="record-buttons">
                      <button
                        className={`record-button ${isRecording ? 'disabled' : ''}`}
                        onClick={startListening}
                        disabled={isRecording || countdownActive || timer === 0}
                      >
                        Start Recording
                      </button>
                      <button 
                        className={`stop-button ${!isRecording ? 'disabled' : ''}`}
                        onClick={stopListening} 
                        disabled={!isRecording}
                      >
                        Stop Recording
                      </button>
                    </div>
                    <button 
                      className={`next-button ${currentQuestion >= 2 || isRecording ? 'disabled' : ''}`}
                      onClick={handleNextQuestion} 
                      disabled={currentQuestion >= 2 || isRecording}
                    >
                      Next Question
                    </button>
                  </div>
                )}
              </div>
            )}
          </div>

          <div className="status-indicator">
            <p><strong>Status:</strong> {isRecording ? "Recording..." : "Not recording"}</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default InterviewPage;