import React from 'react';
import { useNavigate } from 'react-router-dom';
import './ResultComponent.css';

const ResultComponent = ({ result, onReport, onRecaptureClick }) => {
  const navigate = useNavigate();

  if (!result) return null;

  const { description } = result;

  const handleRecapture = () => {
    onRecaptureClick(); // Call the passed in function
    navigate('/home');
  };

  return (
    <React.Fragment>
      <div className="result-container">
        <p>
          <strong>AI Response:</strong> {description}
        </p>
      </div>
      <button className="button-77 recapture-button" onClick={handleRecapture}>
        Recapture
      </button>
    </React.Fragment>
  );
};

export default ResultComponent;
