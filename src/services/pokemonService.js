const BASE_URL = "https://pokeapi.co/api/v2"
const routes = {
    getPokemonList: "pokemon/?limit=2000&offset=0",
    getPokemonData: "pokemon",
}

async function GetPokemonListAsync() {
    const response = await (
        await fetch(`${BASE_URL}/${routes.getPokemonList}`)
    ).json()
    const list = !!response ? response.results : null
    return list
}

async function GetPokemonDataAsync(pokemon) {
    const response = await (
        await fetch(`${BASE_URL}/${routes.getPokemonData}/${pokemon}`)
    ).json()
    const data = !!response ? response : null
    return data
}

export default {
    GetPokemonListAsync,
    GetPokemonDataAsync,
}
