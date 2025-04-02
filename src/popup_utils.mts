import browser from "webextension-polyfill";
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

export async function getHideYouTubeUI(): Promise<boolean> {
    const state = await getAutoMixState();
    return state.hideYouTubeUI;
}

export async function getEnsureHighestQualityValue(): Promise<boolean> {
    const state = await getAutoMixState();
    return state.ensureHighestQuality;
}

export async function getClearPlayedVideosManually(): Promise<boolean> {
    const state = await getAutoMixState();
    return state.clearPlayedVideosManually;
}

export async function getFilterOutNonMusicContent(): Promise<boolean> {
    const state = await getAutoMixState();
    return state.filterOutNonMusicContent;
}

export function navigateToUrl(url: string) {
    browser.tabs.create({ url: url });
}

export function videoIdIntoThumbnailUrl(videoID: string): string {
    return `https://i.ytimg.com/vi/${videoID}/hqdefault.jpg`;
}
