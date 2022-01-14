<template>
  <div class="grey lighten-5">
    <v-toolbar dense>
        <v-toolbar-title class="mr-3">{{sheetData.title}}</v-toolbar-title>

        <v-tooltip>
          <template v-slot:activator="{ on, attrs }">            
            <v-btn
            icon
            v-bind="attrs"
            v-on="on"
            @click="onManagePlayersClick"
            >
                <v-icon>mdi-account-plus</v-icon>
            </v-btn>
          </template>
          <span>Add player</span>
        </v-tooltip>
        
        <v-text-field
        v-show="showAddPlayerInput"
        v-model="addedPlayerName"
        class="ma-0 add-player-input"
        :class="addPlayerInputClass"
        label="Player Name"
        solo
        hide-details
        @keydown.enter="onAddPlayerInputEnter"
        ></v-text-field>

      <v-spacer></v-spacer>

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
    </v-toolbar>
    <div class="table-cont">
        <NuzlockeTable
        :data="sheetData"
        ></NuzlockeTable>
    </div>
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
    onAddPlayerInputEnter(){

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

  }),

  methods:{
      onManagePlayersClick(){
        this.showAddPlayerInput = !this.showAddPlayerInput;
      },
      onExitSheetClick(){
        this.sheetData.headers.push({
          text: this.addedPlayerName,
          value: this.addedPlayerName,
          sortable: true,
        })
        this.rows = this.rows.map(item => {
          return {
            
          }
        })
        this.addedPlayerName = "";
      }
  },

  mounted(){
  }
}
</script>
<style lang="less">
  @import (less) "../styles/views/sheet.less";
</style>

