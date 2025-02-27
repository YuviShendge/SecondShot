import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import Navbar from "./components/Navbar";
import Home from "./pages/Home";
import InterviewHistory from "./pages/InterviewHistory";
import MoreDetails from "./pages/MoreDetails";
import Contact from "./pages/Contact";
import Logout from "./pages/Logout";
import InterviewPage from "./pages/InterviewPage";

const App = () => {
  return (
    <Router>
      <Navbar />
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/interview-history" element={<InterviewHistory />} />
        <Route path="/more-details" element={<MoreDetails />} />
        <Route path="/contact" element={<Contact />} />
        <Route path="/logout" element={<Logout />} />
        <Route path="/interview" element={<InterviewPage />} />
      </Routes>
    </Router>
  );
};

export default App;
