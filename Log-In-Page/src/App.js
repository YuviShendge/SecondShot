import React from "react";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import DesignPage from "../../frontend/src/pages/DesignPage";
import HelloPage from "./pages/SecondPage";

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<DesignPage />} />
        <Route path="/hello" element={<HelloPage />} />
      </Routes>
    </Router>
  );
}

export default App;
