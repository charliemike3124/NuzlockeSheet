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
                        class="pt-0 v-select-sm"
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
                                <img :src="GeneralHelpers.requireImage(`types_icons/${type.type.name}.png`)" />
                            </CVTooltip>
                        </div>
                    </div>
                </template>
            </v-autocomplete>
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
                            ? action.disabled(data, item)
                            : false
                    "
                    small
                    @click="action.actionParams ? action.action(item, action.actionParams) : action.action(item)"
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
import { PokemonGens, Constants } from "../resources/constants";
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
    data(){ 
        return {
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
                    eventHandler: this.eventHandler,
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
                    tooltip: "Clear Row",
                    icon: "mdi-eraser",
                    action: this.clearItem,
                },
            ],
            tableOptions: {
                itemsPerPage: 15,
            },
    }},

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

        clearItem(item) {
            this.ClearSheetRow(item);
        },

        deleteItem(item) {
            this.RemoveSheetDataItem(item);
        },

        setRowStatus(item, status) {
            let sheetData = this.GeneralHelpers.deepCopy(this.data);
            const index = this.data.rows.indexOf(item);
            sheetData.rows[index].rowStatus =
                sheetData.rows[index].rowStatus === status ? "" : status;
            this.SetSheetData([sheetData, this.currentDocumentId]);
        },
        
        async onSelectGame() {
            this.SetSheetGame(this.selectedGame);
        },
        
        showPokemonData(item) {
            window.open(`${this.bulbapediaBaseURL}/${item.name}`, "_blank");
        },
        
        resetSheet() {
            //TODO - show confirmation dialog and add reset logic (only erases player pokemon)
            this.ResetCurrentSheet();
        },
        
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
        
        getSelectedPokemon(pokemon) {
            return this.pokemonList.find((pok) => pok.name === pokemon?.name);
        },
        
        managePlayers() {
            this.$emit("managePlayers");
        },
        
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
