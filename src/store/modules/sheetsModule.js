import { MutationsHelper } from "@/store/helper";

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
        localStorage.setItem(storageKeys.savedSheets, JSON.stringify(state.savedSheets));
    },
    LoadSavedSheets({ commit }) {
        const data = localStorage.getItem(storageKeys.savedSheets);
        let savedSheets = data != "undefined" || !data ? JSON.parse(data) : null;
        commit("setSavedSheet", savedSheets);
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
