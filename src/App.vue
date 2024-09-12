<script setup lang="ts">
import { ref, onMounted } from 'vue';
import { getAutoMixState, setAutoMixState } from "./utils.mjs";
import { getEnsureTheatreModeValue, getEnsureHighestQualityValue, getPlayedVideosCount, clearPlayedVideos, videoIdIntoUrl, navigateToUrl } from "./popup_utils.mjs";

const ensureTheatreMode = ref(false);
const ensureHighestQuality = ref(false);
const nextVideoId = ref("");
const nextVideoTitle = ref("");
const playedVideosCount = ref(0);

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

async function toggleEnsureHighestQuality() {
    const state = await getAutoMixState();
    state.ensureHighestQuality = !state.ensureHighestQuality;
    console.log(`AutoMixPopup; ensureHighestQuality => ${state.ensureHighestQuality}`);
    await setAutoMixState(state);
}

async function onClearPlayedVideosClick() {
    await clearPlayedVideos();
    playedVideosCount.value = await getPlayedVideosCount();
}

onMounted(() => {
    getEnsureTheatreModeValue().then(
        (checked) => ensureTheatreMode.value = checked
    );
    getEnsureHighestQualityValue().then(
        (checked) => ensureHighestQuality.value = checked
    );
    getPlayedVideosCount().then(
        count => playedVideosCount.value = count
    )
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
        <div class="divider" />
        <div class="form-control">
            <label class="label cursor-pointer mr-auto">
                <span class="label-text pr-2">Ensure Theatre Mode:</span>
                <input class="checkbox" @click="toggleEnsureTheatreMode" v-model="ensureTheatreMode"
                    name="ensureTheatreMode" type="checkbox" checked="true" />
            </label>
        </div>
        <div class="form-control">
            <label class="label cursor-pointer mr-auto">
                <span class="label-text pr-2">Ensure Highest Quality:</span>
                <input class="checkbox" @click="toggleEnsureHighestQuality" v-model="ensureHighestQuality"
                    name="ensureHighestQuality" type="checkbox" checked="true" />
            </label>
        </div>
        <div class="divider" />
        <button class="btn btn-sm btn-secondary" @click="onClearPlayedVideosClick">Clear played videos</button>
        <span class="pl-2"> ({{ playedVideosCount }}) </span>
    </div>
</template>

<script lang="ts">
</script>
