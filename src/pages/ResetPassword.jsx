import React, { useState, useEffect } from "react";
import { useParams, useNavigate, Link } from "react-router-dom";
import "./signin.css"; // Assuming you want similar styling

const API_BASE_URL = "http://localhost:8000";

const ResetPassword = () => {
  const { token } = useParams(); // Get token from URL
  const navigate = useNavigate();
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    if (!token) {
      setError("No reset token provided. Please request a new reset link.");
    }
  }, [token]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setMessage("");
    setIsLoading(true);

    if (!newPassword || !confirmPassword) {
      setError("Both password fields are required.");
      setIsLoading(false);
      return;
    }

    if (newPassword !== confirmPassword) {
      setError("Passwords do not match.");
      setIsLoading(false);
      return;
    }
    if (newPassword.length < 6) {
        setError("Password must be at least 6 characters long.");
        setIsLoading(false);
        return;
    }


    try {
      const response = await fetch(`${API_BASE_URL}/auth/reset-password`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ token, new_password: newPassword }),
      });

      const data = await response.json();

      if (!response.ok) {
        setError(data.detail || "Failed to reset password. The link may be invalid or expired.");
      } else {
        setMessage(data.message + " You can now sign in with your new password.");
        setNewPassword("");
        setConfirmPassword("");
        setTimeout(() => {
            navigate("/signin");
        }, 3000); // Redirect to signin after 3 seconds
      }
    } catch (err) {
      console.error("Reset password error:", err);
      setError("An unexpected error occurred. Please try again later.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="signin-container">
      <div className="signin-left">
        <h2>Reset Your Password</h2>
        <p>
          Enter your new password below.
        </p>

        {message && <p className="success-message" style={{ color: 'green', textAlign: 'center', marginBottom: '15px' }}>{message}</p>}
        {error && <p className="error-message" style={{ color: 'red', textAlign: 'center', marginBottom: '15px' }}>{error}</p>}

        <form onSubmit={handleSubmit}>
          <input
            type="password"
            placeholder="Enter new password"
            value={newPassword}
            onChange={(e) => setNewPassword(e.target.value)}
            required
            disabled={isLoading}
          />
          <input
            type="password"
            placeholder="Confirm new password"
            value={confirmPassword}
            onChange={(e) => setConfirmPassword(e.target.value)}
            required
            disabled={isLoading}
          />
          <button type="submit" className="continue-btn" disabled={isLoading || !token}>
            {isLoading ? "Resetting..." : "Reset Password"}
          </button>
        </form>
         <p style={{ marginTop: '20px', textAlign: 'center' }}>
          Remembered it? <Link to="/signin">Sign In</Link>
        </p>
      </div>
      <div className="signin-right">
        <h2>Secure Your Account</h2>
        <p>Choose a strong, unique password to keep your account safe.</p>
      </div>
    </div>
  );
};

export default ResetPassword;