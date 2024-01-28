import { initializeApp } from "firebase/app";
import { getAnalytics } from "firebase/analytics";
import { getStorage } from 'firebase/storage';
import { getAuth } from "firebase/auth";
import { getFirestore } from 'firebase/firestore';
// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries

// Your web app's Firebase configuration
const firebaseConfig = {
  apiKey: "AIzaSyBOJHrAg-h521wlzC4kAkaUP5uw4l6_cfo",
  authDomain: "travvy-9dfdb.firebaseapp.com",
  projectId: "travvy-9dfdb",
  storageBucket: "travvy-9dfdb.appspot.com",
  messagingSenderId: "942161646967",
  appId: "1:942161646967:web:53297025e12c97cb557d72",
  measurementId: "G-14YV9CTK2P"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const analytics = getAnalytics(app);
const storage = getStorage(app);
const firestore = getFirestore(app); // Initialize Firestore with correct variable name

export { storage, firestore }; // Export Firestore correctly
export const auth = getAuth(app);
