<template>
    <div>
        <v-simple-table fixed-header height="300px">
            <template v-slot:default>
                <thead>
                    <tr>
                        <th class="text-left">Title</th>
                        <th class="text-left">Pokemon Game Mode</th>
                        <th class="text-left">URL</th>
                        <th class="text-left">Created at</th>
                        <th class="text-left"></th>
                        <v-btn
                            depressed
                            color="primary"
                            small
                            @click="$emit('closeDialog')"
                            class="mt-2"
                        >
                            Close
                        </v-btn>
                    </tr>
                </thead>
                <tbody>
                    <tr v-for="(sheet, index) in userPreference.savedSheets" :key="index">
                        <td>
                            {{ sheet.title }}
                        </td>
                        <td>{{ sheet.pokemonGame }}</td>
                        <td>
                            <a :href="sheet.sheetUrl">{{ sheet.sheetUrl }}</a>
                        </td>
                        <td>
                            {{ GeneralHelpers.formatDate(sheet.createdAt.toDate(), "YYYY/MM/DD") }}
                        </td>

                        <td>
                            <v-btn icon @click="confirmDeleteSheet(sheet.sheetUrl)">
                                <v-icon>mdi-delete</v-icon>
                            </v-btn>
                        </td>
                    </tr>
                </tbody>
            </template>
        </v-simple-table>
        <ConfirmationModal
            ref="confirmationModal"
            :title="'Confirmation'"
            :content="'are you sure you want to delete this sheet?'"
            :action="deleteSheet"
        ></ConfirmationModal>
    </div>
</template>

<script>
import { mapActions, mapState } from "vuex";
import { ConfirmationModal } from "../components/common";

export default {
    components: {
        ConfirmationModal,
    },
    computed: {
        ...mapState("sheets", ["userPreference"]),
    },
    data() {
        return {
            selectedSheetUrl: "",
        };
    },
    methods: {
        ...mapActions("sheets", ["deleteSavedSheet"]),
        confirmDeleteSheet(sheetUrl) {
            this.$refs.confirmationModal.showConfirmationModal = true;
            this.selectedSheetUrl = sheetUrl;
        },
        deleteSheet() {
            this.deleteSavedSheet([this.userPreference.userId, this.selectedSheetUrl]);
        },
    },
};
</script>

<style></style>
