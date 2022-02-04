import { App } from "@/firebase.config.js";
import User from "../resources/models/User";
import {
    signInWithPopup,
    GoogleAuthProvider,
    getAuth,
    signOut,
    setPersistence,
    browserLocalPersistence,
    onAuthStateChanged,
} from "firebase/auth";

//-- Sings in with google popup
async function SignInWithGoogleAsync() {
    const auth = getAuth(App);
    let signedInUser = User();
    const gProvider = new GoogleAuthProvider();
    try {
        setPersistence(auth, browserLocalPersistence);
        const response = await signInWithPopup(auth, gProvider);
        signedInUser = User(
            response.user.uid,
            response.user.displayName,
            response.user.email,
            response.user.photoURL
        );
    } catch (err) {
        console.error(err);
    }
    return signedInUser;
}

//-- Sings out the user
async function SignOutAsync() {
    const auth = getAuth(App);
    try {
        await signOut(auth);
    } catch (err) {
        console.error(err);
    }
}

//-- Checks for any changes on the user auth status.
function CheckForSignedInUser(SetCurrentUser) {
    const auth = getAuth(App);
    onAuthStateChanged(auth, (user) => {
        if (user) {
            // User is signed in
            let signedInUser = User(
                user.uid,
                user.displayName,
                user.email,
                user.photoURL
            );
            SetCurrentUser(signedInUser);
        } else {
            // User is signed out
            SetCurrentUser(null);
        }
    });
}

export default {
    SignInWithGoogleAsync,
    CheckForSignedInUser,
    SignOutAsync,
};
