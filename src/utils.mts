import browser from "webextension-polyfill";
import { AutoMixState } from "./interfaces.mjs";

export async function getAutoMixState(): Promise<AutoMixState> {
    let { state } = await browser.storage.local.get("state") as { [key: string]: AutoMixState | undefined };
    if (state == undefined) {
        state = {
            youtubeTabID: undefined,
            playedVideos: [],
            playedVideosArrayMaxSize: 256,
            clearPlayedVideosManually: false,
            attachedListener: false,
            ensureTheatreMode: false,
            ensureHighestQuality: false,
            hideYouTubeUI: false,
            filterOutNonMusicContent: true,
            recommendations: [],
            recommendationsArrayMaxSize: 128,
            nextVideoId: null,
            nextVideoTitle: null,
        }
    }

    return state;
}

export async function clearAutoMixState() {
    await browser.storage.local.remove("state");
}

export async function clearAutoMixStatePreservingSettings() {
    console.log("AutoMix; state clear, but preserving settings");
    const old_state = await getAutoMixState();
    clearAutoMixState();
    const new_state = await getAutoMixState();
    if (old_state.playedVideosArrayMaxSize !== undefined) {
        new_state.playedVideosArrayMaxSize = old_state.playedVideosArrayMaxSize;
    }
    if (old_state.ensureTheatreMode !== undefined) {
        new_state.ensureTheatreMode = old_state.ensureTheatreMode;
    }
    if (old_state.ensureTheatreMode !== undefined) {
        new_state.ensureHighestQuality = old_state.ensureHighestQuality;
    }
    if (old_state.ensureTheatreMode !== undefined) {
        new_state.clearPlayedVideosManually = old_state.clearPlayedVideosManually;
    }
    if (old_state.filterOutNonMusicContent !== undefined) {
        new_state.filterOutNonMusicContent = old_state.filterOutNonMusicContent;
    }
    if (old_state.hideYouTubeUI !== undefined) {
        new_state.hideYouTubeUI = old_state.hideYouTubeUI;
    }
    await setAutoMixState(new_state);
}

export async function setAutoMixState(state: AutoMixState) {
    if (state.playedVideos.length > state.playedVideosArrayMaxSize) {
        state.playedVideos.splice(state.playedVideosArrayMaxSize);
    }
    await browser.storage.local.set({ state: state });
}

export function extractVideoId(url: string): string | undefined {
    if (url.includes("v=")) {
        const split = url.split("v=");
        const after_v_value = split.at(-1);
        const video_id = after_v_value?.split("&").at(0);
        return video_id;
    }

    return undefined;
}

export function durationToSec(duration: string): number {
    return duration.split(':').map((val) => +val).reduce((acc, val) => acc * 60 + val);
}

export function videoIdIntoUrl(videoID: string): string {
    return `https://www.youtube.com/watch?v=${videoID}`;
}
