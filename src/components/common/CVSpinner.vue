<template>
    <div class="d-flex flex-column justify-center align-center max-height spinner">
        <v-progress-circular indeterminate :color="color"></v-progress-circular>
        <div class="mt-4">
            <slot>{{ text }}</slot>
        </div>
    </div>
</template>

<script>
export default {
    name: "CVSpinner",
    props: {
        text: String,
        color: String,
    },
};
</script>

<style scoped>
.spinner {
    flex: auto;
}
</style>
