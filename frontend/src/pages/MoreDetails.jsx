import { useState, useEffect } from "react";

const MoreDetails = () => {
  // Self Evaluation State
  const [selfEvaluation, setSelfEvaluation] = useState(localStorage.getItem("selfEvaluation") || "");
  const [rating, setRating] = useState(parseInt(localStorage.getItem("rating")) || 0);

  // Mentor Email Form State
  const [mentorEmail, setMentorEmail] = useState("");
  const [message, setMessage] = useState("");

  // Save self-evaluation and rating to localStorage
  useEffect(() => {
    localStorage.setItem("selfEvaluation", selfEvaluation);
    localStorage.setItem("rating", rating);
  }, [selfEvaluation, rating]);

  // Handle Rating Click
  const handleRating = (stars) => {
    setRating(stars);
  };

  // Handle Send to Mentor (Opens Gmail in a new tab)
  const handleSend = () => {
    if (!mentorEmail || !message) {
      alert("Please enter the mentor's email and a message before sending.");
      return;
    }

    // Construct mailto link
    const subject = encodeURIComponent("Interview Evaluation");
    const body = encodeURIComponent(
      `Hello,\n\nHere is my self-evaluation:\n\n"${selfEvaluation}"\n\nRating: ${rating} Stars\n\nMessage:\n${message}\n\nBest Regards`
    );

    // Open Gmail in a new tab
    const gmailURL = `https://mail.google.com/mail/?view=cm&fs=1&to=${mentorEmail}&su=${subject}&body=${body}`;
    window.open(gmailURL, "_blank");
  };

  return (
    <div style={{
      width: "95vw",
      height: "100vh",
      position: "relative",
      background: "white",
      overflow: "hidden"
    }}>

      {/* Page Title */}
      <div style={{
        width: "600px",
        left: "50%",
        transform: "translateX(-50%)",
        top: "0px",
        position: "absolute",
        textAlign: "center",
        color: "black",
        fontSize: "48px",
        fontFamily: "Inter",
        fontWeight: "500"
      }}>
        Question Analysis
      </div>

      {/* Self Evaluation Section */}
      <div style={{
        width: "380px",
        height: "450px",
        left: "550px",
        top: "130px",
        position: "absolute",
        background: "#D9D9D9",
        padding: "20px",
        boxSizing: "border-box"
      }}>
        <h3 style={{ fontSize: "24px", marginBottom: "10px" }}>Self Evaluation</h3>
        <textarea
          style={{ width: "100%", height: "250px", padding: "10px", fontSize: "16px" }}
          value={selfEvaluation}
          onChange={(e) => setSelfEvaluation(e.target.value)}
          placeholder="Write how you feel your interview went..."
        />
        {/* Star Rating */}
        <div style={{ display: "flex", justifyContent: "center", marginTop: "10px" }}>
          {[1, 2, 3, 4, 5].map((star) => (
            <span
              key={star}
              onClick={() => handleRating(star)}
              style={{
                fontSize: "30px",
                cursor: "pointer",
                color: rating >= star ? "gold" : "gray",
                marginRight: "5px"
              }}
            >
              ★
            </span>
          ))}
        </div>
      </div>

      {/* Send to Mentor Section */}
      <div style={{
        width: "380px",
        height: "450px",
        left: "1000px",
        top: "130px",
        position: "absolute",
        background: "#D9D9D9",
        padding: "20px",
        boxSizing: "border-box"
      }}>
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
          style={{
            width: "90%",
            padding: "10px",
            background: "black",
            color: "white",
            fontSize: "18px",
            border: "none",
            cursor: "pointer",
            marginTop: "10px"
          }}
        >
          Send via Gmail
        </button>
      </div>

      {/* Interview Playback Box */}
      <div style={{
        width: "380px",
        height: "280px",
        left: "120px",
        top: "250px",
        position: "absolute",
        background: "#D9D9D9"
      }} />
      <div style={{
        width: "360px",
        height: "40px",
        left: "150px",
        top: "260px",
        position: "absolute",
        color: "black",
        fontSize: "30px",
        fontFamily: "Inter",
        fontWeight: "500"
      }}>
        Interview Playback
      </div>

    </div>
  );
};

export default MoreDetails;
