import { useAuth0 } from "@auth0/auth0-react";

const LoginButton = () => {
  const { loginWithRedirect, isAuthenticated } = useAuth0();

  const linkStyle = {
    textDecoration: "none",
    color: "black", 
    fontSize: "inherit",
    fontFamily: "inherit",
    fontWeight: "600",
    cursor: "pointer",
  };

  return (
    !isAuthenticated && (
      <a
        href="#"
        onClick={(e) => {
          e.preventDefault(); // Prevents default link behavior
          loginWithRedirect();
        }}
        style={linkStyle}
      >
        Sign in
      </a>
    )
  );
};

export default LoginButton;
