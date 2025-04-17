import React, { useState, useEffect } from "react";
import "../components/InterviewHist.css";
import axios from "axios";

const InterviewHistory = () => {
  const [interviews, setInterviews] = useState([]);

  useEffect(() => {
    const fetchInterviews = async () => {
      try {
        const response = await axios.get("http://localhost:5000/interviews");
        console.log("Fetched Interviews: ", response.data); // Debug log for fetched data

        setInterviews(response.data);
      } catch (err) {
        console.error("Error fetching interviews:", err);
      }
    };

    fetchInterviews();
  }, []);

  const formatDate = (dateStr) => {
    const date = new Date(dateStr);
    const month = ("0" + (date.getMonth() + 1)).slice(-2);
    const day = ("0" + date.getDate()).slice(-2);
    const year = date.getFullYear().toString().slice(-2);
    return `${month}/${day}/${year}`;
  };

  const interviewsByDate = interviews.reduce((acc, interview) => {
    const date = formatDate(interview.uploadDate);
    if (!acc[date]) {
      acc[date] = [];
    }
    acc[date].push(interview);
    return acc;
  }, {});

  const interviewsByQuestion = interviews.reduce((acc, interview) => {
    if (!acc[interview.question]) {
      acc[interview.question] = [];
    }
    acc[interview.question].push(interview);
    return acc;
  }, {});
  
  return (
    <div className="interview-container">
      <h1 className="interview-title">Interviews by Date</h1>
      <div className="interview-grid">
        {Object.entries(interviewsByDate).map(([date, interviewsForDate]) => (
          <InterviewCarousel key={date} date={date} interviews={interviewsForDate} />
        ))}
      </div>

      <hr className="divider" />
      <h1 className="interview-title">View Specific Questions</h1>
      <div className="interview-grid">
        {Object.entries(interviewsByQuestion).map(([question, interviewsForQuestion]) => (
          <div key={question} className="interview-card">
            <h2>{question}</h2>
            <ul>
              {interviewsForQuestion.map((interview, index) => (
                <li key={index}>
                  <video controls width="320" height="240">
                    <source
                      src={`http://localhost:5000/video/${interview.filename}`}
                      type="video/webm"
                    />
                    Your browser does not support the video tag.
                  </video>
                  <p>{formatDate(interview.uploadDate)}</p>
                </li>
              ))}
            </ul>
          </div>
        ))}
      </div>
    </div>
  );
};

const InterviewCarousel = ({ date, interviews }) => {
  const [currentIndex, setCurrentIndex] = useState(0);

  const handlePrevClick = () => {
    setCurrentIndex((prevIndex) => (prevIndex === 0 ? interviews.length - 1 : prevIndex - 1));
  };

  const handleNextClick = () => {
    setCurrentIndex((prevIndex) => (prevIndex === interviews.length - 1 ? 0 : prevIndex + 1));
  };

  const currentInterview = interviews[currentIndex];

  return (
    <div className="carousel-container">
      <h2>{date}</h2>
      <div className="carousel">
        <button onClick={handlePrevClick} className="carousel-arrow left">
          {"<"}
        </button>
        <div className="interview-card">
          <video key={currentInterview.filename} controls width="320" height="240">
            <source
              src={`http://localhost:5000/video/${currentInterview.filename}`}
              type="video/webm"
            />
            Your browser does not support the video tag.
          </video>
          <p>{currentInterview.question}</p>
        </div>
        <button onClick={handleNextClick} className="carousel-arrow right">
          {">"}
        </button>
      </div>
    </div>
  );
};

export default InterviewHistory;