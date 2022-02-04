import { initializeApp } from "firebase/app";
import secret from "./firebase.secret";

// Initialize Firebase
const App = initializeApp(secret);

export { App };
