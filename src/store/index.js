import Vue from "vue";
import Vuex from "vuex";
import { nuzlocke, pokemon, sheets, common } from "./modules";

Vue.use(Vuex);

export default new Vuex.Store({
    modules: {
        nuzlocke,
        pokemon,
        sheets,
        common,
    },
});
