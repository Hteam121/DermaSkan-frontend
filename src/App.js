import React, { useState } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import Home from './components/Home';
import Logo from './components/Logo';
import Signin from './components/auth/Signin';
import SignUp from './components/auth/Signup';
import AuthDetails from './components/Authdetails';
import { addDoc, collection } from 'firebase/firestore'; // Make sure these are correctly imported
import { firestore } from './firebase'; // Adjust the path if necessary
import Results from './components/ResultComponent';
import './App.css';

function App() {
  const [result, setResult] = useState(null);
  const [showReportForm, setShowReportForm] = useState(false);
  const [isLoggedIn, setIsLoggedIn] = useState(false); 


  const handleRecapture = () => {
    setResult(null);
    setShowReportForm(false); // Reset report form view as well
  };

  const handleReport = () => {
    setShowReportForm(true);
  };

  const onLoginSuccess = () => {
    setIsLoggedIn(true);
  };

  const handleReportSubmit = async (reportData) => {
    try {
      // Add the report data to the 'reports' collection in Firestore
      const docRef = await addDoc(collection(firestore, "reports"), {
        ...reportData,
        timestamp: new Date() // Optionally add a timestamp
      });

      console.log("Report submitted with ID: ", docRef.id);
      setShowReportForm(false);
      setResult(null); // Optionally reset or handle result after reporting
    } catch (e) {
      console.error("Error submitting report: ", e);
    }
  };

  const handleReportCancel = () => {
    setShowReportForm(false);
  };

  return (
    <Router>
      <div className="App">
        <Logo />
        <Routes>
          <Route path="/signin" element={<Signin onLoginSuccess={onLoginSuccess} />} />
          <Route path="/signup" element={<SignUp />} />
          <Route path="/authdetails" element={<AuthDetails />} />
          <Route path="/home" element={isLoggedIn ? <Home onResults={setResult} /> : <Navigate to="/signin" replace />} />
          <Route path="/" element={isLoggedIn ? <Navigate to="/home" replace /> : <Navigate to="/signin" replace />} />
          <Route path="/results" element={<Results />} /> 
        </Routes>
      </div>
    </Router>
  );
}

export default App;