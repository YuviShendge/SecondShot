import React, { useState, useRef, useEffect } from "react";
import "../components/InterviewPage.css";
import axios from "axios";
import { useNavigate } from "react-router-dom";

const InterviewPage = () => {
  const [isRecording, setIsRecording] = useState(false);
  const [error, setError] = useState("");
  const [currentQuestion, setCurrentQuestion] = useState(0);
  const [timer, setTimer] = useState(20);
  const [countdownActive, setCountdownActive] = useState(false);
  const [interviewStarted, setInterviewStarted] = useState(false);
  const [interviewFinished, setInterviewFinished] = useState(false);

  const videoRef = useRef(null);
  const mediaRecorderRef = useRef(null);
  const recordedChunksRef = useRef([]);
  const recordingsRef = useRef([]);
  const streamRef = useRef(null);

  const navigate = useNavigate();

  const questions = [
    "Tell me about yourself and your background.",
    "What are your strengths and weaknesses?",
    "Where do you see yourself in five years?"
  ];

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
        streamRef.current.getTracks().forEach((track) => track.stop());
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
          const response = await axios.post("http://localhost:5000/upload", formData);
          if (response.data.success) {
            console.log("File uploaded:", response.data.filePath);
          }
        } catch (err) {
          console.error("Upload error:", err);
        }
      };
    }

    setIsRecording(false);
  };

  const handleNextQuestion = () => {
    stopListening();
    if (currentQuestion < questions.length - 1) {
      setCurrentQuestion(currentQuestion + 1);
      startCountdown();
    } else {
      setInterviewFinished(true);
      alert("Interview completed.");
      navigate("/more-details");
    }
  };

  const startInterview = () => {
    setInterviewStarted(true);
    startCountdown();
  };

  return (
    <div className="interview-container">
      <div className="interview-layout">
        <div className="interviewer-section">
          <h2>Interviewer</h2>
          <div className="interviewer-image-container">
            <img src="/interviewer.png" alt="Interviewer" className="interviewer-image" />
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

        <div className="user-section">
          <h2>Your Camera</h2>
          <div className="video-container">
            {error ? (
              <p className="error-message">{error}</p>
            ) : (
              <video ref={videoRef} autoPlay playsInline className="user-video" />
            )}
          </div>

          <div className="controls-container">
            {!interviewStarted ? (
              <button className="start-button" onClick={startInterview}>
                Start Interview
              </button>
            ) : (
              <div className="interview-controls">
                {countdownActive ? (
                  <div className="countdown-container">
                    <p>Recording will start in {timer} seconds...</p>
                    <button className="skip-button" onClick={skipCountdown}>
                      Start Answering Now
                    </button>
                  </div>
                ) : (
                  <div className="recording-controls">
                    <div className="record-buttons">
                      <button
                        className={`record-button ${isRecording ? "disabled" : ""}`}
                        onClick={startListening}
                        disabled={isRecording}
                      >
                        Start Recording
                      </button>
                      <button
                        className={`stop-button ${!isRecording ? "disabled" : ""}`}
                        onClick={stopListening}
                        disabled={!isRecording}
                      >
                        Stop Recording
                      </button>
                    </div>
                    <button
                      className={`next-button ${isRecording ? "disabled" : ""}`}
                      onClick={handleNextQuestion}
                      disabled={isRecording}
                    >
                      {currentQuestion >= 2 ? "Finish Interview" : "Next Question"}
                    </button>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default InterviewPage;
