import React from "react";
import LogoutButton from "../components/LogoutButton";

const HelloPage = () => {
  return (
    <div
      style={{
        width: "100vw",
        height: "100vh",
        display: "flex",
        justifyContent: "center",
        alignItems: "center",
        background: "white",
      }}
    >
      <LogoutButton />
    </div>
  );
};

export default HelloPage;
