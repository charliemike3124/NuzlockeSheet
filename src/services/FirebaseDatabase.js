import { App } from "@/firebase.config";
import {
    getFirestore,
    collection,
    addDoc,
    query,
    where,
    getDocs,
    setDoc,
    doc,
    onSnapshot,
} from "firebase/firestore";

const Database = getFirestore(App);
const SHEETS_COLLECTION = collection(Database, "Sheets");

const SheetService = {
    //-- Creates a sheet document.
    async CreateSheet(sheetData) {
        return await addDoc(SHEETS_COLLECTION, sheetData);
    },
    //-- Gets a sheet document that matches the code passed by param.
    async GetSheetByCode(code) {
        let sheet;
        const q = query(SHEETS_COLLECTION, where("code", "==", code));
        const querySnapshot = await getDocs(q);
        querySnapshot.forEach((document) => {
            sheet = document.data();
        });
        return sheet;
    },
    //-- Updates a sheet document that matches the code in sheetData.
    async UpdateSheet(sheetData) {
        const q = query(SHEETS_COLLECTION, where("code", "==", sheetData.code));
        const querySnapshot = await getDocs(q);
        let docRef = null;
        querySnapshot.forEach((document) => {
            docRef = doc(Database, SHEETS_COLLECTION.path, document.id);
        });
        if (docRef) {
            await setDoc(docRef, sheetData);
        }
    },
    //-- Executes "callback" everytime the sheet changes and returns the initial state of the sheet.
    async SubscribeToSheet(callback, code) {
        let docRef, sheet;
        const q = query(SHEETS_COLLECTION, where("code", "==", code));
        const querySnapshot = await getDocs(q);
        querySnapshot.forEach((document) => {
            docRef = doc(Database, SHEETS_COLLECTION.path, document.id);
            sheet = document.data();
        });
        onSnapshot(docRef, (document) => {
            callback(document.data());
        });
        return sheet;
    },
};

export default SheetService;
