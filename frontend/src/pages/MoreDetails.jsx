import { useState, useEffect } from "react";
import axios from "axios";
import { Link } from "react-router-dom";

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
    <div style={{ width: "100vw", height: "100vh", position: "relative", background: "white", overflowY: "auto", paddingBottom: "80px" }}>
      <div style={{ width: "600px", left: "48%", transform: "translateX(-50%)", top: "0px", position: "absolute", textAlign: "center", color: "black", fontSize: "48px", fontFamily: "Inter", fontWeight: "500" }}>
        Question Analysis
      </div>

      {/* Interview Playback */}
      <div style={{
        width: "380px",
        height: "450px",
        left: "120px",
        top: "130px",
        position: "absolute",
        background: "#D9D9D9",
        display: "flex",
        flexDirection: "column",
        justifyContent: "flex-start",
        alignItems: "center",
        padding: "20px",
        boxSizing: "border-box"
      }}>
        <h3 style={{ fontSize: "24px", marginBottom: "10px" }}>Interview Playback</h3>
        {recordings.length > 0 ? (
          <>
            <p style={{ fontWeight: "bold", textAlign: "center", fontSize: "16px", marginBottom: "10px" }}>
              Question {currentIndex + 1}: {recordings[currentIndex].question}
            </p>
            <video
              key={recordings[currentIndex].url}
              src={recordings[currentIndex].url}
              controls
              style={{ width: "100%", height: "220px", objectFit: "cover", marginBottom: "10px" }}
            />
            <div style={{ display: "flex", justifyContent: "center", gap: "10px" }}>
              <button
                onClick={handlePrev}
                disabled={currentIndex === 0}
                style={{ padding: "6px 12px", fontSize: "14px", cursor: "pointer" }}
              >
                ◀ Prev
              </button>
              <button
                onClick={handleNext}
                disabled={currentIndex === recordings.length - 1}
                style={{ padding: "6px 12px", fontSize: "14px", cursor: "pointer" }}
              >
                Next ▶
              </button>
            </div>
          </>
        ) : (
          <p>No recordings available.</p>
        )}
      </div>

      {/* Self Evaluation */}
      <div style={{ width: "380px", height: "450px", left: "550px", top: "130px", position: "absolute", background: "#D9D9D9", padding: "20px", boxSizing: "border-box" }}>
        <h3 style={{ fontSize: "24px", marginBottom: "10px" }}>Self Evaluation</h3>
        <textarea
          style={{ width: "100%", height: "250px", padding: "10px", fontSize: "16px" }}
          value={selfEvaluation}
          onChange={(e) => setSelfEvaluation(e.target.value)}
          placeholder="Write how you feel your interview went..."
        />
        <div style={{ display: "flex", justifyContent: "center", marginTop: "10px" }}>
          {[1, 2, 3, 4, 5].map((star) => (
            <span
              key={star}
              onClick={() => handleRating(star)}
              style={{ fontSize: "30px", cursor: "pointer", color: rating >= star ? "gold" : "gray", marginRight: "5px" }}
            >
              ★
            </span>
          ))}
        </div>
        <div style={{ display: "flex", justifyContent: "center", marginTop: "30px" }}>
          <button
            onClick={handleSendEval}
            style={{ width: "90%", padding: "10px", background: "black", color: "white", fontSize: "18px", border: "none", cursor: "pointer" }}
          >
            Save Evaluation
          </button>
        </div>
      </div>

      {/* Mentor Email */}
      <div style={{ width: "380px", height: "450px", left: "1000px", top: "130px", position: "absolute", background: "#D9D9D9", padding: "20px", boxSizing: "border-box" }}>
        <h3 style={{ fontSize: "24px", marginBottom: "10px" }}>Send to Mentor</h3>
        <input
          type="email"
          placeholder="Mentor's Email"
          value={mentorEmail}
          onChange={(e) => setMentorEmail(e.target.value)}
          style={{ width: "100%", padding: "8px", marginBottom: "10px" }}
        />
        <textarea
          placeholder="Message to Mentor"
          value={message}
          onChange={(e) => setMessage(e.target.value)}
          style={{ width: "100%", height: "150px", padding: "10px", fontSize: "16px" }}
        />
        <button
          onClick={handleSend}
          style={{ width: "90%", padding: "10px", background: "black", color: "white", fontSize: "18px", border: "none", cursor: "pointer", marginTop: "10px" }}
        >
          Send via Gmail
        </button>
        <div style={{ marginTop: "10px", fontSize: "14px" }}>
          <input
            type="checkbox"
            id="includeVideoLinks"
            checked={includeVideoLinks}
            onChange={() => setIncludeVideoLinks(!includeVideoLinks)}
          />
          <label htmlFor="includeVideoLinks" style={{ marginLeft: "8px" }}>
            Include video links in email
          </label>
        </div>
      </div>

      {/* Green Button Positioned Below All Three Boxes */}
      <div style={{
        position: "absolute",
        top: "620px",
        left: "48%",
        transform: "translateX(-50%)",
        marginTop: "30px"
      }}>
        <Link
          to="/interview-history"
          style={{
            backgroundColor: "#4CAF50",
            color: "white",
            padding: "12px 24px",
            fontSize: "24px",
            fontWeight: "bold",
            textDecoration: "none",
            borderRadius: "8px",
          }}
        >
          Go to Interview History
        </Link>
      </div>
    </div>
  );
};

export default MoreDetails;