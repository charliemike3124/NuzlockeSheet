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
                    <v-list-item
                        class="pointer"
                        @click="callMethodByName(item.action)"
                        v-for="(item, index) in menuActions"
                        :key="index"
                    >
                        <v-list-item-title>
                            <i class="mdi" :class="item.icon"></i>
                            {{ item.name }}
                        </v-list-item-title>
                    </v-list-item>
                </v-list>
            </v-menu>
            <v-toolbar-title class="mr-3">{{ sheetDataList.title }}</v-toolbar-title>

            <v-spacer></v-spacer>

            <v-btn v-if="!userIsSignedIn" :loading="isSigningIn" @click="onSignInClick">
                Sign In
            </v-btn>
        </v-toolbar>
        <v-alert
            v-model="showAlert"
            color="warning"
            dark
            border="top"
            transition="scale-transition"
            close-label="okay"
        >
            <div class="d-flex align-center">
                <v-icon class="mr-2">mdi-alert</v-icon>
                You do not have permission to edit this Sheet.
                <v-spacer></v-spacer>
                <v-btn text @click="showAlert = false">Okay</v-btn>
            </div>
        </v-alert>
        <div class="table-cont mb-12">
            <NuzlockeTable
                ref="nuzlockeTable"
                :data="sheetData"
                :isCurrentPlayerInvited="isCurrentPlayerInvited"
                @showSnackbar="showSnackbar"
                @managePlayers="onManagePlayersClick"
            ></NuzlockeTable>
        </div>

        <!-- Modal -->
        <v-dialog v-model="dialog.show" width="600">
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
                <v-btn
                    :color="snackbar.color"
                    text
                    v-bind="attrs"
                    icon
                    @click="snackbar.show = false"
                >
                    <v-icon>mdi-close</v-icon>
                </v-btn>
            </template>
        </v-snackbar>
    </div>
</template>

<script>
import { NuzlockeTable, PlayersTable } from "@/components";
import { PokemonGens, Constants } from "@/resources/constants";
import { mapActions, mapState } from "vuex";
import FirebaseAuth from "@/services/FirebaseAuth";
import Database from "@/services/FirebaseDatabase";

export default {
    name: "Home",

    components: {
        NuzlockeTable,
        PlayersTable,
    },

    computed: {
        ...mapState("nuzlocke", ["sheetData", "sheetDataList", "selectedSheet"]),
        ...mapState("sheets", ["currentUser", "currentDocumentId"]),
        userIsSignedIn() {
            return this.currentUser?.uid;
        },
        isCurrentPlayerInvited() {
            return !!this.sheetDataList.players.find((p) => p.email === this.currentUser?.email);
        },
    },

    data: () => ({
        isSigningIn: false,
        showAlert: false,
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
        menuActions: [
            {
                name: "Share",
                action: "onShareSheetClick",
                icon: "mdi-share",
            },
            {
                name: "Exit",
                action: "onExitSheetClick",
                icon: "mdi-subdirectory-arrow-left",
            },
        ],
    }),

    methods: {
        ...mapActions("nuzlocke", ["JoinSheet", "SetPlayers", "GetSelectedSheet"]),
        ...mapActions("pokemon", ["SetPokemonListAsync"]),
        ...mapActions("sheets", ["SetCurrentUser", "SetCurrentDocumentId"]),
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

        //-- Start Event Handlers --//
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
        async onSignInClick() {
            this.isSigningIn = true;
            const user = await FirebaseAuth.SignInWithPopupAsync(Constants.AUTH_PROVIDERS.GOOGLE);
            if (user) {
                this.SetCurrentUser(user);
                this.$router.go();
            }
            this.isSigningIn = false;
        },
        //-- End Event Handlers --//
    },
    watch: {
        isCurrentPlayerInvited(val) {
            this.showAlert = !val;
        },
    },
    created() {
        this.GetSelectedSheet();
        this.SetCurrentDocumentId(this.$route.params.code);
    },
    async mounted() {
        this.$refs.nuzlockeTable.loadingData = true;
        await Promise.all([
            FirebaseAuth.CheckForSignedInUser(this.SetCurrentUser),
            this.SetPokemonListAsync(),
        ]);
        const isSheetInitialized = this.sheetDataList.dataSheets.length;
        if (!isSheetInitialized) {
            const dataExists = await this.JoinSheet(this.currentDocumentId);
            if (!dataExists) {
                this.$router.push({ name: "Home" });
            }
        }
        this.showAlert = !this.isCurrentPlayerInvited;
        this.$refs.nuzlockeTable.selectedGame = PokemonGens.names[this.selectedSheet];
        this.$refs.nuzlockeTable.loadingData = false;
    },
    beforeDestroy() {
        Database.UnsubscribeFromSheet();
    },
};
</script>
<style lang="less">
@import (less) "../styles/views/sheet.less";
</style>
