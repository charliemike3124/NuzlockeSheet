<template>
  <div class="grey lighten-5">
    <v-toolbar dense color="primary" class="white--text">
        <v-menu
          bottom
          left
        >
          <template v-slot:activator="{ on, attrs }">
            <v-btn
              icon
              v-bind="attrs"
              v-on="on"
              color="white"
            >
              <v-icon>mdi-dots-vertical</v-icon>
            </v-btn>
          </template>

          <v-list>
            <v-list-item class="pointer" @click="onManagePlayersClick">
              <v-list-item-title> <i class="mdi mdi-account"></i> Manage players</v-list-item-title>
            </v-list-item>
            <v-list-item class="pointer" @click="onShareSheetClick">
              <v-list-item-title>  <i class="mdi mdi-share"></i> Share</v-list-item-title>
            </v-list-item>
            <v-list-item class="pointer" @click="onExitSheetClick">
              <v-list-item-title>  <i class="mdi mdi-subdirectory-arrow-left"></i> Exit</v-list-item-title>
            </v-list-item>
          </v-list>
        </v-menu>
        <v-toolbar-title class="mr-3">{{sheetDataList.title}}</v-toolbar-title>
        
    </v-toolbar>
    <div class="table-cont">
        <NuzlockeTable
        ref="sheetTable"
        :data="sheetData"
        @showSnackbar="showSnackbar"
        ></NuzlockeTable>
    </div>
    
    <v-footer
      class="mt-12"
      padless
    >
      <v-card
        flat
        tile
        width="100%"
        class="grey lighten-3 text-center"
      >
        <v-card-text class="black--text">
          <strong>{{ new Date().getFullYear() }} — Made by <a href="https://github.com/charliemike3124" target="_blank">Charlie Dev</a></strong>
        </v-card-text>
      </v-card>
    </v-footer>
    <!-- Modal -->
    <v-dialog
    v-model="dialog.show"
    width="500"
    >
      <v-card>
        <v-card-title class="text-h6 primary">
          <span class="white--text">{{dialog.title}}</span>
        </v-card-title> 
        
        <v-card-text class="mt-3">
          <v-row>
            <v-col>            
                <v-text-field
                v-model="addedPlayerName"
                class="ma-0"
                :class="addPlayerInputClass"
                label="Add a Player"
                outlined
                hide-details
                :append-outer-icon="'mdi-account-plus'"
                @click:append-outer="addPlayer"
                @keydown.prevent.enter="addPlayer"
                ></v-text-field>
            </v-col>
          </v-row>

        </v-card-text>

        <div class="mx-6 my-2">
          <v-simple-table dense v-if="players.length">
            <template v-slot:default>
              <thead>
                <th class="text-center">Player Name</th>
              </thead>
              <tbody>
                <tr
                  v-for="(player, index) in players"
                  :key="index"
                >
                  <td class="text-center">{{ player.name }}</td>
                  <td>
                    <v-btn icon @click="editPlayer(player)">
                      <v-icon>mdi-edit</v-icon>
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

        <v-divider></v-divider>

        <v-card-actions>
          <v-spacer></v-spacer>
          <v-btn
            color="primary"
            text
            @click="onSavePlayersClick"
          >
            Save
          </v-btn>
          <v-btn
            color="black"
            text
            @click="dialog.show = false"
          >
            Close
          </v-btn>
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
import {
  NuzlockeTable
} from '@/components'
import { mapActions, mapState } from 'vuex';

export default {
  name: 'Home',
  
  components: {
    NuzlockeTable
  },

  computed: {
    ...mapState('nuzlocke', ['sheetData', 'sheetDataList']),
    addPlayerInputClass(){
      let className = "";
      return className;
    },
  },

  data: () => ({
    addedPlayerName: '',
    players: [],
    dialog: {
      show: false,
      title: ''
    },
    snackbar: {
      show: false,
      text: '',
      color: ''
    }
  }),

  methods:{
    ...mapActions('nuzlocke', ['SetSheetData', 'GetSheetData', 'InitializeSheetDataList', 'SetPlayers']),
    ...mapActions('pokemon', ['SetPokemonListAsync']),
    addPlayer(){
      const player = {
        name: this.addedPlayerName
      }
      const playerExists = this.players.find(p => p.name === this.addedPlayerName);
      if(!playerExists && !!this.addedPlayerName){
        this.players.push({name: this.addedPlayerName});
        this.addedPlayerName = "";
      }
    },
    removePlayer(player){
      const index = this.players.indexOf(player);
      if(index >= 0 ){
        this.players.splice(index, 1);
      }
    },
    editPlayer(player){
      //TODO - Replace player name for input and then save.
    },
    showDialog(title){
      this.dialog.show = true;
      this.dialog.title = title;
    },
    closeDialog(){
      this.dialog.show = false;
    },
    showSnackbar(alert){
      this.snackbar.show = true;
      this.snackbar.text = alert.text;
      this.snackbar.color = alert.color;
      console.log(alert)
    },

    //--EVENT-HANDLERS--//
    onManagePlayersClick(){
      this.showDialog("Manage Players");
    },
    onShareSheetClick(){
      //TODO - Copy sheet route to clipboard
    },
    onSavePlayersClick(){
      this.SetPlayers(this.players);
      this.closeDialog();
    },
    onExitSheetClick(){
    },
  },
  async created(){
    this.SetPokemonListAsync();
    const dataExists = await this.GetSheetData();
    if(!dataExists){
      await this.InitializeSheetDataList(['Test Title', []]); //TODO - get these params from welcome page
    }
    this.players = this.sheetDataList.players;
  }
}
</script>
<style lang="less">
  @import (less) "../styles/views/sheet.less";
</style>

