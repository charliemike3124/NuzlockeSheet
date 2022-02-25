const BASE_URL = "https://pokeapi.co/api/v2";
const routes = {
    getPokemonList: "pokemon/?limit=2000&offset=0",
    getPokemonData: "pokemon",
};
/* Gets the complete list of pokemon names*/
async function GetPokemonListAsync() {
    const response = await (await fetch(`${BASE_URL}/${routes.getPokemonList}`)).json();
    const list = !!response ? response.results : null;
    return list;
}

/* Gets detailed data of a specific pokemon */
async function GetPokemonDataAsync(pokemon) {
    const response = await (await fetch(`${BASE_URL}/${routes.getPokemonData}/${pokemon}`)).json();
    const data = !!response ? response : null;
    return data;
}

export default {
    GetPokemonListAsync,
    GetPokemonDataAsync,
};
