import React, { useState, useRef, useEffect } from "react";
import "../components/InterviewHist.css";
import axios from "axios";

const InterviewHistory = () => {
return(
<div className="interview-container">
      <h1 className="interview-title">Interviews by Date</h1>
      {/* Date Section */}
      <div className="interview-grid">
        {[...Array(5)].map((_, index) => (
          <div key={index} className="interview-card">
            <h2>Date</h2>
            <p>Basic Interview</p>
          </div>
        ))}
      </div>
      
      <hr className="divider" />
      <h1 className="interview-title">View Specific Questions</h1>
      {/* Question Section */}
      <div className="interview-grid">
        {[...Array(6)].map((_, index) => (
          <div key={index} className="interview-card">
            <h2>Question</h2>
            <p>Enter question here</p>
          </div>
        ))}
      </div>
    </div>)};
export default InterviewHistory;

