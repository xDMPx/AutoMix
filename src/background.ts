let youtubeTabID: number | undefined = undefined;
let playedVideos: string[] = []

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

})

function extract_video_id(url: string): string | undefined {
    if (url.includes("v=")) {
        const split = url.split("v=");
        const video_id = split.at(-1);
        return video_id;
    }

    return undefined;
}
