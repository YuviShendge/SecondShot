import { useAuth0 } from "@auth0/auth0-react";

const LoginButton = () => {
  const { loginWithRedirect, isAuthenticated } = useAuth0();

  const buttonStyle = {
    width: "110%",
    height: "inherit",
    fontSize: "inherit",
    fontFamily: "inherit",
    fontWeight: "6000",
    background: "transparent",
    border: "none",
    cursor: "pointer",
  };

  return (
    !isAuthenticated && (
      <button style={buttonStyle} onClick={() => loginWithRedirect()}>
        Sign in
      </button>
    )
  );
};

export default LoginButton;
