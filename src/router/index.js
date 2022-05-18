import Vue from "vue";
import VueRouter from "vue-router";
import Home from "../views/Home.vue";
import Sheet from "../views/Sheet.vue";

Vue.use(VueRouter);

const routes = [
    {
        path: "/",
        name: "Home",
        component: Home,
    },
    {
        path: "/Sheet/:code",
        name: "Sheet",
        component: Sheet,
    },
];

const router = new VueRouter({
    mode: 'history',
    routes,
});

export default router;
