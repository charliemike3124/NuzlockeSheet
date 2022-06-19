<template>
    <v-card>
        <v-simple-table fixed-header height="300px">
            <template v-slot:default>
                <thead>
                    <tr>
                        <th class="text-left">Title</th>
                        <th class="text-left">Pokémon Game</th>
                        <th class="text-left">URL</th>
                        <th class="text-left">Created at</th>
                        <th class="text-left"></th>
                    </tr>
                </thead>
                <tbody>
                    <tr
                        v-for="(sheet, index) in userPreference.savedSheets"
                        :key="index"
                        :class="rowIndexesToDelete.includes(index) ? 'grey lighten-2' : ''"
                    >
                        <td>
                            {{ sheet.title }}
                        </td>
                        <td>{{ sheet.pokemonGame }}</td>
                        <td>
                            <a :href="sheet.sheetUrl">{{ sheet.sheetUrl }}</a>
                        </td>
                        <td>
                            {{
                                GeneralHelpers.formatDate(
                                    sheet.createdAt.toDate(),
                                    "YYYY/MM/DD HH:mm"
                                )
                            }}
                        </td>

                        <td>
                            <CVTooltip :text="'Remove'">
                                <v-btn
                                    icon
                                    @click="addToSheetsToDelete(index, sheet.sheetUrl)"
                                    :disabled="rowIndexesToDelete.includes(index)"
                                >
                                    <v-icon>mdi-delete</v-icon>
                                </v-btn>
                            </CVTooltip>
                            <CVTooltip :text="'Undo'">
                                <v-btn
                                    icon
                                    @click="removeFromSheetsToDelete(sheet.sheetUrl)"
                                    :disabled="!rowIndexesToDelete.includes(index)"
                                >
                                    <v-icon>mdi-undo</v-icon>
                                </v-btn>
                            </CVTooltip>
                        </td>
                    </tr>
                </tbody>
            </template>
        </v-simple-table>
        <v-card-actions>
            <v-spacer></v-spacer>
            <v-btn @click="$emit('closeDialog')">Close</v-btn>
            <v-btn
                @click="$refs.confirmationModal.show()"
                color="primary"
                :disabled="!rowIndexesToDelete.length"
            >
                Save
            </v-btn>
        </v-card-actions>
        <ConfirmationModal
            ref="confirmationModal"
            :content="'Are you sure you want to <strong> remove </strong> these sheets from your saved sheets?'"
            :action="deleteSheets"
        ></ConfirmationModal>
    </v-card>
</template>

<script>
import { mapActions, mapState } from "vuex";
import { ConfirmationModal, CVTooltip } from "../components/common";

export default {
    components: {
        ConfirmationModal,
        CVTooltip,
    },
    computed: {
        ...mapState("sheets", ["userPreference"]),
    },
    data() {
        return {
            sheetsToDelete: [],
            rowIndexesToDelete: [],
        };
    },
    methods: {
        ...mapActions("sheets", ["deleteSavedSheets"]),

        addToSheetsToDelete(rowIndex, sheetUrl) {
            this.rowIndexesToDelete.push(rowIndex);
            this.sheetsToDelete.push(sheetUrl);
        },

        removeFromSheetsToDelete(sheetUrl) {
            const index = this.sheetsToDelete.indexOf(sheetUrl);
            this.sheetsToDelete.splice(index, 1);
            this.rowIndexesToDelete.splice(index, 1);
        },

        deleteSheets() {
            this.deleteSavedSheets([this.userPreference.userId, this.sheetsToDelete]);
        },
    },
};
</script>

<style></style>
