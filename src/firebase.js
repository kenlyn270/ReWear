import { initializeApp } from "firebase/app";
import { getFirestore } from "firebase/firestore";
const firebaseConfig = {
  apiKey: "AIzaSyCM8pGwJgx_IiEV_PSYcAjl-PWhEHJH1IU",
  authDomain: "hackaton-d3184.firebaseapp.com",
  projectId: "hackaton-d3184",
  storageBucket: "hackaton-d3184.firebasestorage.app",
  messagingSenderId: "812778176166",
  appId: "1:812778176166:web:10d4b8e1d36677703bbe67",
  measurementId: "G-LLBDHHWKV6"
};

const app = initializeApp(firebaseConfig);
const db = getFirestore(app);
export { db };
