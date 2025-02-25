import "./Navbar.css";
import { Link } from "react-router-dom";

const Navbar = () => {
  return (
    <nav style={{ backgroundColor: "#ccc", padding: "10px", display: "flex", justifyContent: "flex-end" }}>
      <Link to="/logout" style={{ margin: "0 10px" }}>Logout</Link>
      <Link to="/interview-history" style={{ margin: "0 10px" }}>Interview History</Link>
      <Link to="/more-details" style={{ margin: "0 10px" }}>More Details</Link>
      <Link to="/contact" style={{ margin: "0 10px" }}>Contact Us</Link>
    </nav>
  );
};

export default Navbar;
