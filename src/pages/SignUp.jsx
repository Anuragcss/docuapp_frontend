import React, { useState } from "react";
import { GoogleLogin } from "@react-oauth/google"; //
import { jwtDecode } from "jwt-decode"; //
import { FaLinkedin } from "react-icons/fa"; //
import "./SignUp.css"; //
import { Link, useNavigate } from "react-router-dom"; // Added useNavigate

const API_BASE_URL = "http://localhost:8000"; // Or your backend URL

const SignUp = () => {
  const [email, setEmail] = useState(""); //
  const [password, setPassword] = useState(""); //
  const [error, setError] = useState(""); //
  const [successMessage, setSuccessMessage] = useState("");
  const navigate = useNavigate(); // For redirection

  const handleSubmit = async (e) => { //
    e.preventDefault(); //
    setError("");
    setSuccessMessage("");

    if (!email || !password) {
      setError("Email and password are required."); //
      return;
    }
    if (!/\S+@\S+\.\S+/.test(email)) { //
      setError("Invalid email format."); //
      return;
    }
    if (password.length < 6) {
        setError("Password must be at least 6 characters long.");
        return;
    }

    try {
      const response = await fetch(`${API_BASE_URL}/auth/signup`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ email, password }),
      });

      const data = await response.json();

      if (!response.ok) {
        setError(data.detail || "Sign up failed. Please try again.");
      } else {
        setSuccessMessage("Sign up successful! Redirecting to sign in...");
        // alert("Sign Up Successful! Please sign in."); //
        setTimeout(() => {
            navigate("/login"); // Redirect to sign-in page
        }, 2000);
      }
    } catch (err) {
      console.error("Sign up error:", err);
      setError("An unexpected error occurred. Please try again later.");
    }
  };

  const handleGoogleSuccess = (credentialResponse) => { //
    const decoded = jwtDecode(credentialResponse.credential); //
    console.log("Google SignUp Success:", decoded); //
    // Store token and user data from Google
    localStorage.setItem('authToken', credentialResponse.credential);
    localStorage.setItem('user', JSON.stringify({ 
        email: decoded.email, 
        name: decoded.name, 
        picture: decoded.picture,
        isGoogleUser: true 
    }));
    alert(`Welcome ${decoded.name}!`); //
    navigate('/'); // Redirect to home or dashboard
  };

  const handleGoogleError = () => { //
    console.error("Google Sign Up Failed"); //
    setError("Google Sign Up failed. Please try again or use email/password.");
  };

  return (
    <div className="signup-container"> {/* */}
      {/* Left Section */}
      <div className="signup-left"> {/* */}
        <h2>Sign up with DocuApp for free</h2> {/* */}
        <p>
          Already have an account? <Link to="/login">Sign in</Link> {/* Changed href to Link */} {/* */}
        </p>

        <div style={{ marginBottom: "10px" }}> {/* */}
          <GoogleLogin onSuccess={handleGoogleSuccess} onError={handleGoogleError} /> {/* */}
        </div>

        <button className="linkedin-signup" onClick={() => alert("LinkedIn Sign Up not implemented yet.")}> {/* */}
          <FaLinkedin /> Sign up with LinkedIn {/* */}
        </button>

        <p className="or">or</p> {/* */}

        <form onSubmit={handleSubmit}> {/* */}
          <input
            type="email"
            placeholder="Please enter your email address"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
          /> {/* */}
          <input
            type="password"
            placeholder="Password (min. 6 characters)"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
          /> {/* */}
          {error && <p className="error-message">{error}</p>} {/* */}
          {successMessage && <p className="success-message">{successMessage}</p>}


          <div className="terms"> {/* */}
            <input type="checkbox" id="terms" required /> {/* */}
            <label htmlFor="terms"> {/* */}
              By signing up, I agree to <a href="#">Terms of use</a> & <a href="#">Privacy Policy</a> {/* */}
            </label>
          </div>

          <button type="submit" className="continue-btn">Continue</button> {/* */}
        </form>
      </div>

      {/* Right Section */}
      <div className="signup-right"> {/* */}
        <h2>Start Your Creative Journey With DocuApp!</h2> {/* */}
        <ul>
          <li>⚙️ AI PPT Editor</li> {/* */}
          <li>📜 Auto-generate Presentation Outlines</li> {/* */}
          <li>📑 Massive quality templates & creative content</li> {/* */}
          <li>📊 PowerPoint & Google Slides Support</li> {/* */}
        </ul>
      </div>
    </div>
  );
};

export default SignUp;