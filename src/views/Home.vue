<template>
    <div class="main-cont grey lighten-5">
        <div class="title-img-cont text-center" data-aos="zoom-in">
            <img :src="GeneralHelpers.requireImage('title.png')" alt="Nuzlocke Sheets logo" />
            <div>
                A real-time synced tracking tool for your
                <br />
                <strong>Nuzlocke</strong>
                and
                <strong>Soulink</strong>
                runs !
            </div>
        </div>
        <v-card class="card" data-aos="zoom-in" data-aos-delay="400">
            <v-card-text class="card-body">
                <v-scroll-x-reverse-transition>
                    <div v-show="cardView === VIEW_MAIN">
                        <div class="mb-3">Create a sheet and share the link with your friends!</div>
                        <div v-if="currentUser">
                            <v-btn @click="setCardView(VIEW_CREATE_SHEET)">Create Sheet</v-btn>
                        </div>
                        <div v-if="currentUser">
                            <v-btn @click="setCardView(VIEW_JOIN_SHEET)">Join Sheet</v-btn>
                        </div>
                        <div v-if="currentUser">
                            <v-btn
                                @click="showUserPreferenceDialog = true"
                                :disabled="!hasSavedSheets"
                            >
                                View my sheets
                            </v-btn>
                        </div>
                        <div v-if="!currentUser">
                            <v-btn
                                @click="onSignInOrOffBtn(false, authProviders.google)"
                                :disabled="isSigningIn"
                                :loading="isSigningIn"
                            >
                                <i class="mdi mdi-google"></i>
                                Sign In
                            </v-btn>
                        </div>
                        <div v-if="currentUser">
                            <div class="profile-pic">
                                Signed in as:
                                <br />
                                <img
                                    :src="currentUser.photoURL"
                                    crossorigin=""
                                    alt="User profile-pic"
                                />
                                <div>
                                    <strong>{{ currentUser.email }}</strong>
                                    <br />
                                    <span
                                        class="link"
                                        v-if="currentUser"
                                        @click="onSignInOrOffBtn(false, authProviders.google)"
                                    >
                                        (Sign Out)
                                    </span>
                                </div>
                            </div>
                        </div>
                    </div>
                </v-scroll-x-reverse-transition>
                <v-scroll-x-reverse-transition>
                    <div v-show="cardView === VIEW_CREATE_SHEET">
                        <v-form v-model="createSheetForm.isValid" ref="createSheetForm">
                            <v-text-field
                                class="v-input-small mb-5"
                                v-model="createSheetForm.name"
                                outlined
                                label="Your name"
                                :rules="createSheetForm.nameRules"
                                prepend-icon="mdi-account"
                                hide-details
                                required
                            ></v-text-field>
                            <v-text-field
                                class="v-input-small mb-5"
                                v-model="createSheetForm.title"
                                outlined
                                label="Sheet title"
                                :rules="createSheetForm.titleRules"
                                prepend-icon="mdi-pencil-box-outline"
                                hide-details
                                required
                            ></v-text-field>
                            <v-select
                                class="v-input-small mb-5"
                                v-model="createSheetForm.pokemonGen"
                                :items="pokemonGames"
                                :menu-props="{ top: false, offsetY: true }"
                                prepend-icon="mdi-pokeball"
                                label="Pokémon Game"
                                :rules="createSheetForm.pokemonGenRules"
                                outlined
                                hide-details
                                required
                            ></v-select>
                            <v-select
                                class="v-input-small mb-5"
                                v-model="createSheetForm.isPrivate"
                                :items="isPrivateOptions"
                                item-text="text"
                                item-value="value"
                                :menu-props="{ top: false, offsetY: true }"
                                prepend-icon="mdi-lock"
                                label="Visibility"
                                outlined
                                hide-details
                                required
                            ></v-select>
                            <div class="d-flex justify-space-between mt-8">
                                <v-btn @click="setCardView(VIEW_MAIN)">Back</v-btn>
                                <v-btn
                                    :disabled="!createSheetForm.isValid"
                                    :loading="creatingSheet"
                                    @click="createSheet"
                                    color="primary"
                                >
                                    Create
                                </v-btn>
                            </div>
                        </v-form>
                    </div>
                </v-scroll-x-reverse-transition>
                <v-scroll-x-reverse-transition>
                    <div v-show="cardView === VIEW_JOIN_SHEET">
                        <v-form v-model="joinSheetForm.isValid" ref="joinSheetForm">
                            <v-text-field
                                class="v-input-small"
                                v-model="joinSheetForm.code"
                                outlined
                                label="Sheet Code"
                                :rules="joinSheetForm.codeRules"
                                required
                                :error="joinSheetForm.error"
                            ></v-text-field>
                            <div class="d-flex justify-space-between">
                                <v-btn
                                    :disabled="!joinSheetForm.isValid"
                                    :loading="joiningSheet"
                                    @click="joinSheet"
                                >
                                    Join Sheet
                                </v-btn>
                                <v-btn @click="setCardView(VIEW_MAIN)">Back</v-btn>
                            </div>
                        </v-form>
                    </div>
                </v-scroll-x-reverse-transition>
            </v-card-text>
        </v-card>

        <div class="my-4 home-footer">
            <strong>Made by</strong>
            <v-btn
                class="ml-2"
                icon
                href="https://www.linkedin.com/in/cvillalobosgtz/?locale=en_US"
                target="_blank"
                x-small
            >
                <v-icon>mdi-linkedin</v-icon>
            </v-btn>
            -
            <v-btn icon href="https://github.com/charliemike3124" target="_blank" x-small>
                <v-icon>mdi-github</v-icon>
            </v-btn>
        </div>

        <v-dialog v-model="showUserPreferenceDialog">
            <UserSheets @closeDialog="showUserPreferenceDialog = false"></UserSheets>
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
import FirebaseAuth from "@/services/FirebaseAuth";
import { mapState, mapActions } from "vuex";
import { User } from "../resources/models";
import { Constants, PokemonGens } from "../resources/constants";
import UserSheets from "../components/userSheets.vue";

export default {
    name: "Home",
    computed: {
        ...mapState("sheets", ["savedSheets", "currentUser", "userPreference"]),

        hasSavedSheets() {
            return this.userPreference?.savedSheets?.length || false;
        },
    },
    components: {
        UserSheets,
    },

    data() {
        return {
            showUserPreferenceDialog: false,
            isSigningIn: false,
            cardView: "main",
            VIEW_MAIN: "main",
            VIEW_CREATE_SHEET: "createSheet",
            VIEW_JOIN_SHEET: "joinSheet",
            pokemonGames: PokemonGens.names,
            isPrivateOptions: [
                { text: "Private", value: true },
                { text: "Public", value: false },
            ],
            createSheetForm: {
                isValid: false,
                title: "",
                titleRules: [(v) => !!v || "Enter a title!"],
                name: "",
                nameRules: [(v) => !!v || "Enter a name!"],
                pokemonGen: null,
                pokemonGenRules: [(v) => !!v || "Select a game!"],
                isPrivate: false,
            },
            joinSheetForm: {
                isValid: false,
                code: "",
                codeRules: [(v) => !!v || "Enter a Code!"],
                error: false,
                JOIN_TRY_DELAY: 3000,
            },
            joiningSheet: false,
            creatingSheet: false,
            newSheetTitle: "",
            snackbar: {
                show: false,
                text: "",
                color: "",
            },
            authProviders: {
                google: Constants.AUTH_PROVIDERS.GOOGLE,
                facebook: Constants.AUTH_PROVIDERS.FACEBOOK,
                twitter: Constants.AUTH_PROVIDERS.TWITTER,
                email: Constants.AUTH_PROVIDERS.EMAIL,
            },
        };
    },

    methods: {
        ...mapActions("sheets", ["LoadUserPreferences", "SetCurrentUser"]),
        ...mapActions("nuzlocke", ["InitializeSheetDataList", "JoinSheet"]),

        async createSheet() {
            this.creatingSheet = true;
            const documentId = await this.InitializeSheetDataList([
                this.createSheetForm.title,
                [
                    User(
                        this.currentUser?.uid,
                        this.createSheetForm.name,
                        this.currentUser?.email,
                        this.currentUser?.photoURL
                    ),
                ],
                this.createSheetForm.pokemonGen,
                this.createSheetForm.isPrivate,
            ]);
            this.$router.push({
                name: "Sheet",
                params: { code: documentId },
            });
        },

        async joinSheet() {
            this.joiningSheet = true;
            const sheetExists = await this.JoinSheet(this.joinSheetForm.code);
            if (sheetExists === Constants.JOIN_SHEET_ERRORS.DOES_NOT_EXIST) {
                this.showSnackbar("There are no sheets with that code!");
            } else if (sheetExists === Constants.JOIN_SHEET_ERRORS.NO_ACCESS) {
                this.showSnackbar("You have no access to that sheet.");
            } else if (!!sheetExists) {
                this.$router.push({
                    name: "Sheet",
                    params: { code: this.joinSheetForm.code },
                });
            }
            this.joiningSheet = false;
        },

        async onSignInOrOffBtn(fromJoinSheetBtn = false, authProvider) {
            this.isSigningIn = true;
            if (!this.currentUser) {
                //Handle Sign In
                const user = await FirebaseAuth.SignInWithPopupAsync(authProvider);
                if (user) {
                    this.SetCurrentUser(user);
                    if (!!fromJoinSheetBtn) {
                        this.setCardView(this.VIEW_JOIN_SHEET);
                    }
                    this.LoadUserPreferences();
                }
            } else {
                //Handle Sign Out
                await FirebaseAuth.SignOutAsync();
                this.SetCurrentUser(null);
            }
            this.isSigningIn = false;
        },

        setCardView(view) {
            if (view === this.VIEW_JOIN_SHEET && !this.currentUser) {
                this.showSnackbar("Sign in first before joining a sheet!");
            } else {
                this.cardView = "";
                setTimeout(() => {
                    this.cardView = view;
                }, 300);
            }
        },

        showSnackbar(text) {
            this.snackbar.show = true;
            this.snackbar.text = text;
            this.joinSheetForm.error = true;
            setTimeout(() => {
                this.joinSheetForm.error = false;
            }, this.joinSheetForm.JOIN_TRY_DELAY);
        },
    },

    async mounted() {
        await FirebaseAuth.CheckForSignedInUser(this.SetCurrentUser);
        await this.LoadUserPreferences();
    },
};
</script>
<style lang="less">
@import (less) "../styles/views/home.less";
</style>
