import { App } from "@/firebase.config";
import {
    getFirestore,
    collection,
    addDoc,
    setDoc,
    getDocs,
    doc,
    serverTimestamp,
    query,
    where,
} from "firebase/firestore";

const Database = getFirestore(App);
const USER_PREF_COL = collection(Database, "UserPreferences");

const UserPreferencesService = {
    async CreateUserPreference(userPreferenceData) {
        const q = query(USER_PREF_COL, where("userId", "==", userPreferenceData.userId));
        const querySnapshot = await getDocs(q);
        let docId;
        querySnapshot.forEach((doc) => {
            docId = doc.id;
        });
        if (docId) {
            const docRef = doc(USER_PREF_COL, docId);
            userPreferenceData.updatedAt = serverTimestamp();
            setDoc(docRef, userPreferenceData);
        } else {
            userPreferenceData.createdAt = serverTimestamp();
            userPreferenceData.updatedAt = serverTimestamp();
            let document = await addDoc(USER_PREF_COL, userPreferenceData);
            docId = document.id;
        }
        return docId;
    },

    async GetUserPreferences(userId) {
        const q = query(USER_PREF_COL, where("userId", "==", userId));
        const querySnapshot = await getDocs(q);
        let docData;
        querySnapshot.forEach((doc) => {
            docData = doc.data();
        });

        return docData;
    },
};

export default UserPreferencesService;
