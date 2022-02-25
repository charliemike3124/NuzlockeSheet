import { App } from "@/firebase.config.js";
import { User } from "../resources/models";
import { Constants } from "../resources/constants";
import {
    signInWithPopup,
    GoogleAuthProvider,
    FacebookAuthProvider,
    TwitterAuthProvider,
    EmailAuthProvider,
    getAuth,
    signOut,
    setPersistence,
    browserLocalPersistence,
    onAuthStateChanged,
} from "firebase/auth";

//-- Sings in with google popup
async function SignInWithPopupAsync(provider) {
    const auth = getAuth(App);
    let signedInUser, authProvider;

    switch (provider) {
        case Constants.AUTH_PROVIDERS.GOOGLE:
            authProvider = new GoogleAuthProvider();
            break;
        case Constants.AUTH_PROVIDERS.EMAIL:
            authProvider = new EmailAuthProvider();
            break;
        case Constants.AUTH_PROVIDERS.FACEBOOK:
            authProvider = new FacebookAuthProvider();
            break;
        case Constants.AUTH_PROVIDERS.TWITTER:
            authProvider = new TwitterAuthProvider();
            break;
    }

    try {
        setPersistence(auth, browserLocalPersistence);
        const response = await signInWithPopup(auth, authProvider);
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
    return new Promise((resolve) => {
        const auth = getAuth(App);
        onAuthStateChanged(auth, (user) => {
            if (user) {
                // User is signed in
                let signedInUser = User(user.uid, user.displayName, user.email, user.photoURL);
                SetCurrentUser(signedInUser);
            } else {
                // User is signed out
                SetCurrentUser(null);
            }
            resolve(!!user);
        });
    });
}

export default {
    SignInWithPopupAsync,
    CheckForSignedInUser,
    SignOutAsync,
};
