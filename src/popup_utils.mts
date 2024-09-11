import { getAutoMixState, setAutoMixState } from "./utils.mjs";

export async function clearPlayedVideos() {
    console.log(`AutoMixPopup; Clearing played videos`);
    const state = await getAutoMixState();
    state.playedVideos = [];
    await setAutoMixState(state);
}

export async function getEnsureTheatreModeValue(): Promise<boolean> {
    const state = await getAutoMixState();
    return state.ensureTheatreMode;
}

export function videoIdIntoUrl(videoID: string): string {
    return `https://www.youtube.com/watch?v=${videoID}`;
}

export function navigateToUrl(url: string) {
    const msg: Message = { ended: true, nextVideoUrl: url };
    chrome.runtime.sendMessage(msg);
}
