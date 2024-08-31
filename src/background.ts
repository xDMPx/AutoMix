interface AutoMixState {
    youtubeTabID: number | undefined,
    playedVideos: string[],
    attached_listener: boolean,
    ensureTheatreMode: boolean,
}

console.log(`AutoMix; start => ${Date.now()}`);

chrome.tabs.onCreated.addListener(async (tab: chrome.tabs.Tab) => {
    if (tab.url !== undefined || tab.pendingUrl !== undefined) {
        const url = (tab.url ?? tab.pendingUrl) as string;

        let state = await getAutoMixState();
        if (state.youtubeTabID !== undefined) {
            const tab = await chrome.tabs.get(state.youtubeTabID).catch(_e => undefined);
            if (tab === undefined) {
                console.log(`AutoMix; Clearing old state => `);
                console.log(state);
                clearAutoMixState();
                const ensureTheatreMode = state.ensureTheatreMode;
                state = await getAutoMixState();
                state.ensureTheatreMode = ensureTheatreMode;
                await setAutoMixState(state);
            }
        }

        if (url.startsWith("https://www.youtube.com/") && state.youtubeTabID === undefined) {
            state.youtubeTabID = tab.id;
            await setAutoMixState(state);
            console.log(`AutoMix; YouTubeTabID => ${state.youtubeTabID}`);
        }
    }
})

chrome.tabs.onRemoved.addListener(async (tabId: number) => {
    const state = await getAutoMixState();
    if (tabId === state.youtubeTabID) {
        state.youtubeTabID = undefined;
        state.attached_listener = false;
        await setAutoMixState(state);
        console.log(`AutoMix; YouTubeTabID => ${state.youtubeTabID}`);
        console.log(state.playedVideos);
    }
})

chrome.tabs.onActivated.addListener(async (activeInfo: chrome.tabs.TabActiveInfo) => {
    const state = await getAutoMixState();
    if (activeInfo.tabId === state.youtubeTabID) chrome.action.setBadgeText({ tabId: state.youtubeTabID, text: "ON" });
    else chrome.action.setBadgeText({ text: "" });
})

chrome.tabs.onUpdated.addListener(async (tabId: number, changeInfo: chrome.tabs.TabChangeInfo) => {
    const state = await getAutoMixState();
    if (tabId !== state.youtubeTabID) return;

    chrome.action.setBadgeText({ tabId: state.youtubeTabID, text: "ON" });

    if (changeInfo.url != undefined) {
        const url = changeInfo.url;
        const video_id = extractVideoId(url);
        if (video_id !== undefined) {
            state.playedVideos.push(video_id);
            await setAutoMixState(state);
        }
        console.log(`AutoMix; URL: ${url} => ${video_id}`);
    }

    if (changeInfo.audible === true && state.attached_listener === false) {
        state.attached_listener = true;
        disableAutoplay(state.youtubeTabID);
        if (state.ensureTheatreMode) {
            ensureTheatreMode(state.youtubeTabID);
        }
        getRandomRecommendation(state.youtubeTabID).then(
            (video_url: string) => {
                let next_video_url = video_url;
                console.log(`AutoMix; next_video_url => ${next_video_url}`);
                attachVideoEndedListener(state.youtubeTabID as number, next_video_url);
            });
        await setAutoMixState(state);
    }

})

interface Message {
    ended: boolean | undefined,
    next_video_url: string,
}

chrome.runtime.onMessage.addListener(async (msg: Message, _sender, _sendResponse) => {
    const state = await getAutoMixState();
    if (state.youtubeTabID === undefined || state.attached_listener === false) return;
    console.log(`AutoMix; Message => `);
    console.log(msg);
    if (msg.ended === true) {
        console.log(`AutoMix; ended`);
        navigateToNextVideo(state.youtubeTabID, msg.next_video_url);
    }
});


chrome.commands.onCommand.addListener(async (command: string) => {
    const state = await getAutoMixState();
    if (state.youtubeTabID === undefined || state.attached_listener === false) return;

    console.log(`AutoMix; Command => ${command}`);
    if (command == "playNext") {
        await chrome.scripting.executeScript({
            target: { tabId: state.youtubeTabID },
            func:
                () => {
                    const video = document.querySelectorAll('video')[0];
                    video.currentTime = video.duration - 1;
                }
        })
    }
    if (command == "toggleTheatreMode") {
        state.ensureTheatreMode = !state.ensureTheatreMode;
        await setAutoMixState(state);
    }
});

async function attachVideoEndedListener(tab_id: number, next_video_url: string) {
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

async function getRandomRecommendation(tab_id: number): Promise<string> {
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
        const state = await getAutoMixState();
        const valid_recommendations = recommendations.filter(
            (r) => {
                const video_url = r.video_url;
                const video_id = extractVideoId(video_url) as string;
                const duration = durationToSec(r.duration);

                return duration <= 600 && !state.playedVideos.includes(video_id);
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
        return await getRandomRecommendation(tab_id);
    }
}

async function navigateToNextVideo(tab_id: number, next_video_url: string) {
    console.log(`AutoMix; Navigating to next video => ${next_video_url}`);
    setTimeout(() => chrome.tabs.update(tab_id, { url: next_video_url }), 2500);

    const state = await getAutoMixState();
    state.attached_listener = false;
    await setAutoMixState(state);
}

async function disableAutoplay(tab_id: number) {
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

async function ensureTheatreMode(tab_id: number) {
    await chrome.scripting.executeScript({
        target: { tabId: tab_id },
        func:
            () => {
                console.log(`AutoMix; Ensuring theatre mode`);
                const ytd_watch_attributes = [...document.getElementsByTagName('ytd-watch-flexy')[0].attributes];

                const theatre_attribute = ytd_watch_attributes.find((a) => a.name === 'theatre' || a.name === 'theater-requested_');
                if (theatre_attribute === undefined) {
                    const ytp_right_controls = document.getElementsByClassName('ytp-right-controls')[0];
                    const theatre_button = ytp_right_controls.childNodes[6] as HTMLElement;
                    theatre_button.click();
                }
            }
    });
}

function extractVideoId(url: string): string | undefined {
    if (url.includes("v=")) {
        const split = url.split("v=");
        const video_id = split.at(-1);
        return video_id;
    }

    return undefined;
}

function durationToSec(duration: string): number {
    return duration.split(':').map((val) => +val).reduce((acc, val) => acc * 60 + val);
}

async function getAutoMixState(): Promise<AutoMixState> {
    let { state }: { [key: string]: AutoMixState | undefined } = await chrome.storage.local.get("state");
    if (state == undefined) {
        state = {
            youtubeTabID: undefined,
            playedVideos: [],
            attached_listener: false,
            ensureTheatreMode: false
        }
    }

    return state;
}

async function clearAutoMixState() {
    await chrome.storage.local.remove("state");
}

async function setAutoMixState(state: AutoMixState) {
    await chrome.storage.local.set({ state: state });
}
