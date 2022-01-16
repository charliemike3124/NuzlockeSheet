<template>
  <v-data-table
    :headers="data.headers"
    :items="data.rows"
    :show-select="false"
    :loading="loadingData"
    :item-class="itemClass"
    dense
    item-key="name"
    class="elevation-1"
    hide-default-footer
    calculate-widths
    :options="tableOptions"
  >
    <template v-slot:top>      
      <v-row class="ma-2" justify="start">
        <v-col>
          <v-select
            class="pt-0"
            :items="pokemonGames"
            :menu-props="{ top: false, offsetY: true }"
            v-model="selectedGame"
            label="Game"
            hide-details
            prepend-icon="mdi-pokeball"
            single-line
            @change="onSelectGame"
          ></v-select>
        </v-col>
        <v-col>
          <div class="d-flex justify-end">
            <div v-for="(action, index) in topActions" :key="index" align-self="end">
              <v-tooltip bottom>
                <template v-slot:activator="{ on, attrs }">
                  <v-btn
                    v-on="on"
                    v-bind="attrs"
                    icon
                    class="mr-2"
                    :color="action.toggleColor"
                    @click="callMethodByName(action.eventHandler)"
                  >
                    <v-icon>{{action.icon}}</v-icon>
                  </v-btn>
                </template>
                <span>{{action.tooltip}}</span>
              </v-tooltip>
            </div>
          </div>
        </v-col>
      </v-row>
    </template>

    <template v-slot:item.location="{ item }">
      <a  
      v-if="!item.location.isCustom"
      :href="`${bulbapediaBaseURL}/${item.location.name}`" 
      target="_blank"
      > 
        {{item.location.name}}
      </a>
      <span v-else> {{item.location.name}} </span>
    </template>

    <template v-for="prop in playerHeaders" v-slot:[`item.${prop.value}`]="{ item }">
      <v-autocomplete
        :items="pokemonList"
        :value="getSelectedPokemon(item[`${prop.value}`])"
        item-text="name"
        dense
        hide-details
        @change="onPokemonSelect($event, prop.value, item)"
      >
        <template v-slot:selection="data">
          <span v-bind="data.attrs">
            {{data.item.name}} {{data.item.nickname ? `(${data.item.nickname})` : ''}}
          </span>
        </template>
      </v-autocomplete>
    </template>

    <template v-slot:item.actions="{ item }">
      <v-tooltip bottom>
        <template v-slot:activator="{ on, attrs }">
          <v-icon
            :class="item.rowStatus === 'dead' ? 'icon-active' : ''"
            v-bind="attrs"
            v-on="on"
            small
            @click="toggleDeadStatus(item)"
          >
            mdi-skull
          </v-icon>
        </template>
        Mark as dead
      </v-tooltip>
      <v-tooltip bottom>
        <template v-slot:activator="{ on, attrs }">
            <v-icon
            class="mr-5"
              v-bind="attrs"
              v-on="on"
              small
              @click="showPokemonData(item)"
            >
              mdi-help
            </v-icon>
        </template>
        Show Pokemon data
      </v-tooltip>


      <v-tooltip bottom>
        <template v-slot:activator="{ on, attrs }">
          <v-icon
            v-bind="attrs"
            v-on="on"
            small
            @click="addRow(item)"
          >
            mdi-plus
          </v-icon>
        </template>
        Add row below
      </v-tooltip>      
      <v-tooltip bottom>
        <template v-slot:activator="{ on, attrs }">
          <v-icon
            v-bind="attrs"
            v-on="on"
            small
            :disabled="data.rows.indexOf(item) === 0"
            @click="deleteItem(item)"
          >
            mdi-delete
          </v-icon>
        </template>
        Delete Row
      </v-tooltip>
    </template>

    <template v-slot:no-data>
      <span>Add some routes to this sheet!</span>
    </template>
  </v-data-table>
</template>

<script>

import { mapActions, mapState } from 'vuex';
import { SnackbarAlerts, PokemonGens } from '@/resources';
  export default {
    name: 'NuzlockeTable',
    props: {
      data: {
        required: true,
        default: {},
      },
    },
    computed: {
      ...mapState("pokemon", ["pokemonList"]),
      playerHeaders(){
        return this.data.headers.filter( item => item.isPlayer);
      },
    },
    data: () => ({
      loadingData: false,
      bulbapediaBaseURL: "https://bulbapedia.bulbagarden.net/wiki",
      pokemonGames: PokemonGens.names,
      selectedGame: PokemonGens.names[0],
      topActions: [
        {
          name: 'save',
          icon: 'mdi-content-save',
          tooltip: 'Save',
          toggleColor: 'primary',
          eventHandler: 'saveSheet',
        },
        {
          name: 'clean',
          icon: 'mdi-eraser',
          tooltip: 'Reset sheet',
          toggleColor: '',
          eventHandler: 'resetSheet',
        },
      ],
      tableOptions: {
        itemsPerPage: 2000
      }
    }),

    methods: {     
      ...mapActions('nuzlocke', ['SetSheetData', 'RemoveSheetDataItem', 'AddCustomRow', 'SetSheetGame', 'SaveSheetData', 'ResetCurrentSheet']),
      ...mapActions('pokemon', ['GetPokemonDataAsync', 'UpdatePokemonListByNameAsync']),
      itemClass(item){
        let className = item?.rowStatus === 'dead' ? 'row-dead' : ''; 
        return className;
      },
      addRow(selectedRow){
        this.AddCustomRow(selectedRow);
      },
      deleteItem (item) {
        this.RemoveSheetDataItem(item);
      },
      toggleDeadStatus(item){
        let sheetData = JSON.parse(JSON.stringify( this.data));
        const index = this.data.rows.indexOf(item);
        sheetData.rows[index].rowStatus = sheetData.rows[index].rowStatus === 'dead' ? 'alive' : 'dead';
        this.SetSheetData(sheetData);
      },
      onSelectGame(){
        this.SetSheetGame(this.selectedGame);
      },
      showPokemonData(item){
        console.log(item)
        window.open(`${this.bulbapediaBaseURL}/${item.name}`, '_blank');
      },
      saveSheet(){
        this.SaveSheetData();
        this.$emit("showSnackbar", SnackbarAlerts.sheetSaved);
      },
      resetSheet(){
        //TODO - show confirmation dialog and add reset logic (only erases player pokemon)
        this.ResetCurrentSheet();
      },
      async onPokemonSelect(name, prop, row){
        let pokemon = await this.UpdatePokemonListByNameAsync(name);
        let sheetData = JSON.parse(JSON.stringify( this.data));
        const index = this.data.rows.indexOf(row);
        sheetData.rows[index][prop] = pokemon;
        this.SetSheetData(sheetData);
      },
      getSelectedPokemon(pokemon){
        return this.pokemonList.find(pok => pok.name === pokemon?.name);
      },
      callMethodByName(name){
        this[name]();
      },
    }
  }
</script>

<style lang="less">
  .v-input__slot{
    &::before{
      border-color: transparent !important;
    }
  }
  .pokemon-row{
    padding: 5px 0;
    img{
      transform: scale(2.5);
      margin-right: 10px;
    }
  }
  .icon-active{
    color: orange !important;
  }
  .row-dead{
    background-color: rgb(250, 120, 120) !important;
  }
</style>
