<template>
    <div>
        <div class="mt-3">
            <span class="font-weight-bold">Add a Player</span>
        </div>
        <div class="mt-3 player-form">
            <v-form>
                <v-text-field
                    v-model="addedPlayerName"
                    class="mt-1"
                    :class="addPlayerInputClass"
                    label="Player Name *"
                    outlined
                    hide-details
                    @keydown.prevent.enter="addPlayer"
                ></v-text-field>
                <v-text-field
                    v-model="addedPlayerName"
                    class="mt-1"
                    :class="addPlayerInputClass"
                    label="Email *"
                    outlined
                    hide-details
                    @keydown.prevent.enter="addPlayer"
                ></v-text-field>
            </v-form>
        </div>

        <div class="mx-6 my-2">
            <v-simple-table dense v-if="players.length">
                <template v-slot:default>
                    <thead>
                        <th class="text-center">Player Name</th>
                    </thead>
                    <tbody>
                        <tr v-for="(player, index) in players" :key="index">
                            <td class="text-center">
                                <span v-if="edittingPlayer !== player">{{
                                    player.name
                                }}</span>
                                <v-text-field
                                    ref="editInput"
                                    class="pa-0"
                                    v-else
                                    :value="player.name"
                                    hide-details
                                    @keydown.prevent.enter="
                                        editPlayer($event, player)
                                    "
                                >
                                </v-text-field>
                            </td>
                            <td>
                                <v-btn
                                    icon
                                    :style="
                                        edittingPlayer === player
                                            ? 'color: orange'
                                            : ''
                                    "
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
            edittingPlayer: null,
        };
    },
    methods: {
        addPlayer() {
            const player = {
                name: this.addedPlayerName,
            };
            const playerExists = this.players.find(
                (p) => p.name === this.addedPlayerName
            );
            if (!playerExists && !!this.addedPlayerName) {
                this.players.push(player);
                this.addedPlayerName = "";
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
    },
    mounted() {
        this.players = this.sheetDataList?.players || [];
    },
};
</script>

<style lang="less">
@import (less) "../styles/components/playersTable.less";
</style>
