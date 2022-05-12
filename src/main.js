import Vue from "vue";
import App from "./App.vue";
import router from "./router";
import store from "./store";
import vuetify from "./plugins/vuetify";
import AOS from "./plugins/AOS";
import GeneralHelpers from "@/mixins/generalHelpers";

import "./styles/global/baseStyles.less";
import "./styles/global/globalVuetify.less";
import "aos/dist/aos.css";

Vue.config.productionTip = false;
Vue.mixin(GeneralHelpers);

new Vue({
    router,
    store,
    vuetify,
    AOS,
    render: (h) => h(App),
}).$mount("#app");
