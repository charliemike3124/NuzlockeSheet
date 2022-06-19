<template>
    <v-app>
        <router-view />
        <GlobalSnackbar/>
    </v-app>
</template>

<script>
import { GlobalSnackbar } from "@/components/common";
export default {
    name: "App",
    components: {
        GlobalSnackbar
    }
};
</script>
