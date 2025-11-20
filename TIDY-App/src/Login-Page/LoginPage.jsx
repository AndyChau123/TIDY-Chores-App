import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import "./LoginPage.css";

function LoginPage() {
  const [loginCode, setLoginCode] = useState("");
  const [error, setError] = useState("");
  const navigate = useNavigate();

  const handleLogin = (e) => {
    e.preventDefault();
    setError("");

    if (loginCode === "123456") {
      navigate("/app");
    } else {
      setError("Invalid code. Please try again.");
      setLoginCode("");
    }
  };

  return (
    <div className="login-container">
      <div className="login-box">
        <h2>Welcome</h2>
        <form onSubmit={handleLogin}>
          <input
            type="text"
            placeholder="Enter your access code"
            value={loginCode}
            onChange={(e) => {
              setLoginCode(e.target.value);
              setError("");
            }}
            required
            autoFocus
          />
          {error && <div className="login-error">{error}</div>}
          <button type="submit">Login</button>
        </form>
      </div>
    </div>
  );
}

export default LoginPage;
