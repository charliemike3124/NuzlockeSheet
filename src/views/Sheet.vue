<template>
  <div class="grey lighten-5">
    <v-toolbar dense>
        <v-menu
          bottom
          left
        >
          <template v-slot:activator="{ on, attrs }">
            <v-btn
              icon
              v-bind="attrs"
              v-on="on"
            >
              <v-icon>mdi-dots-vertical</v-icon>
            </v-btn>
          </template>

          <v-list>
            <v-list-item class="pointer" @click="onManagePlayersClick">
              <v-list-item-title> <i class="mdi mdi-account"></i> Manage players</v-list-item-title>
            </v-list-item>
            <v-list-item class="pointer" @click="onExitSheetClick">
              <v-list-item-title>  <i class="mdi mdi-subdirectory-arrow-left"></i> Exit sheet</v-list-item-title>
            </v-list-item>
          </v-list>
        </v-menu>
        <v-toolbar-title class="mr-3">{{sheetData.title}}</v-toolbar-title>
        
    </v-toolbar>
    <div class="table-cont">
        <NuzlockeTable
        :data="sheetData"
        ></NuzlockeTable>
    </div>

    <!-- Modal -->
    <v-dialog
    v-model="dialog.show"
    width="500"
    >
      <v-card>
        <v-card-title class="text-h6 primary lighten-2">
          <span class="white--text">{{dialog.title}}</span>
        </v-card-title> 

        <div class="pd-2 flex">
          <div>            
              <v-text-field
              v-model="addedPlayerName"
              class="ma-0 add-player-input"
              :class="addPlayerInputClass"
              label="Player Name"
              solo
              elevation="0"
              hide-details
              @keydown.prevent="addPlayer"
              ></v-text-field>
          </div>
          <div>
              <v-btn icon @click="addPlayer">
                <v-icon >mdi-account-plus</v-icon>
              </v-btn>
          </div>
        </div>

        <v-simple-table dense v-if="players.length">
          <template v-slot:default>
            <thead>
              <th>Player Name</th>
              <th></th>
            </thead>
            <tbody>
              <tr
                v-for="(player, index) in players"
                :key="index"
              >
                <td>{{ player.name }}</td>
                <td> 
                  <v-btn icon @click="removePlayer(player)">
                    <v-icon>mdi-close</v-icon>
                  </v-btn> 
                </td>
              </tr>
            </tbody>
          </template>          
        </v-simple-table>

        <v-divider></v-divider>

        <v-card-actions>
          <v-spacer></v-spacer>
          <v-btn
            color="primary"
            text
            @click="dialog.show = false"
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
  </div>
</template>

<script>
import {
  NuzlockeTable
} from '@/components'
export default {
  name: 'Home',
  
  components: {
    NuzlockeTable
  },

  computed: {
    addPlayerInputClass(){
      let className = "";
      return className;
    },
    addPlayer(ev){
      console.log(ev)
      //Method might be called from Enter input or clicking a btn.
      if(ev?.keyCode === 13 || !ev.keyCode){
        this.players.push({
          name: this.addedPlayerName
        })
      }
    }
  },

  data: () => ({
    sheetData: {
        title: "Test Sheet Title",
        headers: [
            {
                text: 'Area',
                value: 'area',
            },
            {
                text: 'Actions',
                value: 'actions',
                sortable: false
            },
        ],
        rows: [
            {
            area: 'Route 1',
            oso: 'Pikachu',
            cabe: 'Bulbasaur',
            actions: '',
            },
        ],
    },
    addedPlayerName: '',
    showAddPlayerInput: false,
    dialog: {
      show: false,
      title: ''
    },
    players: [

    ]
  }),

  methods:{
      onManagePlayersClick(){
        this.dialog.show = true;
        this.dialog.title = "Manage Players";
      },
      onExitSheetClick(){
      }
  },

  mounted(){
  }
}
</script>
<style lang="less">
  @import (less) "../styles/views/sheet.less";
</style>

