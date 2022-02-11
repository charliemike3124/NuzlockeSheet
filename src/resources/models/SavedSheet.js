export default function SavedSheet(code = null, title = null) {
    return {
        code: code,
        title: title,
        sheetUrl: `localhost:8080/#/${code}`,
    };
}
