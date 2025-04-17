import React, { useState, useRef, useEffect } from "react";
import "../components/InterviewPage.css";
import axios from "axios";
<<<<<<< HEAD
import { useNavigate, useLocation } from "react-router-dom";
=======
import { useNavigate } from "react-router-dom";
import { useAuth0 } from "@auth0/auth0-react";
>>>>>>> origin/main

const InterviewPage = () => {
  const [isRecording, setIsRecording] = useState(false);
  const [error, setError] = useState("");
  const [currentQuestion, setCurrentQuestion] = useState(0);
  const [timer, setTimer] = useState(20);
  const [countdownActive, setCountdownActive] = useState(false);
  const [interviewStarted, setInterviewStarted] = useState(false);
  const [interviewFinished, setInterviewFinished] = useState(false);
<<<<<<< HEAD
  const [answerTime, setAnswerTime] = useState(0); // Track time spent answering
  const [answerTimerId, setAnswerTimerId] = useState(null); // Store timer ID
  const [hasRecorded, setHasRecorded] = useState(false);
=======
  const [answerTime, setAnswerTime] = useState(0);
  const [answerTimerId, setAnswerTimerId] = useState(null);
>>>>>>> origin/main

  const videoRef = useRef(null);
  const mediaRecorderRef = useRef(null);
  const recordedChunksRef = useRef([]);
  const recordingsRef = useRef([]);
  const streamRef = useRef(null);

  const navigate = useNavigate();
<<<<<<< HEAD
  const location = useLocation();
  const questions = location.state?.selectedQuestions || [];
  const isLastQuestion = currentQuestion === questions.length - 1;
  
=======
  const { user } = useAuth0();

  const questions = [
    "Tell me about yourself and your background.",
    "What are your strengths and weaknesses?",
    "Where do you see yourself in five years?",
  ];

>>>>>>> origin/main
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
<<<<<<< HEAD
        streamRef.current.getTracks().forEach(track => track.stop());
=======
        streamRef.current.getTracks().forEach((track) => track.stop());
>>>>>>> origin/main
      }
    };
  }, []);

<<<<<<< HEAD
  // Effect to manage the answer timer
=======
>>>>>>> origin/main
  useEffect(() => {
    if (isRecording) {
      const timerId = setInterval(() => {
        setAnswerTime((prev) => prev + 1);
      }, 1000);
      setAnswerTimerId(timerId);
    } else {
      if (answerTimerId) {
        clearInterval(answerTimerId);
        setAnswerTimerId(null);
      }
    }

    return () => {
      if (answerTimerId) clearInterval(answerTimerId);
    };
  }, [isRecording]);

  const formatTime = (seconds) => {
    const mins = Math.floor(seconds / 60).toString().padStart(2, "0");
    const secs = (seconds % 60).toString().padStart(2, "0");
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
<<<<<<< HEAD
  
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
        formData.append("question", questions[currentQuestion]);  // Add question to the form data
  
        try {
          const response = await axios.post("http://localhost:5000/upload-video", formData);
          if (response.data.success) {
            console.log("File uploaded:", response.data);
          }
=======

        // Prepare upload
        const formData = new FormData();
        formData.append("video", blob, `question_${currentQuestion + 1}.webm`);
        formData.append("question", questions[currentQuestion]);
        formData.append("userId", user?.sub || "anonymous");

        try {
          const res = await axios.post("http://localhost:5000/upload-video", formData, {
            headers: { "Content-Type": "multipart/form-data" },
          });

          recordingsRef.current.push({
            question: questions[currentQuestion],
            url,
            blob,
            fileId: res.data.fileId, // ✅ store fileId here
          });

          // Update localStorage
          const recordingsToStore = recordingsRef.current.map((rec) => ({
            question: rec.question,
            url: rec.url,
            fileId: rec.fileId,
          }));
          localStorage.setItem("interviewRecordings", JSON.stringify(recordingsToStore));
>>>>>>> origin/main
        } catch (err) {
          console.error("Upload error:", err);
          alert("Upload failed. Please try again.");
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
<<<<<<< HEAD
=======
      alert("Interview completed and videos uploaded.");
>>>>>>> origin/main
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
<<<<<<< HEAD
                  )}
                </div>
              )}
            </>
          )}
=======
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
>>>>>>> origin/main
        </div>
      </div>
    </div>
  );
};

export default InterviewPage;