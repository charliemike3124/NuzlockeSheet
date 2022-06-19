export default function SavedSheet(code = "", title = "", pokemonGame = "") {
    return {
        code: code,
        title: title,
        pokemonGame,
        createdAt: new Date(),
        sheetUrl: `https://nuzlockesheets.com/Sheet/${code}`,
    };
}
