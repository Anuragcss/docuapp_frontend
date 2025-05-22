import React from "react";
import { Link } from "react-router-dom";
import { GoogleLogin } from "@react-oauth/google";
import { jwtDecode } from "jwt-decode";
import "./signin.css";

const SignIn = () => {
  return (
    <div className="signin-container">
      <div className="signin-left">
        <h2>Welcome Back</h2>
        <h2>Please sign in</h2>
        <p>
          Don't have an account? <Link to="/signup">Sign up</Link>
        </p>

        <div className="google-signin">
          <GoogleLogin
            onSuccess={(credentialResponse) => {
              const decoded = jwtDecode(credentialResponse.credential);
              console.log("Google Login Success:", decoded);

              // ✅ Store token & user data
              localStorage.setItem('authToken', credentialResponse.credential);
              localStorage.setItem('user', JSON.stringify(decoded));

              // ✅ Redirect to HeroSection (home page)
              window.location.href = '/';
            }}
            onError={() => {
              console.log("Google Login Failed");
            }}
          />
        </div>

        <p className="or">or</p>

        <input type="email" placeholder="Enter your email" />
        <input type="password" placeholder="Password" />

        <div className="terms">
          <input type="checkbox" id="remember" />
          <label htmlFor="remember">Remember me</label>
        </div>

        <button className="continue-btn">Sign In</button>

        <p className="forgot-password">
          <Link to="/forgot-password">Forgot password?</Link>
        </p>
      </div>

      <div className="signin-right">
        <h2>Welcome Back to DocuApp!</h2>
        <ul>
          <li>🔒 Secure Cloud Storage</li>
          <li>📄 AI-powered Document Management</li>
          <li>🚀 Fast and Easy Access</li>
        </ul>
      </div>
    </div>
  );
};

export default SignIn;
