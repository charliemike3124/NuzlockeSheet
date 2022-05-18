<template>
    <v-autocomplete
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
                <img :src="item[`${prop.value}`].sprite" />
            </div>
            <div class="d-inline-block">
                <span v-bind="data.attrs">
                    {{ data.item.name }}
                    {{ data.item.nickname ? `(${data.item.nickname})` : "" }}
                </span>
                <div v-if="!!item[`${prop.value}`]">
                    <CVTooltip
                        :text="type.type.name"
                        v-for="(type, index) in item[`${prop.value}`].types"
                        :key="index"
                    >
                        <img :src="GeneralHelpers.requireImage(`types_icons/${type.type.name}.png`)" />
                    </CVTooltip>
                </div>
            </div>
        </template>
    </v-autocomplete>
</template>

<script>
import { CVTooltip } from "@/components/common";
import { mapState } from "vuex";
export default {
    name: "PokemonSelect",
    components: { CVTooltip },
    props: {

    },
    computed: {
        ...mapState("pokemon", ["pokemonList"]),

    }
}
</script>

<style>

</style>