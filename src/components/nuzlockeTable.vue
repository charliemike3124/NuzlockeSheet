<template>
    <v-data-table
        :headers="data.headers"
        :items="data.rows"
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
                <v-col>
                    <v-select
                        class="pt-0"
                        :items="pokemonGames"
                        :menu-props="{ top: false, offsetY: true }"
                        v-model="selectedGame"
                        label="Game"
                        hide-details
                        prepend-icon="mdi-pokeball"
                        single-line
                        @change="onSelectGame"
                    ></v-select>
                </v-col>
                <v-col>
                    <div class="d-flex justify-end">
                        <div v-for="(action, index) in topActions" :key="index" align-self="end">
                            <v-tooltip bottom>
                                <template v-slot:activator="{ on, attrs }">
                                    <v-btn
                                        v-on="on"
                                        v-bind="attrs"
                                        icon
                                        class="mr-2"
                                        :color="action.toggleColor"
                                        :disabled="!isCurrentPlayerInvited"
                                        @click="callMethodByName(action.eventHandler)"
                                    >
                                        <v-icon>{{ action.icon }}</v-icon>
                                    </v-btn>
                                </template>
                                <span>{{ action.tooltip }}</span>
                            </v-tooltip>
                        </div>
                    </div>
                </v-col>
            </v-row>
        </template>

        <!--Location Rows-->
        <template v-slot:item.location="{ item }">
            <a
                v-if="!item.location.isCustom"
                :href="`${bulbapediaBaseURL}/${item.location.name}`"
                target="_blank"
            >
                {{ item.location.name }}
            </a>
            <span v-else>{{ item.location.name }}</span>
        </template>

        <!--Player Rows-->
        <template v-for="prop in playerHeaders" v-slot:[`item.${prop.value}`]="{ item }">
            <v-autocomplete
                ref="autoComplete"
                class="autocomplete"
                item-text="name"
                dense
                hide-details
                :items="pokemonList"
                :value="getSelectedPokemon(item[`${prop.value}`])"
                :disabled="!isCurrentPlayerInvited"
                @change="onPokemonSelect($event, prop.value, item)"
            >
                <template v-slot:selection="data">
                    <div v-if="!!item[`${prop.value}`]" class="pokemon-row d-inline-block">
                        <img :src="item[`${prop.value}`].sprite" />
                    </div>
                    <div class="d-inline-block">
                        <span v-bind="data.attrs">
                            {{ data.item.name }}
                            {{ data.item.nickname ? `(${data.item.nickname})` : "" }}
                        </span>
                        <div v-if="!!item[`${prop.value}`]">
                            <CVTooltip
                                :text="type.type.name"
                                v-for="(type, index) in item[`${prop.value}`].types"
                                :key="index"
                            >
                                <img :src="requireImage(`types_icons/${type.type.name}.png`)" />
                            </CVTooltip>
                        </div>
                    </div>
                </template>
            </v-autocomplete>
        </template>

        <!--Action Rows-->
        <template v-slot:item.actions="{ item }">
            <v-tooltip bottom v-for="(action, index) in tableActions" :key="index">
                <template v-slot:activator="{ on, attrs }">
                    <v-icon
                        :class="!!action.className ? action.className(item) : ''"
                        :disabled="
                            !isCurrentPlayerInvited
                                ? true
                                : !!action.disabled
                                ? action.disabled(data, item)
                                : false
                        "
                        v-bind="attrs"
                        v-on="on"
                        small
                        @click="callMethodByName(action.action, [item, ...action.actionParams])"
                    >
                        {{ action.icon }}
                    </v-icon>
                </template>
                {{ action.tooltip }}
            </v-tooltip>
        </template>
        <!--Displayed when there is no data-->
        <template v-slot:no-data>
            <span>Add some routes to this sheet!</span>
        </template>
    </v-data-table>
</template>

<script>
import { mapActions, mapState } from "vuex";
import { PokemonGens, Constants } from "@/resources/constants";
import { CVTooltip } from "@/components/common";
export default {
    name: "NuzlockeTable",
    components: { CVTooltip },
    props: {
        data: {
            required: true,
            default: () => {},
        },
        isCurrentPlayerInvited: Boolean,
    },
    computed: {
        ...mapState("pokemon", ["pokemonList"]),
        ...mapState("nuzlocke", ["sheetDataList"]),
        ...mapState("sheets", ["currentDocumentId", "currentUser"]),
        playerHeaders() {
            return this.data.headers.filter((item) => item.isPlayer);
        },
    },
    data: () => ({
        loadingData: false,
        bulbapediaBaseURL: "https://bulbapedia.bulbagarden.net/wiki",
        pokemonGames: PokemonGens.names,
        selectedGame: PokemonGens.names[0],
        topActions: [
            {
                name: "clean",
                icon: "mdi-eraser",
                tooltip: "Reset sheet (Only Pokemon)",
                toggleColor: "",
                eventHandler: "resetSheet",
            },
            {
                name: "managePlayers",
                icon: "mdi-account-plus",
                tooltip: "Manage Players",
                toggleColor: "",
                eventHandler: "managePlayers",
            },
        ],
        tableActions: [
            {
                tooltip: "Mark as 'In party''",
                icon: "mdi-checkbox-marked-circle",
                action: "setRowStatus",
                actionParams: [Constants.ROW_STATUS.IN_PARTY],
                className: (item) =>
                    item.rowStatus === Constants.ROW_STATUS.IN_PARTY ? "icon-active" : "",
            },
            {
                tooltip: "Mark as 'Dead'",
                icon: "mdi-skull",
                action: "setRowStatus",
                actionParams: [Constants.ROW_STATUS.DEAD],
                className: (item) =>
                    item.rowStatus === Constants.ROW_STATUS.DEAD ? "icon-active" : "",
            },
            {
                tooltip: "Add row below",
                icon: "mdi-plus",
                action: "addRow",
            },
            {
                tooltip: "Clear Row",
                icon: "mdi-eraser",
                action: "clearItem",
            },
        ],
        tableOptions: {
            itemsPerPage: 15,
        },
    }),

    methods: {
        ...mapActions("nuzlocke", [
            "SetSheetData",
            "RemoveSheetDataItem",
            "AddCustomRow",
            "SetSheetGame",
            "ResetCurrentSheet",
            "ClearSheetRow",
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
        //-- Clears the pokemon in the given row
        clearItem(item) {
            this.ClearSheetRow(item);
        },
        //-- Deletes a given row
        deleteItem(item) {
            this.RemoveSheetDataItem(item);
        },
        //-- Sets the status of a row
        setRowStatus(item, status) {
            let sheetData = this.deepCopy(this.data);
            const index = this.data.rows.indexOf(item);
            sheetData.rows[index].rowStatus =
                sheetData.rows[index].rowStatus === status ? "" : status;
            this.SetSheetData([sheetData, this.currentDocumentId]);
        },
        //-- Called when selecting a pokemon game
        async onSelectGame() {
            this.SetSheetGame(this.selectedGame);
        },
        //-- Opens a new tab to bulbapedia with the pokemon's data
        showPokemonData(item) {
            window.open(`${this.bulbapediaBaseURL}/${item.name}`, "_blank");
        },
        //-- Resets the whole sheet to its original state.
        resetSheet() {
            //TODO - show confirmation dialog and add reset logic (only erases player pokemon)
            this.ResetCurrentSheet();
        },
        //-- Called when selecting a pokemon from the autocomplete
        async onPokemonSelect(name, prop, row) {
            let pokemon;
            if (name) {
                pokemon = await this.UpdatePokemonListByNameAsync(name);
            }
            let sheetData = JSON.parse(JSON.stringify(this.data));
            const index = this.data.rows.indexOf(row);
            sheetData.rows[index][prop] = pokemon;
            this.SetSheetData([sheetData, this.currentDocumentId]);
        },
        //-- Returns all the pokemon data by name, used in the template.
        getSelectedPokemon(pokemon) {
            return this.pokemonList.find((pok) => pok.name === pokemon?.name);
        },
        //-- Opens players management popup
        managePlayers() {
            this.$emit("managePlayers");
        },
        //-- Removes google chrome autocomplete functinoality from all inputs
        removeInputAutocomplete() {
            if (this.$refs?.autoComplete?.length) {
                for (const ref of this.$refs.autoComplete) {
                    let input = ref?.$el.querySelector("input");
                    input.autocomplete = false;
                }
            }
        },
    },
    watch: {
        loadingData(val) {
            this.$nextTick(() => {
                setTimeout(() => {
                    //-- Called when data finishes loading.
                    if (!val && this.$refs?.autoComplete?.length) {
                        this.removeInputAutocomplete();
                    }
                }, 1000);
            });
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
.pokemon-row {
    padding: 5px 0;
    img {
        transform: scale(2.5);
        margin-right: 20px;
        margin-bottom: 5px;
        width: 25px;
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
