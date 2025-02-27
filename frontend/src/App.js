import { BrowserRouter as Router, Routes, Route, useLocation } from "react-router-dom";
import Navbar from "./components/Navbar";
import Home from "./pages/Home";
import InterviewHistory from "./pages/InterviewHistory";
import MoreDetails from "./pages/MoreDetails";
import Contact from "./pages/Contact";
import Logout from "./pages/Logout";
import InterviewPage from "./pages/InterviewPage";
import DesignPage from "./pages/DesignPage";


const App = () => {
  return (
    <Router>
      <MainContent />
    </Router>
  );
};

const MainContent = () => {
  const location = useLocation();
  //Hide Navbar on `/` (DesignPage)
  const showNavbar = location.pathname !== "/"; 

  return (
    <>
      {showNavbar && <Navbar />}
      <Routes>
        <Route path="/" element={<DesignPage />} />
        <Route path="/home" element={<Home />} />
        <Route path="/interview-history" element={<InterviewHistory />} />
        <Route path="/more-details" element={<MoreDetails />} />
        <Route path="/contact" element={<Contact />} />
        <Route path="/logout" element={<Logout />} />
        <Route path="/interview" element={<InterviewPage />} />
      </Routes>
    </>
  );
};

export default App;
