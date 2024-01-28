import React, { useState } from 'react';
import CombinedComponent from './components/Home';
import ResultComponent from './components/ResultComponent';
import Logo from './components/Logo';
import { collection, addDoc } from 'firebase/firestore';
import { firestore } from './firebase'; // Make sure this path is correct
import './App.css';

function App() {
  const [result, setResult] = useState(null);
  const [showReportForm, setShowReportForm] = useState(false);

  const handleRecapture = () => {
    setResult(null);
    setShowReportForm(false); // Reset report form view as well
  };

  const handleReport = () => {
    setShowReportForm(true);
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
    <div className="App">
      <Logo />
      {result && !showReportForm ? (
        <ResultComponent
          result={result}
          onRecapture={handleRecapture}
          onReport={handleReport}
        />
      ) : null}
      {!result ? (
        <CombinedComponent onResults={setResult} />
      ) : null}
    </div>
  );
}

export default App;
