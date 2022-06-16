<template>
    <v-dialog v-model="showConfirmationModal" width="300">
        <v-card>
            <v-card-title class="text-h5">{{ title }}</v-card-title>

            <v-card-text class="mt-2">{{ content }}</v-card-text>

            <v-divider></v-divider>

            <v-card-actions>
                <v-btn @click="showConfirmationModal = false">Close</v-btn>
                <v-spacer></v-spacer>
                <v-btn @click="callAction" color="primary">Confirm</v-btn>
            </v-card-actions>
        </v-card>
    </v-dialog>
</template>

<script>
export default {
    name: "ConfirmationModal",
    props: {
        title: String,
        content: String,
        action: Function,
    },

    data() {
        return {
            showConfirmationModal: false,
        };
    },

    methods: {
        callAction() {
            this.action();
            this.showConfirmationModal = false;
        },
    },
};
</script>

<style></style>
