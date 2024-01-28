import { initializeApp } from 'firebase/app';
import { getStorage } from 'firebase/storage';
import { getFirestore } from 'firebase/firestore'; // Import for Firestore
import { getAnalytics } from "firebase/analytics";

// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries

const firebaseConfig = {
  apiKey: "AIzaSyC2ZpI-dtzkrmAWMCq1BONG7Zw50VhXYFs",
  authDomain: "purely-halal.firebaseapp.com",
  projectId: "purely-halal",
  storageBucket: "purely-halal.appspot.com",
  messagingSenderId: "335203349385",
  appId: "1:335203349385:web:1fe09330e068e15f422758",
  measurementId: "G-SLNJHMXSBN"
};


const app = initializeApp(firebaseConfig);
const storage = getStorage(app);
const firestore = getFirestore(app); // Initialize Firestore
const analytics = getAnalytics(app);

export { storage, firestore }; // Export Firestore
