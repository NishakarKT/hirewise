// eslint-disable-next-line import/no-unresolved
import firebase from "firebase/compat/app";
import "firebase/compat/auth";

const firebaseConfig = {
    apiKey: "AIzaSyBP3ya7CCJxJHbwwwx76DoHrOGcCJ-9c8k",
    authDomain: "quikmartt.firebaseapp.com",
    projectId: "quikmartt",
    storageBucket: "quikmartt.appspot.com",
    messagingSenderId: "194662547496",
    appId: "1:194662547496:web:e5f89ca532bf7c543fb51d",
    measurementId: "G-QB47G4FW58"
};

firebase.initializeApp(firebaseConfig);
export const auth = firebase.auth();
export const googleProvider = new firebase.auth.GoogleAuthProvider();