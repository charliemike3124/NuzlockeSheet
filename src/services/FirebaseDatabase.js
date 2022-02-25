import { App } from "@/firebase.config";
import {
    getFirestore,
    collection,
    addDoc,
    getDoc,
    setDoc,
    doc,
    onSnapshot,
    serverTimestamp,
} from "firebase/firestore";

const Database = getFirestore(App);
const SHEETS_COLLECTION = collection(Database, "Sheets");
let unsubscribeFromSheet = null;

const SheetService = {
    //-- Creates a sheet document and returns its id.
    async CreateSheet(sheetData) {
        sheetData.createdAt = serverTimestamp();
        sheetData.updatedAt = serverTimestamp();
        const doc = await addDoc(SHEETS_COLLECTION, sheetData);
        return doc.id;
    },
    //-- Gets a sheet document that matches the code passed by param.
    async GetSheetByDocumentId(documentId) {
        const docRef = doc(SHEETS_COLLECTION, documentId);
        const document = await getDoc(docRef);
        return document.exists() ? document.data() : null;
    },
    //-- Updates a sheet document that matches the code in sheetData.
    async UpdateSheet(sheetData, documentId) {
        const docRef = doc(SHEETS_COLLECTION, documentId);
        const document = await getDoc(docRef);
        if (document.exists()) {
            sheetData.updatedAt = serverTimestamp();
            await setDoc(docRef, sheetData);
        }
    },
    //-- Executes "callback" everytime the sheet changes and returns the initial state of the sheet if it exists.
    async SubscribeToSheet(callback, documentId) {
        const docRef = doc(SHEETS_COLLECTION, documentId);
        const document = await getDoc(docRef);
        if (document.exists()) {
            unsubscribeFromSheet = onSnapshot(docRef, (document) => {
                callback(document.data());
            });
        }
        return document.exists() ? document.data() : null;
    },
    //-- Unsubscribe from sheet
    async UnsubscribeFromSheet() {
        if (!!unsubscribeFromSheet) {
            unsubscribeFromSheet();
        }
    },
};

export default SheetService;
