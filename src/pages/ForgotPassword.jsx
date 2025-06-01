import React, { useState } from "react";
import { Link } from "react-router-dom";
import "./signin.css"; // Assuming you want similar styling

const API_BASE_URL = "http://localhost:8000";

const ForgotPassword = () => {
  const [email, setEmail] = useState("");
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setMessage("");
    setIsLoading(true);

    if (!email) {
      setError("Email address is required.");
      setIsLoading(false);
      return;
    }

    try {
      const response = await fetch(`${API_BASE_URL}/auth/request-password-reset`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ email }),
      });

      const data = await response.json();

      if (!response.ok) {
        setError(data.detail || "Failed to send reset link. Please try again.");
      } else {
        setMessage(data.message + (data.reset_token_for_testing ? ` DEV ONLY - Token: ${data.reset_token_for_testing}` : ''));
        // In production, data.reset_token_for_testing should not exist or be displayed.
        setEmail(""); // Clear email field on success
      }
    } catch (err) {
      console.error("Forgot password error:", err);
      setError("An unexpected error occurred. Please try again later.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="signin-container"> {/* Reusing signin-container for layout */}
      <div className="signin-left">  {/* Reusing signin-left */}
        <h2>Forgot Your Password?</h2>
        <p>
          Enter your email address below, and we'll send you a link to reset your password.
        </p>

        {message && <p className="success-message" style={{ color: 'green', textAlign: 'center', marginBottom: '15px' }}>{message}</p>}
        {error && <p className="error-message" style={{ color: 'red', textAlign: 'center', marginBottom: '15px' }}>{error}</p>}

        <form onSubmit={handleSubmit}>
          <input
            type="email"
            placeholder="Enter your email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
            disabled={isLoading}
          />
          <button type="submit" className="continue-btn" disabled={isLoading}>
            {isLoading ? "Sending..." : "Send Reset Link"}
          </button>
        </form>

        <p style={{ marginTop: '20px', textAlign: 'center' }}>
          Remember your password? <Link to="/signin">Sign In</Link>
        </p>
         <p style={{ marginTop: '10px', textAlign: 'center' }}>
          Don't have an account? <Link to="/signup">Sign Up</Link>
        </p>
      </div>
       <div className="signin-right"> {/* Optional: Reusing right panel */}
        <h2>Password Recovery</h2>
        <p>We'll help you get back into your account quickly.</p>
      </div>
    </div>
  );
};

export default ForgotPassword;