import React from 'react';
import './ResultComponent.css';

const ResultComponent = ({ result, onRecapture, onReport }) => {
  if (!result) return null;

  const { status, explanation } = result;
  const resultClass = status.toLowerCase() === 'halal' ? 'result-halal' : 'result-haram';

  return (
    <React.Fragment>
      <div className={`result-container ${resultClass}`}>
        <p className="status">
          <strong>Status:</strong> {status}
        </p>
        <p>
          <strong>Explanation:</strong> {explanation}
        </p>
      </div>
      <button className="button-77 recapture-button" onClick={onRecapture}>
        Recapture
      </button>
      <button className="report-button" onClick={onReport}>
        🚩 Report
      </button>
    </React.Fragment>
  );
};

export default ResultComponent;
