<template>
    <div>
        <v-simple-table fixed-header height="300px">
            <template v-slot:default>
                <thead>
                    <tr>
                        <th class="text-left">Title</th>
                        <th class="text-left">Pokemon Game Mode</th>
                        <th class="text-left">URL</th>
                        <th class="text-left">
                            <v-btn depressed color="primary" small @click="$emit('closeDialog')">
                                Close
                            </v-btn>
                        </th>
                    </tr>
                </thead>
                <tbody>
                    <tr v-for="(sheet, index) in userPreference.savedSheets" :key="index">
                        <td>{{ sheet.title }}</td>
                        <td>{{ sheet.pokemonGame }}</td>
                        <td>
                            <a :href="sheet.sheetUrl">{{ sheet.sheetUrl }}</a>
                        </td>
                    </tr>
                </tbody>
            </template>
        </v-simple-table>
    </div>
</template>

<script>
import { mapState } from "vuex";
export default {
    computed: {
        ...mapState("sheets", ["userPreference"]),
    },
};
</script>

<style></style>
