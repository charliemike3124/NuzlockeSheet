import { MutationsHelper } from "@/store/helper";
import { PokemonGens, Constants } from "../../resources/constants";
import Database from "@/services/FirebaseDatabase";
import { SavedSheet, SheetDataList } from "../../resources/models";

const state = {
    sheetDataList: SheetDataList(),
    isCurrentPlayerInvited: true,
};

const mutations = {
    setSheetData: MutationsHelper.set("sheetData"),
    setSheetDataList: MutationsHelper.set("sheetDataList"),
    setIsCurrentPlayerInvited: MutationsHelper.set("isCurrentPlayerInvited"),
};

const actions = {
    /* Updates current sheet */
    SetSheetData({ commit, rootState, state }, [sheetData, documentId = null]) {
        if (documentId) {
            if (!!rootState.sheets.currentUser?.uid) {
                //-- user is signed in
                let sheetDataList = state.sheetDataList;
                sheetDataList.sheetData = sheetData;
                Database.UpdateSheet(sheetDataList, documentId);
                commit("setSheetDataList", sheetDataList);
            } else {
                //-- TODO: handle logged off save.
            }
        }
    },

    /* Updates sheet's allowed players */
    SetPlayers({ commit, state, dispatch, rootState }, players) {
        //Add player props to every sheet's header in the list.
        let sheetDataList = state.sheetDataList;
        sheetDataList.players = players;
        const locationHeader = sheetDataList.sheetData.headers[0];
        const nonPlayerHeaders = sheetDataList.sheetData.headers
            .splice(1)
            .filter((item) => !item.isPlayer);
        let playerHeaders = [];

        players.forEach((player) => {
            //If a player's name or email was editted, make the property change in the rows of all the sheets.
            if (player.hasOwnProperty("previousName")) {
                sheetDataList.sheetData.rows.forEach((row) => {
                    row[player.name] = row[player.previousName];
                    delete row[player.previousName];
                });
                delete player.previousName;
            }
            if (player.hasOwnProperty("previousEmail")) {
                const emailIndex = sheetDataList.playerEmails.indexOf(player.previousEmail);
                sheetDataList.playerEmails.splice(emailIndex, 1);
                delete player.previousEmail;
            }
            playerHeaders.push({
                text: player.name,
                value: player.name,
                sortable: false,
                isPlayer: true,
            });
            if (!sheetDataList.playerEmails.includes(player.email)) {
                sheetDataList.playerEmails.push(player.email);
            }
        });

        let headers = [locationHeader, ...playerHeaders, ...nonPlayerHeaders];

        sheetDataList.sheetData.headers = headers;

        dispatch("SetSheetData", [sheetDataList.sheetData, rootState.sheets.currentDocumentId]);
    },

    /* Removes a specific row from the selected sheet */
    RemoveSheetDataItem({ dispatch, state, rootState }, item) {
        //remove row from sheetData
        let result = state.sheetDataList.sheetData;
        const index = result.rows.indexOf(item);
        if (index > -1) {
            result.rows.splice(index, 1);
        }
        dispatch("SetSheetData", [result, rootState.sheets.currentDocumentId]);
    },

    /* Adds an empty row below the given index row */
    AddCustomRow({ state, dispatch, rootState }, selectedRow) {
        //Add properties according to which players exist.
        let result = state.sheetDataList.sheetData;
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
    async InitializeSheetDataList({ commit, dispatch }, [title, players, pokemonGame]) {
        let sheetDataList = SheetDataList(title, players, [], pokemonGame);
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

        sheetDataList.sheetData = {
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
        };
        const genIndex = PokemonGens.names.indexOf(pokemonGame);
        PokemonGens.routes[genIndex].forEach((routeName) => {
            sheetDataList.sheetData.rows.push({
                location: {
                    name: routeName,
                    isCustom: false,
                },
                actions: "",
            });
        });

        commit("setSheetDataList", sheetDataList);
        const documentId = await Database.CreateSheet(sheetDataList);
        dispatch(
            "sheets/AddOrRemoveSavedSheet",
            SavedSheet(documentId, sheetDataList.title, pokemonGame),
            {
                root: true,
            }
        );
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
                }
            }, documentId);
        } else {
            // Tell the user he has no access to this sheet.
            return Constants.JOIN_SHEET_ERRORS.NO_ACCESS;
        }

        if (sheetDataList) {
            //Save to local storage for user preference
            dispatch(
                "sheets/AddOrRemoveSavedSheet",
                SavedSheet(documentId, sheetDataList.title, sheetDataList.pokemonGame),
                {
                    root: true,
                }
            );
        }

        commit("setSheetDataList", sheetDataList);
        dispatch("SetSheetData", [sheetDataList.sheetData, documentId]);
        return !!sheetDataList ? true : Constants.JOIN_SHEET_ERRORS.DOES_NOT_EXIST;
    },

    /* Resets the selected sheet to its initial state */
    ResetCurrentSheet({ state, dispatch, rootState }) {
        let sheetData = state.sheetDataList.sheetData;
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

    SetIsCurrentPlayerInvited({ commit }, value) {
        commit("setIsCurrentPlayerInvited", value);
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
