// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
import { getFirestore } from "firebase/firestore";
// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries

// Your web app's Firebase configuration
const firebaseConfig = {
  apiKey: "AIzaSyC3m6SY1Ep9RRRmBhS3bYWUZqH6-wkXZzw",
  authDomain: "project8081-a9abe.firebaseapp.com",
  projectId: "project8081-a9abe",
  storageBucket: "project8081-a9abe.appspot.com",
  messagingSenderId: "694140161630",
  appId: "1:694140161630:web:1bf1e9fea5e3819f70eecf"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);

export const db = getFirestore(app);