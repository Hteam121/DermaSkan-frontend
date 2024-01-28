import React, { useRef, useState, useEffect } from 'react';
import axios from 'axios';
import './Home.css';
import './LoadingBar.css';
import gsap from 'gsap';
import { ref as firebaseRef, uploadBytes, getDownloadURL } from 'firebase/storage';
import { doc, setDoc } from 'firebase/firestore';
import { storage, firestore } from '../firebase';
import ResultComponent from './ResultComponent';

function Home() {
  const videoRef = useRef(null);
  const [stream, setStream] = useState(null);
  const [selectedFile, setSelectedFile] = useState(null);
  const fileInputRef = useRef(null);
  const [captureButtonLabel, setCaptureButtonLabel] = useState("Capture");
  const [isLoading, setIsLoading] = useState(false);
  const [results, setResults] = useState(null);
  const [error, setError] = useState(null);

  useEffect(() => {
    async function enableStream() {
      try {
        const mediaStream = await navigator.mediaDevices.getUserMedia({ video: true });
        setStream(mediaStream);
        if (videoRef.current) {
          videoRef.current.srcObject = mediaStream;
        }
      } catch (err) {
        console.error('Error accessing media devices:', err);
      }
    }

    if (!stream) {
      enableStream();
    } else {
      return function cleanup() {
        stream.getTracks().forEach(track => track.stop());
      };
    }
  }, [stream]);

  const handleFileInput = (e) => {
    const file = e.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = function(event) {
        const imageDataUrl = event.target.result;
        setSelectedFile(imageDataUrl);
        sendPhotoToBackend(imageDataUrl);
      };
      reader.readAsDataURL(file);
    }
    setCaptureButtonLabel("Recapture");
  };

  const resetState = () => {
    setSelectedFile(null);
    setCaptureButtonLabel("Capture");
    setResults(null); // Reset the results
    setError(null);
    // You can reset other states if needed
  };

  const triggerFileInput = () => {
    fileInputRef.current.click();
  };

  const capturePhoto = () => {
    if (selectedFile) {
      setSelectedFile(null);
      setCaptureButtonLabel("Capture");
      return;
    }

    if (videoRef.current && stream) {
      const canvas = document.createElement('canvas');
      canvas.width = videoRef.current.videoWidth;
      canvas.height = videoRef.current.videoHeight;
      const ctx = canvas.getContext('2d');
      ctx.drawImage(videoRef.current, 0, 0, canvas.width, canvas.height);

      const imageDataUrl = canvas.toDataURL('image/png');
      setSelectedFile(imageDataUrl);
      setCaptureButtonLabel("Recapture");

      sendPhotoToBackend(imageDataUrl);
    }
  };

  const dataURLtoBlob = (dataurl) => {
    const parts = dataurl.split(',');
    if (parts.length < 2) return null;

    const mime = parts[0].match(/:(.*?);/)?.[1];
    if (!mime) return null;

    if (parts[0].indexOf('base64') !== -1) {
      const bstr = atob(parts[1]);
      let n = bstr.length;
      const u8arr = new Uint8Array(n);

      while (n--) {
        u8arr[n] = bstr.charCodeAt(n);
      }

      return new Blob([u8arr], { type: mime });
    } else {
      const raw = decodeURIComponent(parts[1]);
      return new Blob([raw], { type: mime });
    }
  };

  const sendPhotoToBackend = async (imageDataUrl) => {
    if (!imageDataUrl) {
      console.error('No image data URL provided');
      setError('No photo captured. Please capture a photo first.');
      return;
    }

    setIsLoading(true);
    setError(null);

    const photoBlob = dataURLtoBlob(imageDataUrl);
    const file = new File([photoBlob], "captured-image.png", { type: 'image/png' });
    const formData = new FormData();
    formData.append('file', file);

    try {
      const response = await axios.post('http://127.0.0.1:5000/upload', formData, {
        headers: {
          'Content-Type': 'multipart/form-data'
        }
      });

      if (response.data) {
        setResults(response.data);
      }
    } catch (error) {
      console.error('Error uploading photo', error);
      setError('Error uploading photo. Please try again.');
    } finally {
      setIsLoading(false);
    }

    uploadImageToFirebase(file);
  };

  const uploadImageToFirebase = (file) => {
    if (!file) return;

    const storageRef = firebaseRef(storage, `images/${file.name}`);
    uploadBytes(storageRef, file).then(snapshot => {
      getDownloadURL(snapshot.ref).then(downloadURL => {
        // You can do something with the download URL here
        console.log('File available at', downloadURL);
      });
    }).catch(error => {
      console.error('Error uploading file to Firebase:', error);
    });
  };

  if (isLoading) {
    return (
      <div className="container">
        <div className="progress-bar__container">
          <div className="progress-bar">
            <span className="progress-bar__text">Uploading...</span>
          </div>
        </div>
      </div>
    );
  }

  if (results) {
    return <ResultComponent result={results} onRecaptureClick={resetState} />;
  }

  return (
    <div className="camera-container">
      <div className="media-container">
        {selectedFile ? (
          <img src={selectedFile} alt="Captured" className="uploaded-image" />
        ) : (
          <video ref={videoRef} className="video" autoPlay playsInline muted></video>
        )}
      </div>
      <div className="button-container">
        {/* Hidden file input field */}
        <input 
          type="file" 
          ref={fileInputRef}
          onChange={handleFileInput}
          style={{ display: 'none' }}
        />
        {/* Visible upload button that triggers the file input dialog */}
        <button className="button-77 upload-button" onClick={triggerFileInput}>
          {/* SVG icon for upload */}
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
            <polyline points="17 8 12 3 7 8" />
            <line x1="12" y1="3" x2="12" y2="15" />
          </svg>
        </button>
        {/* Capture button for taking photos */}
        <button className="button-77 capture-button" onClick={capturePhoto}>
          {captureButtonLabel}
        </button>
      </div>
    </div>
  );
  
}

export default Home;
