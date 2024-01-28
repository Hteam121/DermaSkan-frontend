import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { signInWithEmailAndPassword } from "firebase/auth";
import { auth } from "../../firebase";
import "./Signin.css";

const SignIn = ({ onLoginSuccess }) => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const navigate = useNavigate();

  const signIn = (e) => {
    e.preventDefault();
    signInWithEmailAndPassword(auth, email, password)
      .then((userCredential) => {
        console.log(userCredential);
        onLoginSuccess(); // Update the isLoggedIn state in the App component
        navigate("/home"); // Navigate to the home page
      })
      .catch((error) => {
        console.log(error);
      });
  };

  const navigateToSignUp = () => {
    navigate("/signup"); // Navigate to the signup route
  };

  return (
    <div className="sign-in-container">
      <form onSubmit={signIn} className="sign-in-form">
        <h1>Log In to your Account</h1>
        <input
          type="email"
          placeholder="Enter your email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
        />
        <input
          type="password"
          placeholder="Enter your password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
        />
        <button type="submit">Log In</button>
        
        <p>Don't have an account?</p>
        <button type="button" onClick={navigateToSignUp}>
          Sign up
        </button>
      </form>
    </div>
  );
};

export default SignIn;
