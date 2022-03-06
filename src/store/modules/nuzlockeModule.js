import { MutationsHelper } from "@/store/helper";
import { PokemonGens, Constants } from "../../resources/constants";
import Database from "@/services/FirebaseDatabase";
import { SavedSheet, SheetDataList } from "../../resources/models";

const state = {
    sheetData: {
        headers: [],
        rows: [],
    },
    sheetDataList: SheetDataList(),
    selectedGame: "",
    selectedSheet: 0,
};

const mutations = {
    setSheetData: MutationsHelper.set("sheetData"),
    setSheetDataList: MutationsHelper.set("sheetDataList"),
    setSheetGame: MutationsHelper.set("selectedGame"),
    setSelectedSheet: MutationsHelper.set("selectedSheet"),
};

const actions = {
    /* Updates current sheet */
    SetSheetData({ commit, dispatch }, [sheetData, documentId = null]) {
        commit("setSheetData", sheetData);
        if (documentId) {
            //-- Updates Firebase as well.
            dispatch("SaveSheetData", documentId);
        }
    },

    /* Updates current sheet in Firebase and localstorage */
    SaveSheetData({ state, commit, rootState }, documentId) {
        if (!!rootState.sheets.currentUser?.uid) {
            //-- user is signed in
            let sheetDataList = state.sheetDataList;
            sheetDataList.dataSheets[state.selectedSheet] = state.sheetData;
            Database.UpdateSheet(sheetDataList, documentId);
            localStorage.setItem(storageKeys.sheetDataList, JSON.stringify(sheetDataList));
            commit("setSheetDataList", sheetDataList);
        } else {
        }
    },

    /* Updates sheet's allowed players */
    SetPlayers({ commit, state, dispatch, rootState }, players) {
        //Add player props to every sheet's header in the list.
        let sheetDataList = state.sheetDataList;
        sheetDataList.dataSheets[state.selectedSheet] = state.sheetData;
        sheetDataList.players = players;
        sheetDataList.dataSheets.map((sheet) => {
            const locationHeader = sheet.headers[0];
            const nonPlayerHeaders = sheet.headers.splice(1).filter((item) => !item.isPlayer);
            let playerHeaders = [];

            players.forEach((player) => {
                //If a player's name was editted, make the property name change in the rows of all the sheets.
                if (player.hasOwnProperty("previousName")) {
                    sheet.rows.forEach((row) => {
                        row[player.name] = row[player.previousName];
                        delete row[player.previousName];
                    });
                    delete player.previousName;
                }
                playerHeaders.push({
                    text: player.name,
                    value: player.name,
                    sortable: true,
                    isPlayer: true,
                });
                sheetDataList.playerEmails.push(player.email);
            });

            let headers = [locationHeader, ...playerHeaders, ...nonPlayerHeaders];

            sheet.headers = headers;
        });

        dispatch("SetSheetData", [sheetDataList.dataSheets[state.selectedSheet]]);
        commit("setSheetDataList", sheetDataList);
        dispatch("SaveSheetData", rootState.sheets.currentDocumentId);
    },

    /* Sets the currently selected game (Changes current sheet view) */
    SetSheetGame({ commit, state, dispatch }, game) {
        commit("setSheetGame", game);
        const index = PokemonGens.names.indexOf(game);
        localStorage.setItem(storageKeys.selectedSheet, index);
        commit("setSelectedSheet", game);

        let sheetDataList = state.sheetDataList;
        sheetDataList.dataSheets[state.selectedSheet] = state.sheetData;

        let selectedSheetData = state.sheetDataList.dataSheets[index];

        dispatch("SetSheetData", [selectedSheetData]);
        commit("setSelectedSheet", sheetDataList);
    },

    /* Returns the last selected sheet */
    GetSelectedSheet({ commit }) {
        const data = localStorage.getItem(storageKeys.selectedSheet);
        const selectedSheet = data ? JSON.parse(data) : 0;
        commit("setSelectedSheet", selectedSheet);
    },

    /* Removes a specific row from the selected sheet */
    RemoveSheetDataItem({ dispatch, state, rootState }, item) {
        //remove row from sheetData
        let result = state.sheetData;
        const index = result.rows.indexOf(item);
        if (index > -1) {
            result.rows.splice(index, 1);
        }
        dispatch("SetSheetData", [result, rootState.sheets.currentDocumentId]);
    },

    /* Clears pokemon from a specific row in the selected sheet */
    ClearSheetRow({ dispatch, state, rootState }, item) {
        let result = state.sheetData;
        const index = result.rows.indexOf(item);
        let clearedRow = {};
        Object.keys(result.rows[index]).map(() => {
            clearedRow = {
                location: result.rows[index].location,
                actions: result.rows[index].actions,
            };
            state.sheetDataList.players.forEach((player) => {
                clearedRow[player.name] = "";
            });
        });
        result.rows[index] = clearedRow;
        dispatch("SetSheetData", [result, rootState.sheets.currentDocumentId]);
    },

    /* Adds an empty row below the given index row */
    AddCustomRow({ state, dispatch, rootState }, selectedRow) {
        //Add properties according to which players exist.
        let result = state.sheetData;
        let row = {
            location: {
                name: "",
                isCustom: true,
            },
        };
        state.sheetDataList.players.forEach((p) => {
            row[p.name] = "";
        });
        row.actions = "";

        const insertIndex = result.rows.indexOf(selectedRow);
        if (insertIndex === result.rows.length - 1) {
            result.rows.push(row);
        } else {
            result.rows.splice(insertIndex + 1, 0, row);
        }

        dispatch("SetSheetData", [result, rootState.sheets.currentDocumentId]);
    },

    /* Initialices an empty sheet data list */
    async InitializeSheetDataList({ commit, dispatch }, [title, players]) {
        let sheetDataList = SheetDataList(title, players);
        let playerHeaders = [];
        players.forEach((player) => {
            playerHeaders.push({
                text: player.name,
                value: player.name,
                sortable: false,
                isPlayer: true,
            });
            sheetDataList.playerEmails.push(player.email);
        });

        PokemonGens.routes.forEach((routeList, index) => {
            sheetDataList.dataSheets.push({
                headers: [
                    {
                        text: "Location",
                        value: "location",
                        sortable: false,
                    },
                    ...playerHeaders,
                    {
                        text: "Actions",
                        value: "actions",
                        sortable: false,
                    },
                ],
                rows: [],
            });
            routeList.forEach((routeName) => {
                sheetDataList.dataSheets[index].rows.push({
                    location: {
                        name: routeName,
                        isCustom: false,
                    },
                    actions: "",
                });
            });
        });
        const documentId = await Database.CreateSheet(sheetDataList);

        commit("setSheetDataList", sheetDataList);
        dispatch("SetSheetData", [sheetDataList.dataSheets[0], documentId]);
        dispatch("sheets/AddOrRemoveSavedSheet", SavedSheet(documentId, sheetDataList.title), {
            root: true,
        });
        return documentId;
    },

    /* Joins and subscribe to a sheet given the Firebase documentId */
    async JoinSheet({ commit, dispatch, state, rootState }, documentId) {
        let sheetDataList;
        sheetDataList = await Database.GetSheetByDocumentId(documentId);
        const currentUserIsInvited = !!rootState.sheets.currentUser
            ? sheetDataList?.playerEmails?.includes(rootState.sheets.currentUser.email) ?? false
            : false;
        if (currentUserIsInvited || !sheetDataList?.isPrivate) {
            //Subscribe to any changes done to the sheet document in firebase.
            sheetDataList = await Database.SubscribeToSheet((dbSheetDataList) => {
                if (dbSheetDataList) {
                    commit("setSheetDataList", dbSheetDataList);
                    dispatch("SetSheetData", [dbSheetDataList.dataSheets[state.selectedSheet]]);
                }
            }, documentId);
        } else {
            // Tell the user he has no access to this sheet.
            return Constants.JOIN_SHEET_ERRORS.NO_ACCESS;
        }

        if (sheetDataList) {
            //Save to local storage for user preference
            dispatch("sheets/AddOrRemoveSavedSheet", SavedSheet(documentId, sheetDataList.title), {
                root: true,
            });
        }
        return !!sheetDataList ? true : Constants.JOIN_SHEET_ERRORS.DOES_NOT_EXIST;
    },

    /* Resets the selected sheet to its initial state */
    ResetCurrentSheet({ state, dispatch, rootState }) {
        let sheetData = state.sheetData;
        sheetData.rows = sheetData.rows.map((row) => {
            let result = {
                location: row.location,
                actions: row.actions,
            };
            state.sheetDataList.players.forEach((player) => {
                result[player.name] = "";
            });
            return result;
        });
        dispatch("SetSheetData", [sheetData, rootState.sheets.currentDocumentId]);
    },
};

//-- Not Exported --//
const storageKeys = {
    sheetDataList: "sheetDataList",
    selectedSheet: "selectedSheet",
};
//-----------------//

export default {
    namespaced: true,
    state,
    mutations,
    actions,
};
