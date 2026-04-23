import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";

const firebaseConfig = {
  apiKey: "AIzaSyBHezG7y7zvpYLljQ3_axGMlTxUbiFqZ1c",
  authDomain: "unify-voice.firebaseapp.com",
  projectId: "unify-voice",
  storageBucket: "unify-voice.firebasestorage.app",
  messagingSenderId: "215524365642",
  appId: "1:215524365642:web:ef3e19510ebd4da3351db3"
};

const app = initializeApp(firebaseConfig);

export const auth = getAuth(app);