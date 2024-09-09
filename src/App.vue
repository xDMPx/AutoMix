<script setup lang="ts">
import { ref, onMounted } from 'vue';
import { getAutoMixState, setAutoMixState } from "./utils.mjs";

const ensureTheatreMode = ref(false);
const nextVideoId = ref("");
const nextVideoTitle = ref("");

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
        (checked) => ensureTheatreMode.value = checked
    );
    getAutoMixState().then(
        (s) => {
            nextVideoId.value = (s.nextVideoId) ? s.nextVideoId : "";
            nextVideoTitle.value = (s.nextVideoTitle) ? s.nextVideoTitle : "";
        }
    );
});
</script>

<template>
    <div class="w-full h-full table p-2">
        <div>Next:<br>
            <a class="link link-secondary" :href="`https://www.youtube.com/watch?v=${nextVideoId}`">
                {{ nextVideoTitle }}
            </a>
        </div>
        <div class="divider" />
        <div class="form-control">
            <label class="label cursor-pointer mr-auto">
                <span class="label-text pr-2">Ensure Theatre Mode:</span>
                <input class="checkbox" name="ensureTheatreMode" type="checkbox" disabled checked="true" />
            </label>
        </div>
        <button class="btn btn-sm btn-secondary" @click="clearPlayedVideos">Clear played videos</button>
    </div>
</template>

<script lang="ts">
</script>
