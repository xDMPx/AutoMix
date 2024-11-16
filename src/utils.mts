import { AutoMixState } from "./interfaces.mjs";

export async function getAutoMixState(): Promise<AutoMixState> {
    let { state }: { [key: string]: AutoMixState | undefined } = await chrome.storage.local.get("state");
    if (state == undefined) {
        state = {
            youtubeTabID: undefined,
            playedVideos: [],
            playedVideosArrayMaxSize: 256,
            clearPlayedVideosManually: false,
            attachedListener: false,
            ensureTheatreMode: false,
            ensureHighestQuality: false,
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
    await chrome.storage.local.remove("state");
}

export async function clearAutoMixStatePreservingSettings() {
    console.log("AutoMix; state clear, but preserving settings");
    const old_state = await getAutoMixState();
    clearAutoMixState();
    const new_state = await getAutoMixState();
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
    await setAutoMixState(new_state);
}

export async function setAutoMixState(state: AutoMixState) {
    await chrome.storage.local.set({ state: state });
}

export function extractVideoId(url: string): string | undefined {
    if (url.includes("v=")) {
        const split = url.split("v=");
        const video_id = split.at(-1);
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
