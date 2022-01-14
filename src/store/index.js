import Vue from 'vue'
import Vuex from 'vuex'
import VuexPersist from "vuex-persist";
import {
  nuzlocke,
} from "./modules";


const vuexLocalStorage = new VuexPersist({
  storage: window.localStorage,
  reducer: (state) => ({
  }),
});

Vue.use(Vuex)

export default new Vuex.Store({  
  plugins: [vuexLocalStorage.plugin],
  modules: {
    nuzlocke
  }
})
