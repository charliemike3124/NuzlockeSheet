import { MutationsHelper } from "@/store/helper";
import Database from "@/services/FirebaseDatabase";

const state = {
    savedSheets: [],
    currentUser: null,
};

const mutations = {
    addOrRemoveSavedSheet: MutationsHelper.addOrRemove("savedSheets"),
    setSavedSheet: MutationsHelper.set("savedSheets"),
    setCurrentUser: MutationsHelper.set("currentUser"),
};

const actions = {
    AddOrRemoveSavedSheet({ commit, state }, sheetMetaData) {
        commit("addOrRemoveSavedSheet", sheetMetaData);
        localStorage.setItem(
            storageKeys.savedSheets,
            JSON.stringify(state.savedSheets)
        );
    },
    LoadSavedSheets({ commit }) {
        const data = localStorage.getItem(storageKeys.pokemonList);
        let savedSheets =
            data != "undefined" || !data ? JSON.parse(data) : null;
        commit("setSavedSheet", savedSheets);
    },
    async CreateSheetOnDatabase({ rootState }) {
        await Database.CreateSheet(rootState.nuzlocke.sheetDataList);
    },
    SetCurrentUser({ commit }, user) {
        commit("setCurrentUser", user);
    },
};

//-- Not Exported --//
const storageKeys = {
    savedSheets: "savedSheets",
};
//-----------------//
export default {
    namespaced: true,
    state,
    mutations,
    actions,
};
