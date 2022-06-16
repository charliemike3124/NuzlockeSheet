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
    deleteDoc,
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

    async deleteUserPreferenceSheet(userId, sheetUrl) {
        let userPreference;
        const q = query(USER_PREF_COL, where("userId", "==", userId));
        const querySnapshot = await getDocs(q);
        querySnapshot.forEach((doc2) => {
            let savedSheets = doc2.data().savedSheets;

            const sheet = savedSheets.find((item) => item.sheetUrl === sheetUrl);
            const sheetIndex = savedSheets.indexOf(sheet);

            if (sheetIndex >= 0) {
                savedSheets.splice(sheetIndex, 1);
                userPreference = {
                    userId,
                    savedSheets,
                };
                let docRef = doc(USER_PREF_COL, doc2.id);
                setDoc(docRef, userPreference);
            }
        });
        return userPreference;
    },
};

export default UserPreferencesService;
