<script setup lang="ts">
import { ref, onMounted } from 'vue';
import { getAutoMixState, setAutoMixState } from "./utils.mjs";
import { getEnsureTheatreModeValue, clearPlayedVideos, videoIdIntoUrl, navigateToUrl } from "./popup_utils.mjs";

const ensureTheatreMode = ref(false);
const nextVideoId = ref("");
const nextVideoTitle = ref("");

chrome.runtime.onMessage.addListener(async (msg: PopupMessage, _sender, _sendResponse) => {
    console.log(`AutoMixPopup; Vue Message => `);
    console.log(msg);
    if (msg.ensureTheatreMode !== undefined) ensureTheatreMode.value = msg.ensureTheatreMode;
});

async function toggleEnsureTheatreMode() {
    const state = await getAutoMixState();
    state.ensureTheatreMode = !state.ensureTheatreMode;
    console.log(`AutoMixPopup; toggleEnsureTheatreMode => ${state.ensureTheatreMode}`);
    await setAutoMixState(state);
}

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
            <a class="link link-secondary" :href="videoIdIntoUrl(nextVideoId)"
                @click="navigateToUrl(videoIdIntoUrl(nextVideoId))">
                {{ nextVideoTitle }}
            </a>
        </div>
        <div class=" divider" />
        <div class="form-control">
            <label class="label cursor-pointer mr-auto">
                <span class="label-text pr-2">Ensure Theatre Mode:</span>
                <input class="checkbox" @click="toggleEnsureTheatreMode" v-model="ensureTheatreMode"
                    name="ensureTheatreMode" type="checkbox" checked="true" />
            </label>
        </div>
        <button class="btn btn-sm btn-secondary" @click="clearPlayedVideos">Clear played videos</button>
    </div>
</template>

<script lang="ts">
</script>
