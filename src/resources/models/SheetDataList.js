export default function SheetDataList(
    title = "",
    players = [],
    playerEmails = [],
    dataSheets = [],
    isPrivate = false
) {
    return {
        title: title,
        players: players,
        playerEmails: playerEmails,
        dataSheets: dataSheets,
        isPrivate: isPrivate,
    };
}
