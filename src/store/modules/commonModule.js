import { MutationsHelper } from "@/store/helper";

const state = {
    snackbar: { show: false, content: "" },
};

const mutations = {
    SetShowSnackbar: MutationsHelper.set("snackbar"),
};

const actions = {};

export default {
    namespaced: true,
    state,
    mutations,
    actions,
};
