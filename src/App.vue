<script setup lang="ts">
import browser from "webextension-polyfill";
import { ref, onMounted } from 'vue';
import { PopupMessage } from "./interfaces.mjs";
import { getAutoMixState, setAutoMixState, videoIdIntoUrl } from "./utils.mjs";
import { getEnsureTheatreModeValue, getEnsureHighestQualityValue, getPlayedVideosCount, clearPlayedVideos, navigateToUrl, videoIdIntoThumbnailUrl } from "./popup_utils.mjs";

const ensureTheatreMode = ref(false);
const ensureHighestQuality = ref(false);
const nextVideoId = ref("");
const nextVideoTitle = ref("");
const playedVideosCount = ref(0);

browser.runtime.onMessage.addListener(async (_msg, _sender, _sendResponse) => {
    const msg = _msg as PopupMessage;
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

function onMountedHook() {
    getEnsureTheatreModeValue().then(
        (checked) => ensureTheatreMode.value = checked
    );
    getEnsureHighestQualityValue().then(
        (checked) => ensureHighestQuality.value = checked
    );
    getPlayedVideosCount().then(
        count => playedVideosCount.value = count
    );
    getAutoMixState().then(
        (s) => {
            nextVideoId.value = (s.nextVideoId) ? s.nextVideoId : "";
            nextVideoTitle.value = (s.nextVideoTitle) ? s.nextVideoTitle : "";
        }
    );
}

onMounted(onMountedHook);

</script>

<template>
    <div class="w-full h-full table p-2">
        <div class="space-y-4">
            <p>Next:</p>
            <a class="link link-secondary" :href="videoIdIntoUrl(nextVideoId)"
                @click="navigateToUrl(videoIdIntoUrl(nextVideoId))">
                {{ nextVideoTitle }}
            </a>
            <img :src="videoIdIntoThumbnailUrl(nextVideoId)" loading="lazy"
                class="rounded-md object-cover w-[168px] h-[94px] m-auto" />
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
        <div class="space-y-4">
            <div>
                <button class="btn btn-sm btn-secondary" @click="onClearPlayedVideosClick">Clear played videos</button>
                <span class="pl-2"> ({{ playedVideosCount }}) </span>
            </div>
        </div>
    </div>
</template>

<script lang="ts">
</script>
