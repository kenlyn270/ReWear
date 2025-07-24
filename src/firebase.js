// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
import { getFirestore } from "firebase/firestore";
// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries

// Your web app's Firebase configuration
// For Firebase JS SDK v7.20.0 and later, measurementId is optional
const firebaseConfig = {
  apiKey: "AIzaSyCM8pGwJgx_IiEV_PSYcAjl-PWhEHJH1IU",
  authDomain: "hackaton-d3184.firebaseapp.com",
  projectId: "hackaton-d3184",
  storageBucket: "hackaton-d3184.firebasestorage.app",
  messagingSenderId: "812778176166",
  appId: "1:812778176166:web:10d4b8e1d36677703bbe67",
  measurementId: "G-LLBDHHWKV6"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

export { db };
