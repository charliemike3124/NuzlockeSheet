import dayjs from "dayjs";

export default {
    callMethodByName(name, params = null) {
        if (params) {
            this[name](...params);
        } else {
            this[name]();
        }
    },

    requireImage(path) {
        let src = "";
        try {
            src = require("@/assets/" + path);
        } catch (err) {
            console.log(`Image not able to load - ${path}`);
        }
        return src;
    },

    deepCopy(object) {
        return JSON.parse(JSON.stringify(object));
    },

    getBulbapediaBaseUrl() {
        return "https://bulbapedia.bulbagarden.net/wiki";
    },

    formatDate(date, format) {
        return dayjs(date).format(format);
    },
};
