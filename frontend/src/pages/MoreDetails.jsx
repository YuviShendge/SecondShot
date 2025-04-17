import { useState, useEffect } from "react";
import "../components/MoreDetails.css";

const MoreDetails = () => {
  const [selfEvaluation, setSelfEvaluation] = useState(localStorage.getItem("selfEvaluation") || "");
  const [rating, setRating] = useState(parseInt(localStorage.getItem("rating")) || 0);
  const [mentorEmail, setMentorEmail] = useState("");
  const [message, setMessage] = useState("");
  const [recordings, setRecordings] = useState([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [includeVideoLinks, setIncludeVideoLinks] = useState(false);

  useEffect(() => {
    localStorage.setItem("selfEvaluation", selfEvaluation);
    localStorage.setItem("rating", rating);
  }, [selfEvaluation, rating]);

  useEffect(() => {
    const saved = localStorage.getItem("interviewRecordings");
    if (saved) {
      setRecordings(JSON.parse(saved));
    }
  }, []);

  const handleRating = (stars) => setRating(stars);

  const handleSendEval = async () => {
    try {
      const res = await axios.post("http://localhost:5000/feedback", {
        message: selfEvaluation,
      });
      alert(res.data.message || "Evaluation saved successfully!");
    } catch (err) {
      console.error("Error saving evaluation:", err);
      alert("Error saving evaluation. Please try again.");
    }
  };

  const handleSend = () => {
    if (!mentorEmail || !message) {
      alert("Please enter the mentor's email and a message before sending.");
      return;
    }

    let videoSection = "";
    if (includeVideoLinks) {
      const formattedLinks = recordings
        .map((rec, index) => {
          if (rec.fileId) {
            return `Question ${index + 1}: http://localhost:5000/video/${rec.fileId}`;
          }
          return null;
        })
        .filter(Boolean)
        .join("\n");

      videoSection = `\n\nVideo Links:\n${formattedLinks}`;
    }

    const subject = encodeURIComponent("Interview Evaluation");
    const body = encodeURIComponent(
      `Hello,\n\nHere is my self-evaluation:\n\n"${selfEvaluation}"\n\nRating: ${rating} Stars\n\nMessage:\n${message}${videoSection}\n\nBest regards`
    );

    const gmailURL = `https://mail.google.com/mail/?view=cm&fs=1&to=${mentorEmail}&su=${subject}&body=${body}`;
    window.open(gmailURL, "_blank");
  };

  const handleNext = () => {
    if (currentIndex < recordings.length - 1) setCurrentIndex(currentIndex + 1);
  };

  const handlePrev = () => {
    if (currentIndex > 0) setCurrentIndex(currentIndex - 1);
  };

  return (
    <div className="feedback-container">
      <h1 className="feedback-title">Feedback</h1>
      <div className="panels-container">
        <div className="feedback-panel playback-panel">
          <h3 className="panel-title">Interview Playback</h3>
          {recordings.length > 0 ? (
            <>
              <p className="question-text">
                Question {currentIndex + 1}: {recordings[currentIndex].question}
              </p>
              <video
                key={recordings[currentIndex].url}
                src={recordings[currentIndex].url}
                controls
                className="video-player"
              />
              <div className="navigation-buttons">
                <button
                  onClick={handlePrev}
                  disabled={currentIndex === 0}
                  className="nav-button"
                >
                  ◀ Prev
                </button>
                <button
                  onClick={handleNext}
                  disabled={currentIndex === recordings.length - 1}
                  className="nav-button"
                >
                  Next ▶
                </button>
              </div>
            </>
          ) : (
            <p className="no-recordings">No recordings available.</p>
          )}
        </div>

        {/* Self Evaluation */}
        <div className="feedback-panel evaluation-panel">
          <h3>Self Evaluation</h3>
          <textarea
            className="evaluation-textarea"
            value={selfEvaluation}
            onChange={(e) => setSelfEvaluation(e.target.value)}
            placeholder="Write how you feel your interview went..."
          />
          <div className="rating-container">
            {[1, 2, 3, 4, 5].map((star) => (
              <span
                key={star}
                onClick={() => handleRating(star)}
                className={`star-rating ${rating >= star ? "star-active" : "star-inactive"}`}
              >
                ★
              </span>
            ))}
          </div>
        </div>

        {/* Mentor Email */}
        <div className="feedback-panel mentor-panel">
          <h3 className="panel-title">Send to Mentor</h3>
          <input
            type="email"
            placeholder="Mentor's Email"
            value={mentorEmail}
            onChange={(e) => setMentorEmail(e.target.value)}
            className="email-input"
          />
          <textarea
            placeholder="Message to Mentor"
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            className="message-textarea"
          />
          <button
            onClick={handleSend}
            className="send-button"
          >
            Send via Gmail
          </button>
        </div>
      </div>
    </div>
  );
};

export default MoreDetails;