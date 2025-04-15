import React, { useState, useRef, useEffect } from "react";
import "../components/InterviewPage.css";
import axios from "axios";
import { useNavigate, useLocation } from "react-router-dom";

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
  const [hasRecorded, setHasRecorded] = useState(false);

  const videoRef = useRef(null);
  const mediaRecorderRef = useRef(null);
  const recordedChunksRef = useRef([]);
  const recordingsRef = useRef([]);
  const streamRef = useRef(null);

  const navigate = useNavigate();
  const location = useLocation();
  const questions = location.state?.selectedQuestions || [];
  const isLastQuestion = currentQuestion === questions.length - 1;
  
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

  useEffect(() => {
    const enableCamera = async () => {
      try {
        const stream = await navigator.mediaDevices.getUserMedia({ video: true, audio: true });
        if (videoRef.current) {
          videoRef.current.srcObject = stream;
          videoRef.current.muted = true;
        }
        streamRef.current = stream;
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
      if (!streamRef.current) {
        const stream = await navigator.mediaDevices.getUserMedia({ video: true, audio: true });
        streamRef.current = stream;
        if (videoRef.current) {
          videoRef.current.srcObject = stream;
        }
      }

      mediaRecorderRef.current = new MediaRecorder(streamRef.current);
      recordedChunksRef.current = [];

      mediaRecorderRef.current.ondataavailable = (event) => {
        if (event.data.size > 0) {
          recordedChunksRef.current.push(event.data);
        }
      };

      mediaRecorderRef.current.start();
      setIsRecording(true);
    } catch (err) {
      console.error("Error starting recording:", err);
      setError("Microphone access denied.");
    }
  };

  const stopListening = () => {
    if (mediaRecorderRef.current && mediaRecorderRef.current.state === "recording") {
      mediaRecorderRef.current.stop();
      mediaRecorderRef.current.onstop = async () => {
        const blob = new Blob(recordedChunksRef.current, { type: "video/webm" });
        const url = URL.createObjectURL(blob);

        recordingsRef.current.push({
          question: questions[currentQuestion],
          blob,
          url
        });

        const recordingsToStore = recordingsRef.current.map((rec) => ({
          question: rec.question,
          url: rec.url
        }));

        localStorage.setItem("interviewRecordings", JSON.stringify(recordingsToStore));

        const formData = new FormData();
        formData.append("video", blob, `question_${currentQuestion + 1}.webm`);

        try {
          const response = await axios.post("http://localhost:5000/upload-video", formData);
          if (response.data.success) {
            console.log("File uploaded:", response.data.filePath);
          }
        } catch (err) {
          console.error("Upload error:", err);
        }
      };
    }
    setIsRecording(false);
    setHasRecorded(true);
  };

  const handleNextQuestion = () => {
    stopListening();
    if (currentQuestion < questions.length - 1) {
      setCurrentQuestion(currentQuestion + 1);
      startCountdown();
    } else {
      setInterviewFinished(true);
      navigate("/more-details");
    }
  };

  const startInterview = () => {
    setInterviewStarted(true);
    startCountdown();
  };

  return (
    <div className="interview-container">
      <div className="interview-wrapper">
        {/* Video container with question overlay */}
        <div className="video-wrapper">
          {interviewStarted && (
            <div className="question-overlay">
              <h3>Question {currentQuestion + 1}:</h3>
              <p className="question-text">{questions[currentQuestion]}</p>
            </div>
          )}
          
          <div className="video-container">
            {error ? (
              <div className="error-message">{error}</div>
            ) : (
              <video ref={videoRef} autoPlay playsInline className="user-video" />
            )}
          </div>

          {/* Recording timer overlay */}
          {isRecording && (
            <div className="recording-indicator">
              <div className="recording-dot"></div>
              <span>Recording: {formatTime(answerTime)}</span>
            </div>
          )}
        </div>

        {/* Controls below the video */}
        <div className="controls-container">
          {!interviewStarted ? (
            <button className="start-button" onClick={startInterview}>
              Start Interview
            </button>
          ) : !interviewFinished && (
            <>
              {countdownActive ? (
                <div className="countdown-container">
                  <p>Recording will start in {timer} seconds...</p>
                  <button className="skip-button" onClick={skipCountdown}>
                    Start Answering Now
                  </button>
                </div>
              ) : (
                <div className="recording-controls">
                  {isRecording ? (
                    <button className="stop-button" onClick={stopListening}>
                      Stop Recording
                    </button>
                  ) : (
                    <button 
                      className={`${isLastQuestion ? 'finish-button' : 'next-button'} ${!hasRecorded && "disabled"}`}
                      onClick={handleNextQuestion}
                      disabled={!hasRecorded}
                    >
                      {isLastQuestion ? "Finish Interview" : "Next Question"}
                    </button>
                  )}
                </div>
              )}
            </>
          )}
        </div>
      </div>
    </div>
  );
};

export default InterviewPage;