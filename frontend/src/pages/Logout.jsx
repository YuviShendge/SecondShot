import LogoutButton from "../components/LogoutButton";
//const Logout = () => <h1>Logout Page</h1>;

const Logout = () => {
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

export default Logout;
