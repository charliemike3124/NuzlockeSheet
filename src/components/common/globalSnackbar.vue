<template>
    <v-snackbar v-model="snackbar.show">
        <span v-html="snackbar.content" />
        <template v-slot:action="{ attrs }">
            <v-btn
                color="white"
                text
                v-bind="attrs"
                @click="SetShowSnackbar({ show: false, content: snackbar.content })"
            >
                Close
            </v-btn>
        </template>
    </v-snackbar>
</template>

<script>
import { mapMutations, mapState } from "vuex";
export default {
    name: "GlobalSnackbar",
    computed: {
        ...mapState("common", ["snackbar"]),
    },
    methods: {
        ...mapMutations("common", ["SetShowSnackbar"]),
    },
};
</script>

<style></style>
