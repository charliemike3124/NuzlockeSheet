<template>
    <div>
        <!--Add Player Form-->
        <div class="ma-4">
            <div class="mt-3">
                <span class="font-weight-bold">Add a Player</span>
            </div>
            <div class="mx-6 mt-3 player-form">
                <v-form v-model="playerForm.isValid" ref="playerForm">
                    <v-text-field
                        v-for="(input, index) in playerForm.inputs"
                        :key="index"
                        v-model="input.value"
                        class="v-input-small mt-1"
                        :class="addPlayerInputClass"
                        :label="input.name"
                        :rules="input.rules"
                        outlined
                        required
                        hide-details
                        @keydown.prevent.enter="addPlayer"
                    ></v-text-field>
                    <v-btn color="primary" @click="addPlayer" :disabled="!playerForm.isValid">
                        Add
                    </v-btn>
                </v-form>
            </div>
        </div>

        <!--Current Players Table-->
        <div class="ma-4">
            <div class="mt-3">
                <span class="font-weight-bold">Current Players</span>
            </div>
            <div class="mx-6 my-2">
                <v-simple-table dense v-if="players.length">
                    <template v-slot:default>
                        <thead>
                            <th class="text-center">Name</th>
                            <th class="text-center">Email</th>
                        </thead>
                        <tbody>
                            <tr v-for="(player, index) in players" :key="index">
                                <td class="text-center">
                                    <div class="name-cont">
                                        <span v-if="playerToBeEdited !== player">
                                            {{ player.name }}
                                        </span>
                                        <v-text-field
                                            autofocus
                                            ref="editInput"
                                            class="pa-0"
                                            v-else
                                            v-model="editedPlayerName"
                                            hide-details
                                            @keydown.prevent.enter="editPlayer(player)"
                                        ></v-text-field>
                                    </div>
                                </td>
                                <td>
                                    <span v-if="playerToBeEdited !== player">
                                        {{ player.email }}
                                    </span>
                                    <v-text-field
                                        class="pa-0"
                                        v-else
                                        v-model="editedPlayerEmail"
                                        hide-details
                                        @keydown.prevent.enter="editPlayer(player)"
                                    ></v-text-field>
                                </td>
                                <td>
                                    <v-btn
                                        icon
                                        :style="playerToBeEdited === player ? 'color: orange' : ''"
                                        @click="editPlayer(player)"
                                    >
                                        <v-icon>mdi-account-edit</v-icon>
                                    </v-btn>
                                    <v-btn icon @click="removePlayer(player)">
                                        <v-icon>mdi-delete</v-icon>
                                    </v-btn>
                                </td>
                            </tr>
                        </tbody>
                    </template>
                </v-simple-table>
                <div v-else class="text-center">
                    <span>No players added.</span>
                </div>
            </div>
        </div>
    </div>
</template>

<script>
import { mapActions, mapState } from "vuex";
import { User } from "../resources/models";
import stringUtils from "../resources/utils/stringUtils";

export default {
    name: "playersTable",
    props: {},
    computed: {
        ...mapState("nuzlocke", ["sheetDataList"]),
        addPlayerInputClass() {
            let className = "";
            return className;
        },
    },
    data: () => {
        return {
            players: [],
            addedPlayerName: "",
            addedPlayerEmail: "",
            playerToBeEdited: null,
            editedPlayerName: "",
            editedPlayerEmail: "",
            playerForm: {
                isValid: false,
                inputs: [
                    {
                        name: "Name",
                        value: "",
                        rules: [(v) => !!v || "Name can't be empty!"],
                    },
                    {
                        name: "Email",
                        value: "",
                        rules: [
                            (v) => !!v || "Email can't be empty!",
                            (v) => stringUtils.ValidateEmail(v) || "Enter a valid email!",
                        ],
                    },
                ],
            },
        };
    },
    methods: {
        addPlayer() {
            const player = User(
                null,
                this.playerForm.inputs[0].value,
                this.playerForm.inputs[1].value
            );
            if (!this.playerExists(player)) {
                this.players.push(player);
                this.playerForm.inputs[0].value = "";
                this.playerForm.inputs[1].value = "";
            }
            this.$refs.playerForm.reset();
        },
        editPlayer(player) {
            if (this.playerToBeEdited) {
                if (this.editedPlayerName) {
                    player.previousName = player.name;
                    player.name = this.editedPlayerName;
                }
                if (this.editedPlayerEmail) {
                    player.previousEmail = player.email;
                    player.email = this.editedPlayerEmail;
                }
                this.playerToBeEdited = null;
            } else {
                this.editedPlayerEmail = player.email;
                this.editedPlayerName = player.name;
                this.playerToBeEdited = player;
            }
        },
        removePlayer(player) {
            const index = this.players.indexOf(player);
            if (index >= 0) {
                this.players.splice(index, 1);
            }
        },
        playerExists(player) {
            return this.players.find((p) => p.name === player.name && p.email === player.email);
        },
    },
    mounted() {
        this.players = this.GeneralHelpers.deepCopy(this.sheetDataList?.players) || [];
    },
};
</script>

<style lang="less">
@import (less) "../styles/components/playersTable.less";
</style>
