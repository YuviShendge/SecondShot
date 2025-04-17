import "./Navbar.css";
import { Link } from "react-router-dom";
import { useAuth0 } from "@auth0/auth0-react";

const Navbar = () => {
  const { logout, isAuthenticated } = useAuth0(); 

  return (
    <nav
      style={{
        backgroundColor: "#ccc",
        padding: "10px",
        display: "flex",
        justifyContent: "flex-end",
        alignItems: "center",
      }}
    >
      {isAuthenticated && (
        <>
          <Link
            to="#"
            onClick={(e) => {
              e.preventDefault();
              logout({ returnTo: window.location.origin });
            }}
            style={{ margin: "0 10px" }}
          >
            Logout
          </Link>

          <Link to="/peripherals" style={{ margin: "0 10px" }}>
            Start Interview
          </Link>
        </>
      )}

      <Link to="/interview-history" style={{ margin: "0 10px" }}>
        Interview History
      </Link>

      <Link
        to="https://mail.google.com/mail/?view=cm&fs=1&to=Interviewmock@gmail.com"
        target="_blank"
        rel="noopener noreferrer"
        style={{ margin: "0 10px", color: "black" }}
      >
        Contact Us
      </Link>
    </nav>
  );
};

export default Navbar;