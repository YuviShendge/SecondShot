import React, { useState, useRef, useEffect } from "react";
import "../components/InterviewPage.css";
import axios from "axios";

const InterviewPage = () => {
  const [isRecording, setIsRecording] = useState(false);
  const [error, setError] = useState("");
  const [currentQuestion, setCurrentQuestion] = useState(0);
  const [timer, setTimer] = useState(20);
  const [countdownActive, setCountdownActive] = useState(false);
  const [interviewStarted, setInterviewStarted] = useState(false);
  const [interviewFinished, setInterviewFinished] = useState(false);
  const [answerTime, setAnswerTime] = useState(0); // Track time spent answering
  const [answerTimerId, setAnswerTimerId] = useState(null); // Store timer ID


  const videoRef = useRef(null);
  const mediaRecorderRef = useRef(null);
  const recordedChunksRef = useRef([]);
  const streamRef = useRef(null); // Store stream reference to prevent it from being stopped

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
      const stream = await navigator.mediaDevices.getUserMedia({ video: true, audio: true });
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        videoRef.current.muted = true; // Add this line to mute audio playback
      }
      streamRef.current = stream; // Store stream reference
    } catch (err) {
      console.error("Error accessing the camera:", err);
      setError("Camera access denied. Please allow access.");
    }
  };

  enableCamera();

  return () => {
    if (streamRef.current) {
      streamRef.current.getTracks().forEach(track => track.stop());
    }
  };
}, []);
  // Effect to manage the answer timer
  useEffect(() => {
    if (isRecording) {
      // Start timer when recording begins
      const timerId = setInterval(() => {
        setAnswerTime(prev => prev + 1);
      }, 1000);
      setAnswerTimerId(timerId);
    } else {
      // Clear timer when recording stops
      if (answerTimerId) {
        clearInterval(answerTimerId);
        setAnswerTimerId(null);
      }
    }

    // Clean up on unmount
    return () => {
      if (answerTimerId) {
        clearInterval(answerTimerId);
      }
    };
  }, [isRecording]);

  // Format the time for display (mm:ss)
  const formatTime = (seconds) => {
    const mins = Math.floor(seconds / 60).toString().padStart(2, '0');
    const secs = (seconds % 60).toString().padStart(2, '0');
    return `${mins}:${secs}`;
  };
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
      if (streamRef.current) {
        mediaRecorderRef.current = new MediaRecorder(streamRef.current);
        recordedChunksRef.current = [];

        mediaRecorderRef.current.ondataavailable = (event) => {
          if (event.data.size > 0) {
            recordedChunksRef.current.push(event.data);
          }
        };

        mediaRecorderRef.current.start();
        setIsRecording(true);
      } else {
        // Fallback if stream is not available
        const stream = await navigator.mediaDevices.getUserMedia({ audio: true, video: true });
        streamRef.current = stream;
        if (videoRef.current) {
          videoRef.current.srcObject = stream;
        }
        
        mediaRecorderRef.current = new MediaRecorder(stream);
        recordedChunksRef.current = [];

        mediaRecorderRef.current.ondataavailable = (event) => {
          if (event.data.size > 0) {
            recordedChunksRef.current.push(event.data);
          }
        };

        mediaRecorderRef.current.start();
        setIsRecording(true);
      }
    } catch (err) {
      console.error("Error accessing microphone:", err);
      setError("Microphone access denied.");
    }
  };


  const stopListening = () => {
    if (mediaRecorderRef.current && mediaRecorderRef.current.state === "recording") {
      mediaRecorderRef.current.stop();
      mediaRecorderRef.current.onstop = async () => {
        const blob = new Blob(recordedChunksRef.current, { type: "video/webm" });
        const fileName = `question_${currentQuestion + 1}.webm`;

        const formData = new FormData();
        formData.append("video", blob, fileName);

        try {
          // Send video to backend for saving & transcription
          const response = await axios.post("http://localhost:5000/upload", formData);

          if (response.data.success) {
            console.log("File saved successfully:", response.data.filePath);
            console.log("Transcript saved:", response.data.transcriptPath);
          }
        } catch (err) {
          console.error("Error uploading video:", err);
        }
      };
    }
    setIsRecording(false);
  };
  

  const handleNextQuestion = () => {
    stopListening();
    if (currentQuestion < 2) {
      setCurrentQuestion(currentQuestion + 1);
      startCountdown();
    } else {
      // Go to Next page
      setInterviewFinished(true);
      alert("Interview completed.");
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
           {interviewFinished && (
            <div className="interview-completed">
              <h3>Interview Completed</h3>
              <p>Thank you for participating!</p>
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
                      className={`next-button ${isRecording ? 'disabled' : ''}`}
                      onClick={handleNextQuestion} 
                      disabled={isRecording}
                    >
                      {currentQuestion >= 2 ? 'Finish Interview' : 'Next Question'}
                    </button>
                  </div>
                )}
              </div>
            )}
          </div>

          <div className="status-indicator">
          <p className="recording-timer">
                <strong>Recording Time:</strong> {formatTime(answerTime)}
              </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default InterviewPage;