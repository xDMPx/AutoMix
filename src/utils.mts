import { AutoMixState } from "./interfaces.mjs";

export async function getAutoMixState(): Promise<AutoMixState> {
    let { state }: { [key: string]: AutoMixState | undefined } = await chrome.storage.local.get("state");
    if (state == undefined) {
        state = {
            youtubeTabID: undefined,
            playedVideos: [],
            attachedListener: false,
            ensureTheatreMode: false,
            ensureHighestQuality: false,
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

export function getFullyLoadedVideoRecommendationsCount(): number {
    const elements = document.getElementsByTagName("ytd-compact-video-renderer") as HTMLCollectionOf<HTMLElement>;
    const elements_array = [...elements];
    const recommendations = elements_array.filter((e) => {
        const duration = e.getElementsByClassName("badge-shape-wiz__text").item(0)?.innerHTML;
        if (duration === undefined) {
            return undefined;
        }
        return { duration };

    }).filter((r) => r !== undefined);

    return recommendations.length;
}
