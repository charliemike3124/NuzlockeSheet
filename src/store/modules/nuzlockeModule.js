import { MutationsHelper } from "@/store/helper";
import { PokemonGens } from "@/resources";
import Database from "@/services/FirebaseDatabase";
import FirebaseAuth from "@/services/FirebaseAuth";

const state = {
    sheetData: {
        headers: [],
        rows: [],
    },
    sheetDataList: {
        title: "",
        players: [],
        dataSheets: [],
        code: null,
    },
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
    SetPlayers({ commit, state, dispatch }, players) {
        //Add player props to every sheet's header in the list.
        let sheetDataList = state.sheetDataList;
        sheetDataList.dataSheets[state.selectedSheet] = state.sheetData;
        sheetDataList.players = players;
        sheetDataList.dataSheets.map((sheet) => {
            const locationHeader = sheet.headers[0];
            const nonPlayerHeaders = sheet.headers
                .splice(1)
                .filter((item) => !item.isPlayer);
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
            });

            let headers = [
                locationHeader,
                ...playerHeaders,
                ...nonPlayerHeaders,
            ];

            sheet.headers = headers;
        });

        dispatch("SetSheetData", sheetDataList.dataSheets[state.selectedSheet]);
        commit("setSheetDataList", sheetDataList);
    },
    SetSheetGame({ commit, state, dispatch }, game) {
        commit("setSheetGame", game);
        const index = PokemonGens.names.indexOf(game);
        localStorage.setItem(storageKeys.selectedSheet, index);
        commit("setSelectedSheet", game);

        let sheetDataList = state.sheetDataList;
        sheetDataList.dataSheets[state.selectedSheet] = state.sheetData;

        let selectedSheetData = state.sheetDataList.dataSheets[index];

        dispatch("SetSheetData", selectedSheetData);
        commit("setSelectedSheet", sheetDataList);
    },
    GetSelectedSheet({ commit }) {
        const data = localStorage.getItem(storageKeys.selectedSheet);
        const selectedSheet = data ? JSON.parse(data) : 0;
        commit("setSelectedSheet", selectedSheet);
    },

    SetSheetData({ commit }, sheetData) {
        commit("setSheetData", sheetData);
    },
    SaveSheetData({ state, commit }) {
        //TODO- save to firebase as well
        let sheetDataList = state.sheetDataList;
        sheetDataList.dataSheets[state.selectedSheet] = state.sheetData;
        Database.UpdateSheet(sheetDataList);
        localStorage.setItem(
            storageKeys.sheetDataList,
            JSON.stringify(sheetDataList)
        );
        commit("setSheetDataList", sheetDataList);
    },
    RemoveSheetDataItem({ dispatch, state }, item) {
        //remove row from sheetData
        let result = state.sheetData;
        const index = result.rows.indexOf(item);
        if (index > -1) {
            result.rows.splice(index, 1);
        }
        dispatch("SetSheetData", result);
    },
    AddCustomRow({ state, dispatch }, selectedRow) {
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

        dispatch("SetSheetData", result);
    },
    InitializeSheetDataList({ commit, dispatch }, [title, players, code]) {
        const defaultSelectedSheetIndex = 0;
        let sheetDataList = {
            title: title,
            selectedSheet: defaultSelectedSheetIndex,
            players: players,
            dataSheets: [],
            code: code,
        };
        let playerHeaders = [];
        players.forEach((player) => {
            playerHeaders.push({
                text: player.name,
                value: player.name,
                sortable: false,
                isPlayer: true,
            });
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

        commit("setSheetDataList", sheetDataList);
        dispatch(
            "SetSheetData",
            sheetDataList.dataSheets[defaultSelectedSheetIndex]
        );
        dispatch("SaveSheetData", sheetDataList);
        dispatch(
            "sheets/AddOrRemoveSavedSheet",
            { code: sheetDataList.code, title: sheetDataList.title },
            { root: true }
        );
    },
    async JoinSheet({ commit, dispatch, state, rootState }, code) {
        let sheetDataList;
        if (!!rootState.sheets.currentUser) {
            //Subscribe to any changes done to the sheet document in firebase.
            sheetDataList = await Database.SubscribeToSheet(
                (dbSheetDataList) => {
                    if (dbSheetDataList) {
                        commit("setSheetDataList", dbSheetDataList);
                        dispatch(
                            "SetSheetData",
                            dbSheetDataList.dataSheets[state.selectedSheet]
                        );
                    }
                },
                code
            );
        } else {
            //Get the sheet data without subscribing to live changes.
            sheetDataList = await Database.GetSheetByCode(code);
            commit("setSheetDataList", sheetDataList);
            dispatch(
                "SetSheetData",
                sheetDataList.dataSheets[state.selectedSheet]
            );
        }
        dispatch(
            "sheets/AddOrRemoveSavedSheet",
            {
                code: sheetDataList.code,
                title: sheetDataList.title,
            },
            { root: true }
        );
        return !!sheetDataList;
    },
    ResetCurrentSheet({ state, dispatch }) {
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
        dispatch("SetSheetData", sheetData);
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
