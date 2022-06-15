export default function SavedSheet(code = "", title = "", pokemonGame = "") {
    return {
        code: code,
        title: title,
        pokemonGame,
        sheetUrl: `https://nuzlockesheets.com/Sheet/${code}`,
    };
}
