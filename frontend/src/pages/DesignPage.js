import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth0 } from "@auth0/auth0-react";
import LoginButton from "../components/LoginButton";
import LogoutButton from "../components/LogoutButton";

const designWidth = 1920;
const designHeight = 1080;

const DesignPage = () => {
  const [scale, setScale] = useState(1);
  const { isLoading, error, isAuthenticated } = useAuth0();
  const navigate = useNavigate();

  // Automatically navigate to the Home page if authenticated
  useEffect(() => {
    if (isAuthenticated) {
      navigate("/peripherals");
    }
  }, [isAuthenticated, navigate]);

  // Calculate scale so the design fits within the viewport without scrollbars
  useEffect(() => {
    function updateScale() {
      const scaleX = window.innerWidth / designWidth;
      const scaleY = window.innerHeight / designHeight;
      setScale(Math.min(scaleX, scaleY));
    }
    updateScale();
    window.addEventListener("resize", updateScale);
    return () => window.removeEventListener("resize", updateScale);
  }, []);

  return (
    <div
      style={{
        width: "100vw",
        height: "100vh",
        overflow: "hidden",
        background: "white",
      }}
    >
      {/* Scaled container anchored at top-left */}
      <div
        style={{
          width: designWidth,
          height: designHeight,
          position: "absolute",
          top: 0,
          left: 0,
          transform: `scale(${scale})`,
          transformOrigin: "top left",
        }}
      >
        {/* Left Sidebar */}
        <div
          style={{
            width: 945,
            height: 1080,
            left: 0,
            top: 0,
            position: "absolute",
            background: "#D9D9D9",
          }}
        />

        {/* SVG Logo */}
        <div data-svg-wrapper style={{ left: 325, top: 71, position: "absolute" }}>
          <svg
            width="294"
            height="416"
            viewBox="0 0 294 416"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
          >
            <path
              d="M60.6375 346.667L6.125 208L61.25 69.3333H110.25L55.125 208L86.975 288.6L182.525 69.3333H232.75L287.875 208L232.75 346.667H183.75L238.875 208L207.025 128.267L112.088 346.667H60.6375Z"
              fill="black"
            />
          </svg>
        </div>

        {/* Instructions */}
        <div
          style={{
            width: 688,
            height: 317,
            left: 128,
            top: 490,
            position: "absolute",
            textAlign: "center",
            color: "black",
            fontSize: 26,
            fontFamily: "Inter",
            fontWeight: "600",
            wordWrap: "break-word",
          }}
        >
          <p><strong>Instructions</strong></p>

          <p>Log in or create an account to get started.</p>

          <p>Check your camera and microphone on the peripherals page.</p>

          <p>Select your questions or let us pick them for you.</p>

          <p>Start the interview — you'll answer 3 questions one at a time.<br />
          You get 20 seconds to prepare before recording each answer.</p>

          <p>After finishing, review your responses, add a self-evaluation,<br />
          and email it to a mentor for feedback.</p>
          </div>

        {/* "Get Started" Button */}
        <div
          style={{
            width: 369,
            height: 150,
            left: 1252,
            top: 337,
            position: "absolute",
            background: "#D9D9D9",
            borderRadius: 25,
          }}
        />
        <div
          style={{
            width: 244,
            height: 64,
            left: 1316,
            top: 394,
            position: "absolute",
            textAlign: "center",
            color: "black",
            fontSize: 40,
            fontFamily: "Inter",
            fontWeight: "600",
            wordWrap: "break-word",
          }}
        >
          Get Started
        </div>

        {/* Divider Line s */}
        <div
          style={{
            width: 442,
            height: 0,
            left: 1216,
            top: 540,
            position: "absolute",
            border: "1px black solid",
          }}
        />
        <div
          style={{
            width: 442,
            height: 0,
            left: 1216,
            top: 646,
            position: "absolute",
            border: "1px black solid",
          }}
        />
        <div
          style={{
            width: 442,
            height: 0,
            left: 1217,
            top: 781,
            position: "absolute",
            border: "1px black solid",
          }}
        />

        {/* "Sign In" area at original coordinates */}
        <div
          style={{
            width: 175,
            height: 34,
            left: 1349,
            top: 574,
            position: "absolute",
            textAlign: "center",
            color: "black",
            fontSize: 32,
            fontFamily: "Inter",
            fontWeight: "600",
            wordWrap: "break-word",
          }}
        >
          {error && <p>Authentication Error</p>}
          {!error && isLoading && <p>Loading...</p>}
          {!error && !isLoading && <LoginButton />}
        </div>

        {/* "Contact Us" area at original coordinates */}
        <div
          style={{
            left: 1365,
            top: 709,
            position: "absolute",
            textAlign: "center",
            color: "black",
            fontSize: 32,
            fontFamily: "Inter",
            fontWeight: "600",
            wordWrap: "break-word",
          }}
        >
          <LogoutButton />
          {/* Contact Us Button (Opens Gmail in New Tab) */}
          <a
            href="https://mail.google.com/mail/?view=cm&fs=1&to=Interviewmock@gmail.com"
            target="_blank"
            rel="noopener noreferrer"
            style={{ marginLeft: "10px", color: "black", textDecoration: "none", cursor: "pointer" }}
          >
            Contact Us
          </a>
        </div>
      </div>
    </div>
  );
};

export default DesignPage;
