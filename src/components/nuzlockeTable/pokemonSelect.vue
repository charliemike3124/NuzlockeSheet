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
                            {{ buildPokemonName(item[`${prop.value}`]) }}
                        </span>
                        <CVTooltip :text="'Edit nickname'">
                            <v-icon
                                small
                                class="edit-name"
                                @click.prevent.stop="onEditPokemonName(item, prop.value)"
                            >
                                mdi-pencil
                            </v-icon>
                        </CVTooltip>
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
        >
            <template v-slot:append-outer>
                <v-icon @click="editPokemonName(item, prop.value)" size="25" color="primary">
                    mdi-check
                </v-icon>
            </template>
        </v-text-field>
    </div>
</template>

<script>
import { CVTooltip } from "@/components/common";
import { mapState, mapActions } from "vuex";
import pokemonModule from "../../store/modules/pokemonModule";
export default {
    name: "pokemonSelect",
    components: { CVTooltip },
    props: {
        item: Object,
        prop: Object,
    },
    computed: {
        ...mapState("pokemon", ["pokemonList"]),
        ...mapState("nuzlocke", ["isCurrentPlayerInvited", "sheetData", "currentDocumentId"]),
        ...mapState("sheets", ["currentDocumentId"]),
    },

    data() {
        return {
            editingNickname: false,
            pokemonNickname: "",
        };
    },

    methods: {
        ...mapActions("nuzlocke", ["SetSheetData"]),

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
            const sheetIndex = this.sheetData.rows.indexOf(item);
            let sheetData = this.GeneralHelpers.deepCopy(this.sheetData);
            sheetData.rows[sheetIndex][prop].nickname = this.pokemonNickname;
            this.SetSheetData([sheetData, this.currentDocumentId]);
            this.editingNickname = false;
        },

        removeInputAutocomplete() {
            if (this.$refs?.autoComplete?.length) {
                let input = ref?.$el.querySelector("input");
                input.autocomplete = false;
            }
        },

        buildPokemonName(pokemon) {
            let name = pokemon.name;
            if ("nickname" in pokemon) {
                name = pokemon.nickname ? pokemon.nickname : pokemon.name;
            }
            return name;
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
        transition-duration: 250ms;
        &:hover {
            transform: scale(2.75);
        }
    }
}

.edit-name {
    z-index: 1;
    cursor: pointer;
}
.nickname-input {
    z-index: 1;
}
</style>
