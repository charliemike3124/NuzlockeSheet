<template>
    <span>
        <v-img
            class="rounded-circle d-inline-block"
            style="vertical-align: middle"
            v-if="photoURL"
            :src="photoURL"
            max-height="30"
            max-width="30"
        />
        <div
            v-else
            class="pa-4 rounded-circle d-inline-block p-rel"
            :style="generateIconStyle()"
            max-height="30"
            max-width="30"
        >
            <span class="profile-letters">
                {{ name.length > 2 ? name.substring(0, 2) : name }}
            </span>
        </div>
    </span>
</template>

<script>
export default {
    name: "UserProfilePic",

    props: {
        name: String,
        photoURL: String,
        email: String,
    },

    methods: {
        generateIconStyle() {
            const colors = this.Constants.PROFILE_ICON_COLORS;
            let color = colors[Math.floor(Math.random() * colors.length)];
            let styles = { verticalAlign: "middle", backgroundColor: color };
            return styles;
        },
    },
};
</script>

<style>
.profile-letters {
    position: absolute;
    top: 4px;
    right: 5px;
    text-transform: uppercase;
    font-weight: bold;
    color: white;
}
</style>
