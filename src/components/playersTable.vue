<template>
    <div>
        <div class="mt-3">
            <span class="font-weight-bold">Add a Player</span>
        </div>
        <div class="mx-6 mt-3 player-form">
            <v-form v-model="playerForm.isValid">
                <v-text-field
                    v-model="playerForm.inputs.addedPlayerName.value"
                    class="v-input-small mt-1"
                    :class="addPlayerInputClass"
                    label="Player Name *"
                    outlined
                    required
                    hide-details
                    @keydown.prevent.enter="addPlayer"
                ></v-text-field>
                <v-text-field
                    v-model="playerForm.inputs.addedPlayerEmail.value"
                    class="v-input-small mt-1"
                    :class="addPlayerInputClass"
                    label="Email *"
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
                                    <img
                                        v-if="edittingPlayer !== player && player.photoUrl"
                                        :src="player.photoURL"
                                        crossorigin=""
                                    />
                                    <span v-if="edittingPlayer !== player">{{ player.name }}</span>
                                    <v-text-field
                                        ref="editInput"
                                        class="pa-0"
                                        v-else
                                        :value="player.name"
                                        hide-details
                                        @keydown.prevent.enter="editPlayer($event, player)"
                                    ></v-text-field>
                                </div>
                            </td>
                            <td>
                                <span>{{ player.email }}</span>
                            </td>
                            <td>
                                <v-btn
                                    icon
                                    :style="edittingPlayer === player ? 'color: orange' : ''"
                                    @click="editPlayer(null, player)"
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
</template>

<script>
import { mapActions, mapState } from "vuex";
import { User } from "../resources/models";
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
            edittingPlayer: null,
            playerForm: {
                isValid: false,
                inputs: {
                    addedPlayerName: {
                        value: "",
                        rules: [
                            (v) => !!v || "Name can't be empty!",
                            (v) => !playerExists(v) || "Another player has that name.",
                        ],
                    },
                    addedPlayerEmail: {
                        value: "",
                        rules: [(v) => !!v || "Email can't be empty!"],
                    },
                },
            },
        };
    },
    methods: {
        addPlayer() {
            //-- TODO : add email validation
            const player = User(
                null,
                this.playerForm.inputs.addedPlayerName.value,
                this.playerForm.inputs.addedPlayerEmail.value
            );
            const playerExists = this.players.find(
                (p) => p.name === this.playerForm.addedPlayerName
            );
            if (!playerExists) {
                this.players.push(player);
                this.playerForm.inputs.addedPlayerName.value = "";
                this.playerForm.inputs.addedPlayerEmail.value = "";
            }
        },
        editPlayer(event, player) {
            if (event) {
                player.previousName = player.name;
                player.name = event.target.value;
                this.edittingPlayer = null;
            } else {
                if (this.edittingPlayer) {
                    this.edittingPlayer = null;
                } else {
                    this.edittingPlayer = player;
                    this.$nextTick(() => this.$refs.editInput[0].focus());
                }
            }
        },
        removePlayer(player) {
            const index = this.players.indexOf(player);
            if (index >= 0) {
                this.players.splice(index, 1);
            }
        },
        playerExists(player) {
            return this.players.find((p) => p.name === player.addedPlayerName);
        },
    },
    mounted() {
        this.players = this.sheetDataList?.players || [];
    },
};
</script>

<style lang="less">
@import (less) "../styles/components/playersTable.less";
</style>
