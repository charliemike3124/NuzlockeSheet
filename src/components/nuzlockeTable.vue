<template>
  <v-data-table
    dense
    :headers="tableData.headers"
    :items="tableData.rows"
    :show-select="false"
    :loading="loadingData"
    item-key="name"
    class="elevation-1"
    hide-default-footer
  >
    <template v-slot:item.actions="{ item }">
      <v-icon
        small
        class="mr-2"
        @click="editItem(item)"
      >
        mdi-pencil
      </v-icon>
      <v-icon
        small
        @click="deleteItem(item)"
      >
        mdi-delete
      </v-icon>
    </template>
  </v-data-table>
</template>

<script>

  export default {
    name: 'NuzlockeTable',
    props: {
      data: {
        required: true,
        default: {}
      }
    },
    data: () => ({
      loadingData: false,
      tableData: null,
    }),

    methods: {      
      deleteItem (item) {
        const editedIndex = this.tableData.rows.indexOf(item);   
        this.tableData.rows.splice(editedIndex, 1);
      },
    },

    created(){
      this.tableData = this.data;      
    }
  }
</script>

<style lang="less">

</style>
