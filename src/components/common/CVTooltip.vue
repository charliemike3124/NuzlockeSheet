<template>
    <v-tooltip bottom>
        <template v-slot:activator="{ on, attrs }">
            <span v-bind="attrs" v-on="on">
                <slot></slot>
            </span>
        </template>
        {{ text }}
    </v-tooltip>
</template>

<script>
export default {
    name: "CVTooltip",
    props: {
        text: String,
    },
};
</script>
