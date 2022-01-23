import { Auth } from "@/firebase.config.js";
import { signInWithPopup, GoogleAuthProvider } from "firebase/auth";

async function SignInWithGoogleAsync() {
    let signedInUser = {
        accessToken: null,
        user: null,
    };
    const gProvider = new GoogleAuthProvider();
    try {
        const response = await signInWithPopup(Auth, gProvider);
        signedInUser.accessToken = response.user.accessToken;
        signedInUser.user = {
            displayName: response.user.displayName,
            email: response.user.email,
            id: response.user.uid,
            photoUrl: response.user.photoURL,
        };
    } catch (err) {
        console.error(err);
    }
    return signedInUser;
}

export default {
    SignInWithGoogleAsync,
};
