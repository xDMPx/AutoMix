<script setup lang="ts">
import browser, { Runtime } from "webextension-polyfill";
import { ref, onMounted } from 'vue';
import { clearAutoMixState, getAutoMixState, setAutoMixState } from "../utils.mjs";
import { getEnsureTheatreModeValue, getEnsureHighestQualityValue, getHideYouTubeUI, getClearPlayedVideosManually, getFilterOutNonMusicContent, getPlayedVideosArrayMaxSize } from "../popup_utils.mjs";
import { AutoMixStateUpdateMessage } from "../interfaces.mjs";

const ensureTheatreMode = ref(false);
const ensureHighestQuality = ref(false);
const hideYouTubeUI = ref(false);
const clearPlayedVideosManually = ref(false);
const filterOutNonMusicContent = ref(false);
const playedVideosArrayMaxSize = ref(0);

browser.runtime.onMessage.addListener(async (_msg: unknown, _sender: Runtime.MessageSender) => {
    console.log(`AutoMixOptions; Options Message => `);
    console.log(_msg);
    const msg = _msg as AutoMixStateUpdateMessage;
    if (msg.source === "popup") {
        onMountedHook();
    }
});

async function sendStateUpdateMessage() {
    const msg: AutoMixStateUpdateMessage = { source: "options" };
    chrome.runtime.sendMessage(msg);
}

async function toggleEnsureTheatreMode() {
    const state = await getAutoMixState();
    state.ensureTheatreMode = !state.ensureTheatreMode;
    console.log(`AutoMixPopup; toggleEnsureTheatreMode => ${state.ensureTheatreMode}`);
    await setAutoMixState(state);
    sendStateUpdateMessage();
}

async function toggleEnsureHighestQuality() {
    const state = await getAutoMixState();
    state.ensureHighestQuality = !state.ensureHighestQuality;
    console.log(`AutoMixPopup; ensureHighestQuality => ${state.ensureHighestQuality}`);
    await setAutoMixState(state);
    sendStateUpdateMessage();
}

async function toggleHideYouTubeUI() {
    const state = await getAutoMixState();
    state.hideYouTubeUI = !state.hideYouTubeUI;
    console.log(`AutoMixPopup; hideYouTubeUI => ${state.hideYouTubeUI}`);
    await setAutoMixState(state);
    sendStateUpdateMessage();
}

async function toggleClearPlayedVideosManually() {
    const state = await getAutoMixState();
    state.clearPlayedVideosManually = !state.clearPlayedVideosManually;
    console.log(`AutoMixPopup; clearPlayedVideosManually => ${state.clearPlayedVideosManually}`);
    await setAutoMixState(state);
    sendStateUpdateMessage();
}

async function toggleFilterOutNonMusicContent() {
    const state = await getAutoMixState();
    state.filterOutNonMusicContent = !state.filterOutNonMusicContent;
    console.log(`AutoMixPopup; filterOutNonMusicContent => ${state.filterOutNonMusicContent}`);
    await setAutoMixState(state);
    sendStateUpdateMessage();
}

async function onSavePlayedVideosArrayMaxSize() {
    playedVideosArrayMaxSize.value = +playedVideosArrayMaxSize.value;
    if (playedVideosArrayMaxSize.value < 16) {
        playedVideosArrayMaxSize.value = 16;
    }
    if (playedVideosArrayMaxSize.value > 1024) {
        playedVideosArrayMaxSize.value = 1024;
    }
    const state = await getAutoMixState();
    state.playedVideosArrayMaxSize = playedVideosArrayMaxSize.value;
    console.log(`AutoMixPopup; playedVideosArrayMaxSize => ${state.playedVideosArrayMaxSize}`);
    await setAutoMixState(state);
    sendStateUpdateMessage();
}

async function onClearStateClick() {
    clearAutoMixState();
    onMountedHook();
    sendStateUpdateMessage();
}

function onMountedHook() {
    getEnsureTheatreModeValue().then(
        (checked) => ensureTheatreMode.value = checked
    );
    getEnsureHighestQualityValue().then(
        (checked) => ensureHighestQuality.value = checked
    );
    getHideYouTubeUI().then(
        (checked) => hideYouTubeUI.value = checked
    );
    getClearPlayedVideosManually().then(
        checked => clearPlayedVideosManually.value = checked
    );
    getFilterOutNonMusicContent().then(
        checked => filterOutNonMusicContent.value = checked
    );
    getPlayedVideosArrayMaxSize().then(
        value => playedVideosArrayMaxSize.value = value
    );
}

onMounted(onMountedHook);

</script>

<template>
    <div class="w-full h-full table p-2">
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
        <div class="form-control">
            <label class="label cursor-pointer mr-auto">
                <span class="label-text pr-2">Hide YouTube UI:</span>
                <input class="checkbox" @click="toggleHideYouTubeUI" v-model="hideYouTubeUI" name="hideYouTubeUI"
                    type="checkbox" checked="true" />
            </label>
        </div>
        <div class="form-control">
            <label class="label cursor-pointer mr-auto">
                <span class="label-text pr-2">Filter out Non-Music Content:</span>
                <input class="checkbox" @click="toggleFilterOutNonMusicContent" v-model="filterOutNonMusicContent"
                    name="filterOutNonMusicContent" type="checkbox" checked="true" />
            </label>
        </div>
        <div class="form-control">
            <label class="label cursor-pointer mr-auto">
                <span class="label-text pr-2">Clear Played Videos Manually:</span>
                <input class="checkbox" @click="toggleClearPlayedVideosManually" v-model="clearPlayedVideosManually"
                    name="clearPlayedVideosManually" type="checkbox" checked="true" />
            </label>
        </div>
        <div class="form-control">
            <label class="label cursor-pointer mr-auto">
                <span class="label-text pr-2">Played Videos Array Size:</span>
                <input class="input max-w-24 p-2" type="text" placeholder="256" v-model="playedVideosArrayMaxSize"
                    name="playedVideosArrayMaxSize" />
                <button class="btn btn-sm btn-secondary ml-2" @click="onSavePlayedVideosArrayMaxSize">Save</button>
            </label>
        </div>
        <div class="divider" />
        <div class="space-y-4">
            <button class="btn btn-sm btn-secondary" @click="onClearStateClick">Clear state</button>
        </div>
    </div>
</template>

<script lang="ts">
</script>
