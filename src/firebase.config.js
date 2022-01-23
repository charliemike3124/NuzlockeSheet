import { initializeApp } from "firebase/app";
import { getFirestore } from "firebase/firestore";
import { getAuth } from "firebase/auth";
import secret from "./firebase.secret";

// Initialize Firebase
var firebaseConfig = secret;
const App = initializeApp(firebaseConfig);

const Auth = getAuth(App);
const Database = getFirestore(App);

export { Database, Auth };
