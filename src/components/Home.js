import React, { useRef, useState, useEffect } from 'react';
import axios from 'axios';
import './Home.css';
import './LoadingBar.css'; // Include the CSS for the loading bar here
import gsap from 'gsap'; // Ensure GSAP is installed and imported
import { ref, uploadBytes, getDownloadURL } from 'firebase/storage';
import { storage } from '../firebase'; // Adjust the path as necessary
import { doc, setDoc } from 'firebase/firestore';
import { firestore } from '../firebase'; // Import your Firestore instance


function Home({ onResults }) {
  const videoRef = useRef(null);
  const [stream, setStream] = useState(null);
  const [selectedFile, setSelectedFile] = useState(null);
  const fileInputRef = useRef(null);
  const [captureButtonLabel, setCaptureButtonLabel] = useState("Capture");
  const [isLoading, setIsLoading] = useState(false);
  const [result, setResult] = useState(null);
  const [error, setError] = useState(null);
  const [showResults, setShowResults] = useState(false); // New state to control result display


  useEffect(() => {
    async function enableStream() {
      try {
        const stream = await navigator.mediaDevices.getUserMedia({ video: true });
        setStream(stream);
        if (videoRef.current) {
          videoRef.current.srcObject = stream;
        }
      } catch (err) {
        console.error(err);
      }
    }

    if (!stream) {
      enableStream();
    } else {
      return function cleanup() {
        stream.getTracks().forEach(track => {
          track.stop();
        });
      };
    }
  }, [stream]);

  const enableStream = async () => {
    try {
      const newStream = await navigator.mediaDevices.getUserMedia({ video: true });
      setStream(newStream);
      if (videoRef.current) {
        videoRef.current.srcObject = newStream;
      }
    } catch (err) {
      console.error(err);
    }
  };
  
  useEffect(() => {
    if (!stream) {
      enableStream();
    } else {
      return function cleanup() {
        if (stream) {
          stream.getTracks().forEach(track => track.stop());
        }
      };
    }
  }, [stream]);
  
  
  useEffect(() => {
    if (!stream) {
      enableStream();
    } else {
      return function cleanup() {
        stream.getTracks().forEach(track => track.stop());
      };
    }
  }, [stream]);
  

  const capturePhoto = () => {
    // If an image is already captured, reset to live video feed
    if (selectedFile) {
      setSelectedFile(null);
      setCaptureButtonLabel("Capture");
      return;
    }
  
    // Else, capture a new photo
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

  useEffect(() => {
    // Function to initialize the video stream
    const initializeStream = async () => {
      try {
        const newStream = await navigator.mediaDevices.getUserMedia({ video: true });
        setStream(newStream);
        if (videoRef.current) {
          videoRef.current.srcObject = newStream;
        }
      } catch (err) {
        console.error('Error accessing media devices:', err);
      }
    };
  
    initializeStream();
  
    // Cleanup function to stop the stream when the component is unmounted
    return () => {
      if (stream) {
        stream.getTracks().forEach(track => track.stop());
      }
    };
  }, []);  
  

  const dataURLtoBlob = (dataurl) => {
    if (!dataurl) return null;
  
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
  
    // Convert data URL to a Blob
    const photoBlob = dataURLtoBlob(imageDataUrl);
  
    // Create a file from Blob
    const file = new File([photoBlob], "captured-image.png", { type: 'image/png' });
  
    // Create form data
    const formData = new FormData();
    formData.append('file', file);
  
    try {
      const response = await axios.post('http://127.0.0.1:5000/upload', formData, {
        headers: {
          'Content-Type': 'multipart/form-data'
        }
      });
      setResult(response.data); // Set result
      if (response.data) {
        setShowResults(true); // Show results if data is received
        onResults(response.data); // Use the callback to send results to App
      }
    } catch (error) {
      console.error('Error uploading photo', error);
      setError('Error uploading photo. Please try again.'); // Set error message
    } finally {
      setIsLoading(false); // End loading
    }
  
    // Upload to Firebase
    uploadImageToFirebase(file);    
  };
  
  
  

  const handleFileInput = (e) => {
    const file = e.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = function(event) {
        const imageDataUrl = event.target.result;
        setSelectedFile(imageDataUrl); // Display the uploaded image
        sendPhotoToBackend(imageDataUrl); // Send the image to the backend
      };
      reader.readAsDataURL(file);
    }

    setCaptureButtonLabel("Recapture");
  };
  

  const handleFileUpload = async (file) => {
    const formData = new FormData();
    formData.append('file', file);

    try {
      const response = await axios.post('http://localhost:5000/upload', formData, {
        headers: {
          'Content-Type': 'multipart/form-data'
        }
      });
      console.log('File uploaded successfully', response.data);
    } catch (error) {
      console.error('Error uploading file', error);
    }
  }

  const triggerFileInput = () => {
    if (fileInputRef.current) {
      fileInputRef.current.click(); // Programmatically click the hidden file input
    } else {
      console.error('The file input is not yet rendered.');
    }
  }

  useEffect(() => {
    if (isLoading) {
      animateProgressBar();
    }
  }, [isLoading]);

  const animateProgressBar = () => {
    const progressBar = document.querySelector('.progress-bar');
    const progressBarText = document.querySelector('.progress-bar__text');
    const progressBarStates = [0, 7, 27, 34, 68, 80, 95, 100];
    let time = 0;
    let endState = 100;

    progressBarStates.forEach(state => {
      let randomTime = Math.floor(Math.random() * 3000);
      setTimeout(() => {
        if(state === endState){
          gsap.to(progressBar, {
            x: `${state}%`,
            duration: 2,
            backgroundColor: '#4895ef',
            onComplete: () => {
              progressBarText.style.display = "initial";
            }
          });
        } else {
          gsap.to(progressBar, {
            x: `${state}%`,
            duration: 2,
          });
        }
      }, randomTime + time);
      time += randomTime;
    });
  };

  const uploadImageToFirebase = (file) => {
    if (!file) {
      console.error('No file provided for upload');
      return;
    }
  
    // Create a storage reference
    const storageRef = ref(storage, `images/${file.name}`);
  
    // Upload the file
    uploadBytes(storageRef, file).then((snapshot) => {
      console.log('Uploaded a blob or file!');
  
      // Get the download URL
      getDownloadURL(snapshot.ref).then(async (downloadURL) => {
        console.log('File available at', downloadURL);
  
        // Check if 'result' state is available and not null
        if (result) {
          // Save the URL along with status and explanation in Firestore
          const docData = {
            url: downloadURL,
            status: result.status,
            explanation: result.explanation
          };
  
          const docRef = await setDoc(doc(firestore, "images", file.name), docData);
          console.log("Document written with ID: ", docRef.id);
        }
      });
    }).catch((error) => {
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
