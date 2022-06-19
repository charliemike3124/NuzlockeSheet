<template>
    <div class="main-sheet-cont grey lighten-5">
        <v-toolbar dense color="primary" class="white--text">
            <v-menu bottom left v-if="isCurrentPlayerInvited">
                <template v-slot:activator="{ on, attrs }">
                    <v-btn icon v-bind="attrs" v-on="on" color="white">
                        <v-icon>mdi-dots-vertical</v-icon>
                    </v-btn>
                </template>

                <v-list>
                    <v-list-item
                        class="pointer"
                        @click="item.action"
                        v-for="(item, index) in menuActions"
                        :key="index"
                    >
                        <v-list-item-title>
                            <i class="mdi" :class="item.icon()"></i>
                            {{ item.name() }}
                        </v-list-item-title>
                    </v-list-item>
                </v-list>
            </v-menu>
            <v-toolbar-title class="mr-3">{{ sheetDataList.title }}</v-toolbar-title>

            <v-spacer></v-spacer>

            <v-btn
                v-if="!userIsSignedIn && !loadingData"
                :loading="isSigningIn"
                @click="onSignInClick"
            >
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
        <div class="table-cont mb-12" v-if="!loadingData">
            <NuzlockeTable
                ref="nuzlockeTable"
                @showSnackbar="showSnackbar"
                @managePlayers="onManagePlayersClick"
            />
        </div>
        <CVSpinner v-if="loadingData" color="primary"><span>Loading data...</span></CVSpinner>

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
import { CVSpinner } from "@/components/common";
import { Constants } from "@/resources/constants";
import { mapActions, mapMutations, mapState } from "vuex";
import FirebaseAuth from "@/services/FirebaseAuth";
import Database from "@/services/FirebaseDatabase";

export default {
    name: "Sheet",

    components: {
        NuzlockeTable,
        PlayersTable,
        CVSpinner,
    },

    computed: {
        ...mapState("nuzlocke", ["sheetDataList", "isCurrentPlayerInvited"]),
        ...mapState("sheets", ["currentUser", "currentDocumentId"]),
        userIsSignedIn() {
            return this.currentUser?.uid;
        },
    },

    data() {
        return {
            loadingData: true,
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
                    name: () => "Share",
                    action: this.onShareSheetClick,
                    icon: () => "mdi-share",
                },
                {
                    name: () => (this.sheetDataList.isPrivate ? "Make Public" : "Make Private"),
                    action: this.onMakePrivateClick,
                    icon: () => (this.sheetDataList.isPrivate ? "mdi-lock-open" : "mdi-lock"),
                },
                {
                    name: () => "Exit",
                    action: this.onExitSheetClick,
                    icon: () => "mdi-subdirectory-arrow-left",
                },
            ],
        };
    },

    methods: {
        ...mapActions("nuzlocke", [
            "JoinSheet",
            "SetPlayers",
            "SetIsCurrentPlayerInvited",
            "UpdateSheetDataList",
        ]),
        ...mapActions("pokemon", ["SetPokemonListAsync"]),
        ...mapActions("sheets", ["SetCurrentUser", "SetCurrentDocumentId", "LoadUserPreferences"]),

        ...mapMutations("common", ["SetShowSnackbar"]),

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
            navigator.clipboard.writeText(
                `https://nuzlockesheets.com/Sheet/${this.currentDocumentId}`
            );
            this.SetShowSnackbar({
                show: true,
                content: "The link has been copied to your clipboard!",
            });
        },

        onSavePlayersClick() {
            this.SetPlayers(this.$refs.playersTable.players);
            this.closeDialog();
        },

        onExitSheetClick() {
            this.$router.push({ name: "Home" });
        },

        onMakePrivateClick() {
            let updatedSheetDataList = this.GeneralHelpers.deepCopy(this.sheetDataList);
            updatedSheetDataList.isPrivate = !updatedSheetDataList.isPrivate;
            this.UpdateSheetDataList([updatedSheetDataList, this.currentDocumentId]);
            this.SetShowSnackbar({
                show: true,
                content: updatedSheetDataList.isPrivate
                    ? "This sheet will now be editable only by invited players."
                    : "This sheet will now be editable by everyone.",
            });
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

    created() {
        this.SetCurrentDocumentId(this.$route.params.code);
    },

    async mounted() {
        await Promise.all([
            FirebaseAuth.CheckForSignedInUser(this.SetCurrentUser),
            this.SetPokemonListAsync(),
        ]);
        await this.LoadUserPreferences();
        const isSheetInitialized = !!this.sheetDataList.title;
        if (!isSheetInitialized) {
            const dataExists = await this.JoinSheet(this.currentDocumentId);
            if (!dataExists) {
                this.$router.push({ name: "Home" });
            }
        }
        this.SetIsCurrentPlayerInvited(
            !!this.sheetDataList.players.find((p) => p.email === this.currentUser?.email)
        );
        this.showAlert = !this.isCurrentPlayerInvited && this.sheetDataList.isPrivate;
        this.loadingData = false;
    },

    beforeDestroy() {
        Database.UnsubscribeFromSheet();
    },
};
</script>
<style lang="less">
@import (less) "../styles/views/sheet.less";
</style>
