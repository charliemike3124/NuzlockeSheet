export default function SavedSheet(code = "", title = "", pokemonGame = "") {
    return {
        code: code,
        title: title,
        pokemonGame,
        //add created at
        createdAt: new Date(),
        sheetUrl: `https://nuzlockesheets.com/Sheet/${code}`,
    };
}
