<template>
    <v-data-table
        :headers="sheetDataList.sheetData.headers"
        :items="sheetDataList.sheetData.rows"
        :show-select="false"
        :loading="loadingData"
        :item-class="itemClass"
        dense
        item-key="name"
        class="elevation-1"
        :options="tableOptions"
    >
        <!--Header-->
        <template v-slot:top>
            <v-row class="ma-2" justify="start">
                <v-col align-self="center">
                    <v-icon>mdi-pokeball</v-icon>
                    <span class="ml-2">{{ sheetDataList.pokemonGame }}</span>
                </v-col>
                <v-col>
                    <div class="d-flex justify-end">
                        <div v-for="(action, index) in topActions" :key="index" align-self="end">
                            <CVTooltip :text="action.tooltip">
                                <v-btn
                                    icon
                                    class="mr-2"
                                    :color="action.toggleColor"
                                    :disabled="!isCurrentPlayerInvited"
                                    @click="action.eventHandler"
                                >
                                    <v-icon>{{ action.icon }}</v-icon>
                                </v-btn>
                            </CVTooltip>
                        </div>
                    </div>
                </v-col>
            </v-row>
        </template>

        <!--Location Rows-->
        <template v-slot:item.location="{ item }">
            <a
                v-if="!item.location.isCustom"
                :href="`${GeneralHelpers.getBulbapediaBaseUrl()}/${item.location.name}`"
                target="_blank"
            >
                {{ item.location.name }}
            </a>
            <span v-else>{{ item.location.name }}</span>
        </template>

        <!--Player Rows-->
        <template v-for="(prop, index) in playerHeaders" v-slot:[`item.${prop.value}`]="{ item }">
            <PokemonSelect
                @onPokemonSelect="onPokemonSelect"
                v-bind="{ item, prop }"
                :key="index"
            ></PokemonSelect>
        </template>

        <!--Action Rows-->
        <template v-slot:item.actions="{ item }">
            <CVTooltip :text="action.tooltip" v-for="(action, index) in tableActions" :key="index">
                <v-icon
                    :class="!!action.className ? action.className(item) : ''"
                    :disabled="
                        !isCurrentPlayerInvited
                            ? true
                            : !!action.disabled
                            ? action.disabled(item)
                            : false
                    "
                    small
                    @click="
                        action.actionParams
                            ? action.action(item, action.actionParams)
                            : action.action(item)
                    "
                >
                    {{ action.icon }}
                </v-icon>
            </CVTooltip>
        </template>

        <!--Displayed when there is no data-->
        <template v-slot:no-data>
            <span>Add some routes to this sheet!</span>
        </template>
    </v-data-table>
</template>

<script>
import { mapActions, mapState } from "vuex";
import { Constants } from "../../resources/constants";
import { CVTooltip } from "@/components/common";
import PokemonSelect from "./pokemonSelect.vue";
export default {
    name: "NuzlockeTable",
    components: { CVTooltip, PokemonSelect },
    computed: {
        ...mapState("pokemon", ["pokemonList"]),
        ...mapState("nuzlocke", ["isCurrentPlayerInvited", "sheetDataList"]),
        ...mapState("sheets", ["currentDocumentId"]),

        playerHeaders() {
            return this.sheetDataList.sheetData.headers.filter((item) => item.isPlayer);
        },
    },
    data() {
        return {
            loadingData: false,
            topActions: [
                {
                    name: "clean",
                    icon: "mdi-eraser",
                    tooltip: "Reset sheet (Only Pokemon)",
                    toggleColor: "",
                    eventHandler: this.resetSheet,
                },
                {
                    name: "managePlayers",
                    icon: "mdi-account-plus",
                    tooltip: "Manage Players",
                    toggleColor: "",
                    eventHandler: this.managePlayers,
                },
            ],
            tableActions: [
                {
                    tooltip: "Mark as 'In party''",
                    icon: "mdi-checkbox-marked-circle",
                    action: this.setRowStatus,
                    actionParams: Constants.ROW_STATUS.IN_PARTY,
                    className: (item) =>
                        item.rowStatus === Constants.ROW_STATUS.IN_PARTY ? "icon-active" : "",
                },
                {
                    tooltip: "Mark as 'Dead'",
                    icon: "mdi-skull",
                    action: this.setRowStatus,
                    actionParams: Constants.ROW_STATUS.DEAD,
                    className: (item) =>
                        item.rowStatus === Constants.ROW_STATUS.DEAD ? "icon-active" : "",
                },
                {
                    tooltip: "Add row below",
                    icon: "mdi-plus",
                    action: this.addRow,
                },
                {
                    tooltip: "Delete Row",
                    icon: "mdi-delete",
                    action: this.deleteItem,
                    disabled: (item) => !item.location.isCustom,
                },
            ],
            tableOptions: {
                itemsPerPage: 15,
            },
        };
    },

    methods: {
        ...mapActions("nuzlocke", [
            "SetSheetData",
            "RemoveSheetDataItem",
            "AddCustomRow",
            "ResetCurrentSheet",
        ]),
        ...mapActions("pokemon", ["UpdatePokemonListByNameAsync"]),

        itemClass(item) {
            let className =
                item?.rowStatus === Constants.ROW_STATUS.DEAD
                    ? "row-dead"
                    : item?.rowStatus === Constants.ROW_STATUS.IN_PARTY
                    ? "row-in-party"
                    : "";
            return className;
        },

        addRow(selectedRow) {
            this.AddCustomRow(selectedRow);
        },

        deleteItem(item) {
            this.RemoveSheetDataItem(item);
        },

        setRowStatus(item, status) {
            let sheetData = this.GeneralHelpers.deepCopy(this.sheetDataList.sheetData);
            const index = this.sheetDataList.sheetData.rows.indexOf(item);
            sheetData.rows[index].rowStatus =
                sheetData.rows[index].rowStatus === status ? "" : status;
            this.SetSheetData([sheetData, this.currentDocumentId]);
        },

        resetSheet() {
            //TODO - show confirmation dialog and add reset logic (only erases player pokemon)
            this.ResetCurrentSheet();
        },

        async onPokemonSelect([name, prop, row]) {
            let pokemon;
            if (name) {
                pokemon = await this.UpdatePokemonListByNameAsync(name);
            }
            let sheetData = this.GeneralHelpers.deepCopy(this.sheetDataList.sheetData);
            const index = this.sheetDataList.sheetData.rows.indexOf(row);
            sheetData.rows[index][prop] = pokemon || null;
            this.SetSheetData([sheetData, this.currentDocumentId]);
        },

        managePlayers() {
            this.$emit("managePlayers");
        },
    },
};
</script>

<style lang="less">
.v-input__slot {
    &::before {
        border-color: transparent !important;
    }
}
.icon-active {
    color: orange !important;
}
.row-dead {
    background-color: rgb(250, 120, 120) !important;
}
.row-in-party {
    background-color: rgb(120, 250, 137) !important;
}
</style>
