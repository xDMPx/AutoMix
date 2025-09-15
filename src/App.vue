<script setup lang="ts">
import browser, { Runtime } from "webextension-polyfill";
import { ref, onMounted } from 'vue';
import { AutoMixStateUpdateMessage, PopupMessage } from "./interfaces.mjs";
import { clearAutoMixState, clearAutoMixStateTrackedTab, getAutoMixState, setAutoMixState, videoIdIntoUrl } from "./utils.mjs";
import { getEnsureTheatreModeValue, getEnsureHighestQualityValue, getPlayedVideosCount, getHideYouTubeUI, clearPlayedVideos, navigateToUrl, videoIdIntoThumbnailUrl, getNextVideoId, getNextVideoTitle, getShowClearTrackedTabButton } from "./popup_utils.mjs";

const ensureTheatreMode = ref(false);
const ensureHighestQuality = ref(false);
const hideYouTubeUI = ref(false);
const nextVideoId = ref("");
const nextVideoTitle = ref("");
const playedVideosCount = ref(0);
const showClearTrackedTabButton = ref(false);

browser.runtime.onMessage.addListener(async (_msg: unknown, _sender: Runtime.MessageSender) => {
    console.log(`AutoMixPopup; Popup Message => `);
    console.log(_msg);
    const pmsg = _msg as PopupMessage;
    if (pmsg.ensureTheatreMode !== undefined) ensureTheatreMode.value = pmsg.ensureTheatreMode;

    const msg = _msg as AutoMixStateUpdateMessage;
    if (msg.source === "options") {
        onMountedHook();
    }
});

async function sendStateUpdateMessage() {
    const msg: AutoMixStateUpdateMessage = { source: "popup" };
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

async function onClearTrackedTab() {
    await clearAutoMixStateTrackedTab();

    const state = await getAutoMixState();
    console.log(`AutoMixPopup; YouTubeTabID => ${state.youtubeTabID}`);
    console.log(state.playedVideos);

    onMountedHook();
}

async function switchToTrackedTab() {
    const state = await getAutoMixState();
    if (state.youtubeTabID !== undefined) {
        chrome.tabs.update(
            state.youtubeTabID,
            {
                active: true,
            }
        )
    }
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
    getHideYouTubeUI().then(
        (checked) => hideYouTubeUI.value = checked
    );
    getNextVideoId().then(
        id => nextVideoId.value = id
    );
    getNextVideoTitle().then(
        title => nextVideoTitle.value = title
    )
    getShowClearTrackedTabButton().then(
        value => showClearTrackedTabButton.value = value
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
        <div class="form-control">
            <label class="label cursor-pointer mr-auto">
                <span class="label-text pr-2">Hide YouTube UI:</span>
                <input class="checkbox" @click="toggleHideYouTubeUI" v-model="hideYouTubeUI" name="hideYouTubeUI"
                    type="checkbox" checked="true" />
            </label>
        </div>
        <div class="divider" />
        <div class="grid space-y-4">
            <div>
                <button class="btn btn-sm btn-secondary" @click="onClearPlayedVideosClick">Clear played videos</button>
                <span class="pl-2"> ({{ playedVideosCount }}) </span>
            </div>
            <button v-if="showClearTrackedTabButton" class="btn btn-sm btn-secondary" @click="onClearTrackedTab">Clear
                tracked tab</button>
            <button v-if="showClearTrackedTabButton" class="btn btn-sm btn-secondary" @click="switchToTrackedTab">Switch
                to
                tracked tab</button>
        </div>
    </div>
</template>

<script lang="ts">
</script>
