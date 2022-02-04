import { App } from "@/firebase.config";
import { logEvent, getAnalytics } from "firebase/analytics";

const analytics = getAnalytics(App);

function LogCustomEvent(eventName, params) {
    logEvent(analytics, eventName, params);
}

export default {
    LogCustomEvent,
};
