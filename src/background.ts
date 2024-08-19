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
            let recommendations = document.getElementsByTagName("ytd-compact-video-renderer");
            console.log(recommendations);
            const i = Math.floor(Math.random() * recommendations.length);

            return recommendations[i].getElementsByTagName("a")[0].href;
        }
    });

    const rec_video_url = res[0].result;
    console.log(`rec_video_url: ${rec_video_url}`);
    if (rec_video_url !== undefined && rec_video_url !== null) {
        return rec_video_url;
    } else {
        return await get_random_recommendation(tab_id);
    }
}
