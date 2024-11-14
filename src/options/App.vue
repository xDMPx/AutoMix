<script setup lang="ts">
import { ref, onMounted } from 'vue';
import { clearAutoMixState, getAutoMixState, setAutoMixState } from "../utils.mjs";
import { getEnsureTheatreModeValue, getEnsureHighestQualityValue, getClearPlayedVideosManually, getFilterOutNonMusicContent } from "../popup_utils.mjs";

const ensureTheatreMode = ref(false);
const ensureHighestQuality = ref(false);
const clearPlayedVideosManually = ref(false);
const filterOutNonMusicContent = ref(false);

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

async function toggleClearPlayedVideosManually() {
    const state = await getAutoMixState();
    state.clearPlayedVideosManually = !state.clearPlayedVideosManually;
    console.log(`AutoMixPopup; clearPlayedVideosManually => ${state.clearPlayedVideosManually}`);
    await setAutoMixState(state);
}

async function toggleFilterOutNonMusicContent() {
    const state = await getAutoMixState();
    state.filterOutNonMusicContent = !state.filterOutNonMusicContent;
    console.log(`AutoMixPopup; filterOutNonMusicContent => ${state.filterOutNonMusicContent}`);
    await setAutoMixState(state);
}

async function onClearStateClick() {
    clearAutoMixState();
    onMountedHook();
}

function onMountedHook() {
    getEnsureTheatreModeValue().then(
        (checked) => ensureTheatreMode.value = checked
    );
    getEnsureHighestQualityValue().then(
        (checked) => ensureHighestQuality.value = checked
    );
    getClearPlayedVideosManually().then(
        checked => clearPlayedVideosManually.value = checked
    )
    getFilterOutNonMusicContent().then(
        checked => filterOutNonMusicContent.value = checked
    )
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
        <div class="divider" />
        <div class="space-y-4">
            <button class="btn btn-sm btn-secondary" @click="onClearStateClick">Clear state</button>
        </div>
    </div>
</template>

<script lang="ts">
</script>
