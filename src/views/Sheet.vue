<template>
    <div class="main-sheet-cont grey lighten-5">
        <v-toolbar dense color="primary" class="white--text">
            <v-menu bottom left>
                <template v-slot:activator="{ on, attrs }">
                    <v-btn icon v-bind="attrs" v-on="on" color="white">
                        <v-icon>mdi-dots-vertical</v-icon>
                    </v-btn>
                </template>

                <v-list>
                    <v-list-item class="pointer" @click="onShareSheetClick">
                        <v-list-item-title>
                            <i class="mdi mdi-share"></i>
                            Share
                        </v-list-item-title>
                    </v-list-item>
                    <v-list-item class="pointer" @click="onExitSheetClick">
                        <v-list-item-title>
                            <i class="mdi mdi-subdirectory-arrow-left"></i>
                            Exit
                        </v-list-item-title>
                    </v-list-item>
                </v-list>
            </v-menu>
            <v-toolbar-title class="mr-3">{{ sheetDataList.title }}</v-toolbar-title>
        </v-toolbar>
        <div class="table-cont mb-12">
            <NuzlockeTable
                ref="nuzlockeTable"
                :data="sheetData"
                @showSnackbar="showSnackbar"
                @managePlayers="onManagePlayersClick"
            ></NuzlockeTable>
        </div>

        <!-- Modal -->
        <v-dialog v-model="dialog.show" width="500">
            <v-card>
                <v-card-title class="text-h6 primary">
                    <span class="white--text">{{ dialog.title }}</span>
                </v-card-title>

                <div class="mx-4">
                    <!--Forced re-render-->
                    <PlayersTable v-if="dialog.show" ref="playersTable"></PlayersTable>
                </div>

                <v-divider></v-divider>

                <v-card-actions>
                    <v-spacer></v-spacer>
                    <v-btn color="primary" text @click="onSavePlayersClick">Save</v-btn>
                    <v-btn color="black" text @click="dialog.show = false">Close</v-btn>
                </v-card-actions>
            </v-card>
        </v-dialog>

        <!-- Snackbar -->
        <v-snackbar v-model="snackbar.show">
            {{ snackbar.text }}
            <template v-slot:action="{ attrs }">
                <v-btn :color="snackbar.color" text v-bind="attrs" icon @click="snackbar.show = false">
                    <v-icon>mdi-close</v-icon>
                </v-btn>
            </template>
        </v-snackbar>
    </div>
</template>

<script>
import { NuzlockeTable, PlayersTable } from "@/components";
import { PokemonGens } from "@/resources";
import { mapActions, mapState } from "vuex";

export default {
    name: "Home",

    components: {
        NuzlockeTable,
        PlayersTable,
    },

    computed: {
        ...mapState("nuzlocke", ["sheetData", "sheetDataList", "selectedSheet"]),
        ...mapState("sheets", ["currentUser"]),
    },

    data: () => ({
        addedPlayerName: "",
        dialog: {
            show: false,
            title: "",
        },
        snackbar: {
            show: false,
            text: "",
            color: "",
        },
    }),

    methods: {
        ...mapActions("nuzlocke", ["SetSheetData", "JoinSheet", "SetPlayers", "GetSelectedSheet"]),
        ...mapActions("pokemon", ["SetPokemonListAsync"]),
        showDialog(title) {
            this.dialog.show = true;
            this.dialog.title = title;
        },
        closeDialog() {
            this.dialog.show = false;
        },
        showSnackbar(alert) {
            this.snackbar.show = true;
            this.snackbar.text = alert.text;
            this.snackbar.color = alert.color;
        },

        //--EVENT-HANDLERS--//
        onManagePlayersClick() {
            this.showDialog("Manage Players");
        },
        onShareSheetClick() {
            //TODO - Copy sheet route to clipboard
        },
        onSavePlayersClick() {
            this.SetPlayers(this.$refs.playersTable.players);
            this.closeDialog();
        },
        onExitSheetClick() {
            this.$router.push({ name: "Home" });
        },
    },
    async mounted() {
        this.$refs.nuzlockeTable.loadingData = true;
        this.GetSelectedSheet();
        await this.SetPokemonListAsync();
        if (!this.sheetDataList.code) {
            const dataExists = await this.JoinSheet(this.$route.params.code);
            if (!dataExists) {
                this.$router.push({ name: "Home" });
            }
        }
        this.$refs.nuzlockeTable.selectedGame = PokemonGens.names[this.selectedSheet];
        this.$refs.nuzlockeTable.loadingData = false;
    },
};
</script>
<style lang="less">
@import (less) "../styles/views/sheet.less";
</style>
