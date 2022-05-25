<template>
    <div>
        <v-autocomplete
            v-if="!editingNickname"
            ref="autoComplete"
            item-text="name"
            dense
            hide-details
            :items="pokemonList"
            :value="getSelectedPokemon(item[`${prop.value}`])"
            :disabled="!isCurrentPlayerInvited"
            @change="onPokemonSelect($event, prop.value, item)"
        >
            <template v-slot:selection="data">
                <div v-if="!!item[`${prop.value}`]" class="pokemon-row d-inline-block">
                    <img
                        :src="item[`${prop.value}`].sprite"
                        @click.prevent.stop="onImgClick(item[`${prop.value}`].name)"
                    />
                </div>
                <div class="d-inline-block">
                    <div>
                        <span v-bind="data.attrs" v-if="!editingNickname">
                            {{ data.item.name }}
                            {{ data.item.nickname ? `(${data.item.nickname})` : "" }}
                        </span>
                        <v-icon
                            small
                            class="edit-name"
                            @click.prevent.stop="onEditPokemonName(item, prop.value)"
                        >
                            mdi-pencil
                        </v-icon>
                    </div>
                    <div v-if="!!item[`${prop.value}`]">
                        <CVTooltip
                            :text="type.type.name"
                            v-for="(type, index) in item[`${prop.value}`].types"
                            :key="index"
                        >
                            <img
                                :src="
                                    GeneralHelpers.requireImage(`types_icons/${type.type.name}.png`)
                                "
                            />
                        </CVTooltip>
                    </div>
                </div>
            </template>
        </v-autocomplete>

        <!--Nickname Text Field-->
        <v-text-field
            v-else
            v-model="pokemonNickname"
            class="nickname-input"
            label="Nickname"
            hide-details
            autofocus
            @keydown.enter="editPokemonName(item, prop.value)"
        ></v-text-field>
    </div>
</template>

<script>
import { CVTooltip } from "@/components/common";
import { mapState, mapActions } from "vuex";
export default {
    name: "pokemonSelect",
    components: { CVTooltip },
    props: {
        item: Object,
        prop: Object,
    },
    computed: {
        ...mapState("pokemon", ["pokemonList"]),
        ...mapState("nuzlocke", ["isCurrentPlayerInvited", "sheetData"]),
    },

    data() {
        return {
            editingNickname: false,
            pokemonNickname: "",
        };
    },

    methods: {
        ...mapState("nuzlocke", ["SetSheetData"]),

        getSelectedPokemon(pokemon) {
            return this.pokemonList.find((pok) => pok.name === pokemon?.name);
        },

        onPokemonSelect(name, prop, row) {
            this.$emit("onPokemonSelect", [name, prop, row]);
        },

        onImgClick(pokemonName) {
            const name = pokemonName[0].toUpperCase() + pokemonName.slice(1);
            window.open(`${this.GeneralHelpers.getBulbapediaBaseUrl()}/${name}`, "_blank");
        },

        onEditPokemonName(item, prop) {
            this.editingNickname = true;
            this.pokemonNickname = item[prop].nickname;
        },

        editPokemonName(item, prop) {
            let sheetData = this.GeneralHelpers.deepCopy(this.sheetData);
            const sheetIndex = this.sheetData.rows.indexOf(item);
            let newItem = sheetData.rows[sheetIndex];
            newItem[prop].nickname = this.pokemonNickname;
            sheetData.rows[sheetIndex][prop] = newItem || null;
            this.SetSheetData([sheetData, this.currentDocumentId]);
            this.editingNickname = false;
        },

        removeInputAutocomplete() {
            if (this.$refs?.autoComplete?.length) {
                let input = ref?.$el.querySelector("input");
                input.autocomplete = false;
            }
        },
    },

    mounted() {
        this.removeInputAutocomplete();
    },
};
</script>

<style lang="less" scoped>
.pokemon-row {
    padding: 5px 0;
    img {
        transform: scale(2.5);
        margin-right: 20px;
        margin-bottom: 5px;
        width: 25px;
        z-index: 1001;
        cursor: pointer;
    }
}

.edit-name {
    z-index: 1001;
    cursor: pointer;
}
.nickname-input {
    z-index: 1001;
}
</style>
