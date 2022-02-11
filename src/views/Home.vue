<template>
    <div class="main-cont grey lighten-5">
        <div class="title-img-cont" data-aos="zoom-in">
            <img :src="requireImage('title.png')" />
        </div>
        <v-card class="card" data-aos="zoom-in" data-aos-delay="300">
            <v-card-text class="card-body">
                <v-scroll-x-reverse-transition>
                    <div v-show="cardView === VIEW_MAIN">
                        <div>
                            <v-btn @click="setCardView(VIEW_CREATE_SHEET)">Create Sheet</v-btn>
                        </div>
                        <div>
                            <v-btn @click="setCardView(VIEW_JOIN_SHEET)">Join Sheet</v-btn>
                        </div>
                        <div>
                            <v-btn
                                @click="onSignInOrOffBtn(false)"
                                :disabled="isSigningIn"
                                :loading="isSigningIn"
                            >
                                <i class="mdi mdi-google"></i>
                                {{ !currentUser ? "Sign In" : "Sign Out" }}
                            </v-btn>
                        </div>
                        <div v-if="currentUser">
                            <div class="profile-pic">
                                <img :src="currentUser.photoURL" crossorigin="" />
                                <div>
                                    <span>
                                        Signed in as:
                                        <br />
                                        <strong>{{ currentUser.email }}</strong>
                                    </span>
                                </div>
                            </div>
                        </div>
                        <div class="mt-12">
                            <strong>Made with ❤ by Charlie -</strong>
                            <v-btn
                                icon
                                href="https://www.linkedin.com/in/cvillalobosgtz/"
                                target="_blank"
                            >
                                <v-icon>mdi-linkedin</v-icon>
                            </v-btn>
                            <v-btn icon href="https://github.com/charliemike3124" target="_blank">
                                <v-icon>mdi-github</v-icon>
                            </v-btn>
                        </div>
                    </div>
                </v-scroll-x-reverse-transition>
                <v-scroll-x-reverse-transition>
                    <div v-show="cardView === VIEW_CREATE_SHEET">
                        <v-form v-model="createSheetForm.isValid" ref="createSheetForm">
                            <v-text-field
                                class="v-input-small"
                                v-model="createSheetForm.name"
                                outlined
                                label="Your name"
                                :rules="createSheetForm.nameRules"
                                required
                            ></v-text-field>
                            <v-text-field
                                class="v-input-small"
                                v-model="createSheetForm.title"
                                outlined
                                label="Sheet title"
                                :rules="createSheetForm.titleRules"
                                required
                            ></v-text-field>
                            <div class="d-flex justify-space-between">
                                <v-btn
                                    :disabled="!createSheetForm.isValid"
                                    :loading="creatingSheet"
                                    @click="createSheet"
                                >
                                    Create
                                </v-btn>
                                <v-btn @click="setCardView(VIEW_MAIN)">Back</v-btn>
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
import User from "../resources/models/User";

export default {
    name: "Home",
    computed: {
        ...mapState("sheets", ["savedSheets", "currentUser"]),
    },

    data: () => ({
        isSigningIn: false,
        cardView: "main",
        VIEW_MAIN: "main",
        VIEW_CREATE_SHEET: "createSheet",
        VIEW_JOIN_SHEET: "joinSheet",
        createSheetForm: {
            isValid: false,
            title: "",
            titleRules: [
                (v) => !!v || "Enter a title!",
                (v) => v.length > 3 || "Enter a longer title!",
            ],
            name: "",
            nameRules: [(v) => !!v || "Enter a name!"],
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
    }),

    methods: {
        ...mapActions("sheets", ["LoadSavedSheets", "SetCurrentUser"]),
        ...mapActions("nuzlocke", ["InitializeSheetDataList", "JoinSheet"]),
        //-- Creates a sheet in firebase , sets vuex sheet state and pushes to Sheet view.
        async createSheet() {
            this.creatingSheet = true;
            const documentId = await this.InitializeSheetDataList([
                this.createSheetForm.title,
                [
                    User(
                        this.currentUser?.uid,
                        this.createSheetForm.name,
                        this.currentUser?.email,
                        this.currentUser?.photoUrl
                    ),
                ],
            ]);
            this.$router.push({
                name: "Sheet",
                params: { code: documentId },
            });
        },
        //-- If user is signed in, attempts to Subscribe to that document (onSnapshot), otherwise only gets the data once.
        async joinSheet() {
            this.joiningSheet = true;
            const sheetExists = await this.JoinSheet(this.joinSheetForm.code);
            if (sheetExists) {
                this.$router.push({
                    name: "Sheet",
                    params: { code: this.joinSheetForm.code },
                });
            } else {
                this.snackbar.show = true;
                this.snackbar.text = "No sheets with that code!";
                this.joinSheetForm.error = true;
                setTimeout(() => {
                    this.joinSheetForm.error = false;
                }, this.joinSheetForm.JOIN_TRY_DELAY);
            }
            this.joiningSheet = false;
        },
        //-- Shows google sign in popup if there is no user currently signed in, signs off otherwise.
        async onSignInOrOffBtn(fromJoinSheetBtn = false) {
            this.isSigningIn = true;
            if (!this.currentUser) {
                //Handle Sign In
                const user = await FirebaseAuth.SignInWithGoogleAsync();
                if (user) {
                    this.SetCurrentUser(user);
                    if (!!fromJoinSheetBtn) {
                        this.setCardView(this.VIEW_JOIN_SHEET);
                    }
                }
            } else {
                //Handle Sign Out
                await FirebaseAuth.SignOutAsync();
                this.SetCurrentUser(null);
            }
            this.isSigningIn = false;
        },
        //-- Handles main card view transitions depending on user's action.
        setCardView(view) {
            if (view === this.VIEW_JOIN_SHEET && !this.currentUser) {
                this.onSignInOrOffBtn(true);
            } else {
                this.cardView = "";
                setTimeout(() => {
                    this.cardView = view;
                }, 300);
            }
        },
    },

    async mounted() {
        this.LoadSavedSheets();
        FirebaseAuth.CheckForSignedInUser(this.SetCurrentUser);
    },
};
</script>
<style lang="less">
@import (less) "../styles/views/home.less";
</style>
