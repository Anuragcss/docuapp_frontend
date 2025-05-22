import React, { useState } from "react";
import { GoogleLogin } from "@react-oauth/google";
import { jwtDecode } from "jwt-decode";
import { FaLinkedin } from "react-icons/fa";
import "./SignUp.css";

const SignUp = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!email || !password) {
      setError("Both fields are required!");
    } else if (!/\S+@\S+\.\S+/.test(email)) {
      setError("Invalid email format!");
    } else {
      setError("");
      alert("Sign Up Successful!");
    }
  };

  const handleGoogleSuccess = (credentialResponse) => {
    const decoded = jwtDecode(credentialResponse.credential);
    console.log("Google SignUp Success:", decoded);
    alert(`Welcome ${decoded.name}`);
  };

  const handleGoogleError = () => {
    console.error("Google Sign Up Failed");
  };

  return (
    <div className="signup-container">
      {/* Left Section */}
      <div className="signup-left">
        <h2>Sign up with DocuApp for free</h2>
        <p>
          Already have an account? <a href="/login">Sign in</a>
        </p>

        {/* ✅ Real Google Sign Up Button */}
        <div style={{ marginBottom: "10px" }}>
          <GoogleLogin onSuccess={handleGoogleSuccess} onError={handleGoogleError} />
        </div>

        <button className="linkedin-signup">
          <FaLinkedin /> Sign up with LinkedIn
        </button>

        <p className="or">or</p>

        <form onSubmit={handleSubmit}>
          <input
            type="email"
            placeholder="Please enter your email address"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
          />
          <input
            type="password"
            placeholder="Password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
          />
          {error && <p className="error">{error}</p>}

          <div className="terms">
            <input type="checkbox" id="terms" />
            <label htmlFor="terms">
              By signing up, I agree to <a href="#">Terms of use</a> & <a href="#">Privacy Policy</a>
            </label>
          </div>

          <button type="submit" className="continue-btn">Continue</button>
        </form>
      </div>

      {/* Right Section */}
      <div className="signup-right">
        <h2>Start Your Creative Journey With DocuApp!</h2>
        <ul>
          <li>⚙️ AI PPT Editor</li>
          <li>📜 Auto-generate Presentation Outlines</li>
          <li>📑 Massive quality templates & creative content</li>
          <li>📊 PowerPoint & Google Slides Support</li>
        </ul>
      </div>
    </div>
  );
};

export default SignUp;
