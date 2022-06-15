import { MutationsHelper } from "@/store/helper";

const state = {
    savedSheets: [],
    currentUser: null,
    currentDocumentId: null,
};

const mutations = {
    addOrRemoveSavedSheet: MutationsHelper.addOrRemove("savedSheets"),
    setSavedSheet: MutationsHelper.set("savedSheets"),
    setCurrentUser: MutationsHelper.set("currentUser"),
    setCurrentDocumentId: MutationsHelper.set("currentDocumentId"),
};

const actions = {
    AddOrRemoveSavedSheet({ commit, state }, sheetMetaData) {
        commit("addOrRemoveSavedSheet", sheetMetaData);
        localStorage.setItem(storageKeys.savedSheets, JSON.stringify(state.savedSheets));
        //agregar en firebase
    },
    LoadSavedSheets({ commit }) {
        const data = localStorage.getItem(storageKeys.savedSheets);
        let savedSheets = data != "undefined" || !data ? JSON.parse(data) : null;
        commit("setSavedSheet", savedSheets);
        // traerse de firebase
    },
    SetCurrentUser({ commit }, user) {
        commit("setCurrentUser", user);
    },
    SetCurrentDocumentId({ commit }, documentId) {
        commit("setCurrentDocumentId", documentId);
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
