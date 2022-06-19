export default function SheetDataList(
    title = "",
    players = [],
    playerEmails = [],
    pokemonGame = "",
    sheetData = {
        headers: [],
        rows: [],
    },
    isPrivate = true
) {
    return {
        title: title,
        players: players,
        playerEmails: playerEmails,
        pokemonGame: pokemonGame,
        sheetData: sheetData,
        isPrivate: isPrivate,
    };
}
