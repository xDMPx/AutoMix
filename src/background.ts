let youtubeTabID: number | undefined = undefined;
let playedVideos: string[] = [];
let attached_listener = false;

console.log(`AutoMix; start => ${Date.now()}`);

chrome.tabs.onCreated.addListener((tab: chrome.tabs.Tab) => {
    if (tab.url !== undefined || tab.pendingUrl !== undefined) {
        const url = (tab.url ?? tab.pendingUrl) as string;
        if (url.startsWith("https://www.youtube.com/") && youtubeTabID === undefined) {
            youtubeTabID = tab.id;
            console.log(`AutoMix; YouTubeTabID => ${youtubeTabID}`);
        }
    }
})

chrome.tabs.onRemoved.addListener((tabId: number) => {
    if (tabId === youtubeTabID) {
        youtubeTabID = undefined;
        attached_listener = false;
        console.log(`AutoMix; YouTubeTabID => ${youtubeTabID}`);
        console.log(playedVideos);
    }
})

chrome.tabs.onActivated.addListener((activeInfo: chrome.tabs.TabActiveInfo) => {
    if (activeInfo.tabId === youtubeTabID) chrome.action.setBadgeText({ tabId: youtubeTabID, text: "ON" });
    else chrome.action.setBadgeText({ text: "" });
})

chrome.tabs.onUpdated.addListener((tabId: number, changeInfo: chrome.tabs.TabChangeInfo) => {
    if (tabId !== youtubeTabID) return;

    chrome.action.setBadgeText({ tabId: youtubeTabID, text: "ON" });

    if (changeInfo.url != undefined) {
        const url = changeInfo.url;
        const video_id = extract_video_id(url);
        if (video_id !== undefined) {
            playedVideos.push(video_id);
        }
        console.log(`AutoMix; URL: ${url} => ${video_id}`);
    }

    if (changeInfo.audible === true && attached_listener === false) {
        attached_listener = true;
        disable_autoplay(youtubeTabID);
        get_random_recommendation(youtubeTabID).then((video_url: string) => {
            let next_video_url = video_url;
            console.log(`AutoMix; next_video_url => ${next_video_url}`);
            attach_video_ended_listener(youtubeTabID as number, next_video_url);
        });
    }

})

interface Message {
    ended: boolean | undefined,
    next_video_url: string,
}

chrome.runtime.onMessage.addListener((msg: Message, _sender, _sendResponse) => {
    if (youtubeTabID === undefined || attached_listener === false) return;
    console.log(`AutoMix; Message => `);
    console.log(msg);
    if (msg.ended === true) {
        console.log(`AutoMix; ended`);
        navigateToNextVideo(youtubeTabID, msg.next_video_url);
    }
});

async function attach_video_ended_listener(tab_id: number, next_video_url: string) {
    console.log(`AutoMix; Ataching ended event listener`);
    await chrome.scripting.executeScript({
        target: { tabId: tab_id },
        func:
            (next_video_url: string) => {
                const video = document.querySelectorAll('video')[0];

                console.log(`AutoMix; Ataching ended event listener => ${next_video_url}`);
                video.addEventListener("ended",
                    (e: Event) => {
                        console.log(`AutoMix; ${e}`);
                        const msg: Message = { ended: true, next_video_url };
                        chrome.runtime.sendMessage(msg);
                    });

            },
        args: [next_video_url]
    });
}

async function get_random_recommendation(tab_id: number): Promise<string> {
    const res = await chrome.scripting.executeScript({
        target: { tabId: tab_id },
        func:
            () => {
                const elements = document.getElementsByTagName("ytd-compact-video-renderer");
                console.log(`AutoMix; elements =>`);
                console.log(elements);
                if (elements.length === 0) {
                    return undefined;
                }

                const elementsArray = [...elements];
                const recommendations = elementsArray.map(
                    (element) => {
                        const video_url = element.getElementsByTagName("a").item(0)?.href;
                        const duration = element.getElementsByClassName("badge-shape-wiz__text").item(0)?.innerHTML;
                        if (video_url === undefined || duration === undefined) {
                            return undefined;
                        }
                        return { video_url, duration };
                    }).filter((recommendation) => recommendation !== undefined);

                if (recommendations.length === 0) {
                    console.log(`AutoMix; No recommendations found`);
                    return undefined;
                }

                return recommendations;
            }
    });

    const recommendations = res.at(0)?.result;
    console.log(`AutoMix; recommendations => ${recommendations?.length}`);
    if (recommendations !== undefined && recommendations !== null) {
        const valid_recommendations = recommendations.filter(
            (r) => {
                const video_url = r.video_url;
                const video_id = extract_video_id(video_url) as string;
                const duration = duration_to_sec(r.duration);

                return duration <= 600 && !playedVideos.includes(video_id);
            });

        console.log(`AutoMix; valid_recommendations =>`);
        console.log(valid_recommendations);

        if (valid_recommendations.length === 0) {
            throw new Error("No recommendation found");
        }

        const i = Math.floor(Math.random() * valid_recommendations.length);
        const recommendation = valid_recommendations[i];
        const video_url = recommendation.video_url;

        return video_url;
    } else {
        return await get_random_recommendation(tab_id);
    }
}

async function navigateToNextVideo(tab_id: number, next_video_url: string) {
    console.log(`AutoMix; Navigating to next video => ${next_video_url}`);
    setTimeout(() => chrome.tabs.update(tab_id, { url: next_video_url }), 2500);
    attached_listener = false;
}

async function disable_autoplay(tab_id: number) {
    await chrome.scripting.executeScript({
        target: { tabId: tab_id },
        func:
            () => {
                console.log(`AutoMix; Disabling autoplay`);
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
