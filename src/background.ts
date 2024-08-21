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

chrome.tabs.onActivated.addListener((activeInfo: chrome.tabs.TabActiveInfo) => {
    if (activeInfo.tabId === youtubeTabID) chrome.action.setBadgeText({ tabId: youtubeTabID, text: "ON" });
    else chrome.action.setBadgeText({ text: "" });
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
        disable_autoplay(youtubeTabID);
        get_random_recommendation(youtubeTabID).then((video_url: string) => {
            nextVideoUrl = video_url;
            console.log(`nextVideoUrl: ${nextVideoUrl}`);
        })
    }

    if (changeInfo.audible === false) {
        playback_ended(youtubeTabID).then((ended) => {
            console.log(`ended: ${ended}`);
            if (ended) {
                console.log(`Navigating to next video: ${nextVideoUrl}`);
                chrome.tabs.update(youtubeTabID as number, { url: nextVideoUrl });
                nextVideoUrl = undefined;
            }
        });
    }
})

//TODO: Find a better way to tell when video playback is finished
async function playback_ended(tab_id: number): Promise<boolean> {
    const res = await chrome.scripting.executeScript({
        target: { tabId: tab_id },
        func: () => {
            const video = document.querySelectorAll('video')[0];

            // Silence close to the end of the video
            if (video.currentTime + 20 > video.duration) {
                return true;
            }

            return video.ended;
        }
    });

    const ended = res[0].result === true;

    return ended;
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

async function disable_autoplay(tab_id: number) {
    await chrome.scripting.executeScript({
        target: { tabId: tab_id },
        func: () => {
            const ytp_right_controls = document.getElementsByClassName('ytp-right-controls')[0];
            const autoplay_button = ytp_right_controls.childNodes[1] as HTMLElement;
            const autoplay_enabled = (autoplay_button.childNodes[0].childNodes[0] as HTMLElement).ariaChecked === 'true';

            if (autoplay_enabled) {
                autoplay_button.click();
            }
        }
    });
}

function extract_video_id(url: string): string | undefined {
    if (url.includes("v=")) {
        const split = url.split("v=");
        const video_id = split.at(-1);
        return video_id;
    }

    return undefined;
}

function duration_to_sec(duration: string): number {
    return duration.split(':').map((val) => +val).reduce((acc, val) => acc * 60 + val);
}
