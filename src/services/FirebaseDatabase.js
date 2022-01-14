import Firebase from '@/firebase.config';
const SHEETS = Firebase.Database.collection('Sheets');

const SheetService = {
    CreateLobby(code, sheetData){
        return SHEETS.doc(code).set(sheetData);
    },
    async GetLobby(code){
        const sheet = await SHEETS.doc(code).get();
        return sheet.exists ? sheet.data() : null;
    },
    UpdateLobby(code, sheetData){
        return SHEETS.doc(code).update(sheetData);
    },
    DeleteLobby(code){
        return SHEETS.doc(code).delete();
    },
};

export default SheetService;