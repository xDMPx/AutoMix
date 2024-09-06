<script setup lang="ts">
import { ref, onMounted } from 'vue';
import { getAutoMixState, setAutoMixState } from "./utils.mjs";

const ensureTheatreMode = ref(false);
const nextVideoId = ref("");

async function clearPlayedVideos() {
    console.log(`AutoMixPopup; Clearing played videos`);
    const state = await getAutoMixState();
    state.playedVideos = [];
    await setAutoMixState(state);
}

async function getEnsureTheatreModeValue(): Promise<boolean> {
    const state = await getAutoMixState();
    return state.ensureTheatreMode;
}

chrome.runtime.onMessage.addListener(async (msg: PopupMessage, _sender, _sendResponse) => {
    console.log(`AutoMixPopup; Vue Message => `);
    console.log(msg);
    if (msg.ensureTheatreMode !== undefined) ensureTheatreMode.value = msg.ensureTheatreMode;
});


onMounted(() => {
    getEnsureTheatreModeValue().then(
        (checked) => { ensureTheatreMode.value = checked; console.log(`vue ${checked}`); }

    );
    getAutoMixState().then(
        (s) => nextVideoId.value = (s.nextVideoId) ? s.nextVideoId : ""
    );
});
</script>


<template>
    <div>Next:<br>
        <a id="next-video-id" :href="`https://www.youtube.com/watch?v=${nextVideoId}`">{{ nextVideoId}}</a>
    </div>
    <div>
        <label for="ensureTheatreMode">Ensure Theatre Mode:</label>
        <input type="checkbox" name="ensureTheatreMode" id="ensureTheatreMode" v-model="ensureTheatreMode" disabled>
    </div>
    <button type="button" @click="clearPlayedVideos" id="clear-played-button">Clear played videos</button>
</template>

<script lang="ts">
</script>
