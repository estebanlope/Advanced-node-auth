import { useState } from "react";
import axios from "axios";
import React from "react";
import { Link } from "react-router-dom";
import "./ResetPasswordScreen.css";

const ResetPasswordScreen = ({ match }) => {
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [error, setError] = useState("");
  const [succes, setSucces] = useState("");

  const resetPasswordHandler = async (e) => {
    e.preventDefault();

    const config = {
      headers: {
        "Content-Type": "application/json",
      },
    };

    if(password !== confirmPassword){
      setPassword("");
      setConfirmPassword("");
      setTimeout(() => {
        setError("");
      }, 5000);
      return setError("Passwords don't match")
    }

    try {
      const { data } = await axios.put(
        `/api/auth/passwordreset/${match.params.resetToken}`,
        { password },
        config
      );
      
      setSucces(data.data)
    } catch (error) {
      setError(error.response.data.error);
      setTimeout(() => {
        setError("");
      }, 5000);
    }
  };

  return (
    <div className="resetpassword-screen">
      <form onSubmit={resetPasswordHandler} className="resetpassword-screen__form">
        <h3 className="resetpassword-screen__title">Forgot Password</h3>
        {error && <span className="error-message">{error}</span>}
        {succes && <span className="success-message">{succes} <Link to="/login">Login</Link></span>}


        <div className="form-group">
          <label htmlFor="password">New Password:</label>
          <input
            type="text"
            required
            id="password"
            placeholder="Enter new password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
          />
        </div>
        <div className="form-group">
          <label htmlFor="confirmpassword">Confirm new password:</label>
          <input
            type="text"
            required
            id="confirmpassword"
            placeholder="Confirm new password"
            value={confirmPassword}
            onChange={(e) => setConfirmPassword(e.target.value)}
          />
        </div>

        <button type="submit" className="btn btn-primary">
          Reset Password
        </button>
      </form>
    </div>
  );
};

export default ResetPasswordScreen;
