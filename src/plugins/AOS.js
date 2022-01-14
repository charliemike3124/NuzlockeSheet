import AOS from "aos";
import Vue from 'vue';

Vue.use(AOS);

 export default new AOS.init({ 
    disable: "phone",
    duration: 1200,
});