import { MutationsHelper } from "@/store/helper";

const state = {
    headers: {},
    rows: {},
    players: [],    
}

const mutations = {
    setHeaders: MutationsHelper.set("headers"),
    setRows: MutationsHelper.set("rows"),
    setPlayers: MutationsHelper.set("players"),
}

const actions = {
    SetHeaders( {commit}, headers){
        commit("setHeaders", headers);
    },
    SetRows( {commit}, rows){
        commit("setRows", rows);
    },
    SetPlayers( {commit, state, dispatch}, players){
        let updatedHeaders = [
            state.headers[0],            
        ]
        players.forEach(player => {
            updatedHeaders.push(player); //player must have {text, value} properties.
        });
        updatedHeaders.push(state.headers[state.headers.length - 1]);
        
        dispatch("SetHeaders", updatedHeaders);
        commit("setPlayers", players);
    },
}

export default {
    namespaced: true,
    state,
    mutations,
    actions,
}