import { MutationsHelper } from "@/store/helper";
import PokemonService from "@/services/pokemonService";

const state = {
    pokemonList: [],
};

const mutations = {
    setPokemonList: MutationsHelper.set("pokemonList"),
};

const actions = {
    async SetPokemonListAsync({ commit }) {
        const data = localStorage.getItem(storageKeys.pokemonList);
        let list = data != "undefined" || !data ? JSON.parse(data) : null;
        if (!list) {
            list = await PokemonService.GetPokemonListAsync();
            list = list.map((pokemon) => {
                return {
                    name: pokemon.name,
                    types: [],
                    id: null,
                    sprite: "",
                    stats: [],
                };
            });
            localStorage.setItem(storageKeys.pokemonList, JSON.stringify(list));
        }
        commit("setPokemonList", list);
    },
    async UpdatePokemonListByNameAsync({ commit, state }, name) {
        let pokemonList = state.pokemonList;
        const index = pokemonList.indexOf(
            pokemonList.find((p) => p.name === name)
        );
        if (!pokemonList[index].id) {
            // If pokemon list does not have the api data, call api and add it to the list.
            const pokemon = await PokemonService.GetPokemonDataAsync(name);
            pokemonList[index].types = pokemon.types;
            pokemonList[index].id = pokemon.id;
            pokemonList[index].sprite = pokemon.sprites.front_default || "";
            pokemonList[index].stats = pokemon.stats;
            commit("setPokemonList", pokemonList);
            localStorage.setItem(
                storageKeys.pokemonList,
                JSON.stringify(pokemonList)
            );
        }
        return pokemonList[index];
    },
    async GetPokemonDataAsync({ commit }, name) {
        const data = await PokemonService.GetPokemonDataAsync(name);
        return data;
    },
};

//-- Not Exported --//
const storageKeys = {
    pokemonList: "pokemonList",
};
//-----------------//
export default {
    namespaced: true,
    state,
    mutations,
    actions,
};
