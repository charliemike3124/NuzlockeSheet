export default function SavedSheet(code = "", title = "", pokemonGame = "") {
    return {
        code: code,
        title: title,
        pokemonGame,
        sheetUrl: `localhost:8080/${code}`,
    };
}
