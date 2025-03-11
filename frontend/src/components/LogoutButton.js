import { useAuth0 } from "@auth0/auth0-react";

const LogoutButton = () => {
  const { logout, isAuthenticated } = useAuth0();

  return (
    isAuthenticated && (
      <button
        onClick={() => logout({ returnTo: window.location.origin })}  // ✅ Redirects user to home after logout
        style={{ background: "none", border: "none", cursor: "pointer", color: "blue", textDecoration: "underline" }}
      >
        Sign Out
      </button>
    )
  );
};

export default LogoutButton;
