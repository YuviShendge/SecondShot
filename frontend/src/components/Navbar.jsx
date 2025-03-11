import "./Navbar.css";
import { Link } from "react-router-dom";
import { useAuth0 } from "@auth0/auth0-react";

const Navbar = () => {
  //Logout Bar/Button
  //Uses Auth0 logout directly in the navbar
  const { logout, isAuthenticated } = useAuth0(); 

  return (
    <nav style={{ backgroundColor: "#ccc", padding: "10px", display: "flex", justifyContent: "flex-end" }}>
      {isAuthenticated && (
        <Link
          to="#"
          onClick={(e) => {
            //Prevents default link behavior
            e.preventDefault(); 
            //Logs out and goes back to home page
            logout({ returnTo: window.location.origin }); 
          }}
          style={{ margin: "0 10px"}}
        >
          Logout
        </Link>
      )}
      <Link to="/interview-history" style={{ margin: "0 10px" }}>Interview History</Link>
      <Link to="/more-details" style={{ margin: "0 10px" }}>More Details</Link>
      <Link to="/contact" style={{ margin: "0 10px" }}>Contact Us</Link>
    </nav>
  );
};

export default Navbar;
