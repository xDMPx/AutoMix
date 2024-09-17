import { getAutoMixState, setAutoMixState } from "./utils.mjs";

export async function clearPlayedVideos() {
    console.log(`AutoMixPopup; Clearing played videos`);
    const state = await getAutoMixState();
    state.playedVideos = [];
    await setAutoMixState(state);
}

export async function getPlayedVideosCount(): Promise<number> {
    const state = await getAutoMixState();
    return state.playedVideos.length;
}

export async function getEnsureTheatreModeValue(): Promise<boolean> {
    const state = await getAutoMixState();
    return state.ensureTheatreMode;
}

export async function getEnsureHighestQualityValue(): Promise<boolean> {
    const state = await getAutoMixState();
    return state.ensureHighestQuality;
}

export function navigateToUrl(url: string) {
    chrome.tabs.create({ url: url });
}

export function videoIdIntoThumbnailUrl(videoID: string): string {
    return `https://i.ytimg.com/vi/${videoID}/hqdefault.jpg`;
}
