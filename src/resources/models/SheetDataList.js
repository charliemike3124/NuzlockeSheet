export default function SheetDataList(
    title = "",
    players = [],
    playerEmails = [],
    pokemonGame = "",
    sheetData = {
        headers: [],
        rows: [],
    },
    isPrivate = false
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
