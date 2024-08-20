let youtubeTabID: number | undefined = undefined;
let playedVideos: string[] = [];
let nextVideoUrl: string | undefined = undefined;

chrome.tabs.onCreated.addListener((tab: chrome.tabs.Tab) => {
    if (tab.url !== undefined || tab.pendingUrl !== undefined) {
        const url = (tab.url ?? tab.pendingUrl) as string;
        if (url.startsWith("https://www.youtube.com/") && youtubeTabID === undefined) {
            youtubeTabID = tab.id;
            console.log(`YouTubeTabID: ${youtubeTabID}`);
        }
    }
})

chrome.tabs.onRemoved.addListener((tabId: number) => {
    if (tabId === youtubeTabID) {
        youtubeTabID = undefined;
        nextVideoUrl = undefined;
        console.log(playedVideos);
    }
})

chrome.tabs.onUpdated.addListener((tabId: number, changeInfo: chrome.tabs.TabChangeInfo) => {
    if (tabId !== youtubeTabID) return;

    if (changeInfo.url != undefined) {
        const url = changeInfo.url;
        const video_id = extract_video_id(url);
        if (video_id !== undefined) {
            playedVideos.push(video_id);
        }
        console.log(`URL: ${url} => ${video_id}`);
    }

    if (changeInfo.audible === true && nextVideoUrl === undefined) {
        get_random_recommendation(youtubeTabID).then((video_url: string) => {
            nextVideoUrl = video_url;
            console.log(`nextVideoUrl: ${nextVideoUrl}`)
        })
    }
})

function extract_video_id(url: string): string | undefined {
    if (url.includes("v=")) {
        const split = url.split("v=");
        const video_id = split.at(-1);
        return video_id;
    }

    return undefined;
}

async function get_random_recommendation(tab_id: number): Promise<string> {
    const res = await chrome.scripting.executeScript({
        target: { tabId: tab_id },
        func: () => {
            const recommendations = document.getElementsByTagName("ytd-compact-video-renderer");
            console.log(recommendations);
            if (recommendations === null && recommendations === undefined) {
                return undefined;
            }

            const i = Math.floor(Math.random() * recommendations.length);
            const recommendation = recommendations[i];

            const video_url = recommendation.getElementsByTagName("a")[0].href;
            const duration = recommendation.getElementsByClassName("badge-shape-wiz__text")[0].innerHTML;

            return { video_url: video_url, duration: duration };
        }
    });

    const rec_video = res[0].result;
    console.log(`rec_video: ${rec_video?.video_url}`);
    if (rec_video !== undefined && rec_video !== null) {
        const video_url = rec_video.video_url;
        const duration = duration_to_sec(rec_video.duration);
        console.log(`duration: ${duration}`);

        const video_id = extract_video_id(video_url) as string;
        if (duration > 600 || playedVideos.includes(video_id)) {
            console.log("recommendation rejected");
            return await get_random_recommendation(tab_id);
        } else {
            return video_url;
        }
    } else {
        return await get_random_recommendation(tab_id);
    }
}

function duration_to_sec(duration: string): number {
    return duration.split(':').map((val) => +val).reduce((acc, val) => acc * 60 + val);
}
