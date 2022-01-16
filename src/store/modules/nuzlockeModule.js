import { MutationsHelper } from "@/store/helper";
import { PokemonGens } from '@/resources';

const state = {
    sheetData: {
        headers: [],
        rows: [],
    },
    sheetDataList: {
        title: "",
        selectedSheet: 0,
        players: [],
        dataSheets: []
    },
    selectedGame: '',
}

const mutations = {
    setSheetData: MutationsHelper.set("sheetData"),
    setSheetDataList: MutationsHelper.set("sheetDataList"),
    setSheetGame: MutationsHelper.set("selectedGame"),
}

const actions = {
    SetPlayers( {commit, state, dispatch}, players){
        //Add player props to every sheet's header in the list.
        let sheetDataList = state.sheetDataList;
        sheetDataList.players = players;
        sheetDataList.dataSheets.map( sheet => {
            const locationHeader = sheet.headers[0];
            const nonPlayerHeaders = sheet.headers.splice(1).filter(item => !item.isPlayer);
            let playerHeaders = [];
            players.forEach(player => { 
              playerHeaders.push({
                text: player.name,
                value: player.name,
                sortable: true,
                isPlayer: true,
              })
            })
      
            let headers = [
              locationHeader,
              ...playerHeaders,
              ...nonPlayerHeaders,
            ];

            sheet.headers = headers;
        })

        dispatch("SetSheetData", sheetDataList.dataSheets[sheetDataList.selectedSheet]);
        commit("setSheetDataList", sheetDataList);   
    },
    SetSheetGame( { commit, state, dispatch }, game){
        commit("setSheetGame", game);   
        const index = PokemonGens.names.indexOf(game);

        let sheetDataList = state.sheetDataList;
        sheetDataList.dataSheets[sheetDataList.selectedSheet] = state.sheetData;
        sheetDataList.selectedSheet = index;

        let selectedSheetData = state.sheetDataList.dataSheets[index];

        dispatch("SetSheetData", selectedSheetData);
        commit("setSheetDataList", sheetDataList);   
    },

    SetSheetData( { commit }, sheetData){
        commit("setSheetData", sheetData);
    },
    GetSheetData( { commit, dispatch } ){
        const sheetDataList = JSON.parse(localStorage.getItem(storageKeys.sheetDataList));
        if(!!sheetDataList){
            commit("setSheetDataList", sheetDataList);
            dispatch("SetSheetData", sheetDataList.dataSheets[sheetDataList.selectedSheet]);
        }
        return !!sheetDataList;
    },
    SaveSheetData( { state, commit }){
        //TODO- save to firebase as well 
        let sheetDataList = state.sheetDataList;
        sheetDataList.dataSheets[sheetDataList.selectedSheet] = state.sheetData;
        localStorage.setItem(storageKeys.sheetDataList, JSON.stringify(sheetDataList));
        commit("setSheetDataList", sheetDataList); 
    },
    RemoveSheetDataItem( {dispatch, state}, item){
        //remove row from sheetData
        let result = state.sheetData;
        const index = result.rows.indexOf(item);
        if (index > -1) {
            result.rows.splice(index, 1);
        }
        dispatch("SetSheetData", result);
    },
    AddCustomRow( { state, dispatch }, selectedRow){
        //Add properties according to which players exist.
        let result = state.sheetData;
        let row = { 
            location: {
                name: "", 
                isCustom: true
            } 
        };
        state.sheetDataList.players.forEach(p => {
            row[p.name] = "";
        })
        row.actions = "";

        const insertIndex = result.rows.indexOf(selectedRow);
        if(insertIndex === result.rows.length - 1){
            result.rows.push(row);
        }
        else{
            result.rows.splice(insertIndex + 1, 0, row);
        }

        dispatch("SetSheetData", result);
    },
    InitializeSheetDataList( { commit, dispatch }, [title, players] ){
        const defaultSelectedSheetIndex = 0;
        let sheetDataList = {
            title: title,
            selectedSheet: defaultSelectedSheetIndex,
            players: players,
            dataSheets: []
        };
        let playerHeaders = [];
        players.forEach(player => { 
          playerHeaders.push({
            text: player.name,
            value: player.name,
            sortable: true,
            isPlayer: true,
          })
        })

        PokemonGens.routes.forEach((routeList, index) => {
            sheetDataList.dataSheets.push({
                headers: [
                    {
                        text: 'Location',
                        value: 'location',
                    },
                    ...playerHeaders,
                    {
                        text: 'Actions',
                        value: 'actions',
                        sortable: false,
                    },
                ],
                rows: [],
            })
            routeList.forEach(routeName => {
                sheetDataList.dataSheets[index].rows.push(
                    {
                        location: {
                            name: routeName,
                            isCustom: false,
                        },
                        actions: '',
                    },
                )
            })
        })        

        commit("setSheetDataList", sheetDataList)
        dispatch("SetSheetData", sheetDataList.dataSheets[defaultSelectedSheetIndex]);
        dispatch("SaveSheetData", sheetDataList);
    },
    ResetCurrentSheet( {state, dispatch} ){        
        let sheetData = state.sheetData;
        sheetData.rows = sheetData.rows.map(row => {
            let result = {
                location: row.location,
                actions: row.actions,
            }
            state.sheetDataList.players.forEach(player => {
                result[player.name] = "";
            })
            return result;
        })
        dispatch("SetSheetData", sheetData);
    }
}

//-- Not Exported --//
const storageKeys = {
    sheetDataList: "sheetDataList"
}
//-----------------//
export default {
    namespaced: true,
    state,
    mutations,
    actions,
}