export default {
    methods: {
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
    },
};
