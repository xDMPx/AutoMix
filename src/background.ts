import { getAutoMixState, clearAutoMixState, setAutoMixState, extractVideoId, videoIdIntoUrl, durationToSec } from "./utils.mjs";

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
                const ensure_theatre_mode = state.ensureTheatreMode;
                const ensure_highest_quality = state.ensureHighestQuality;
                state = await getAutoMixState();
                state.ensureTheatreMode = ensure_theatre_mode;
                state.ensureHighestQuality = ensure_highest_quality;
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
        state.attachedListener = false;
        state.nextVideoId = null;
        state.nextVideoTitle = null;
        state.recommendations = [];
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

    if (changeInfo.url !== undefined) {
        const url = changeInfo.url;
        const video_id = extractVideoId(url);
        if (video_id !== undefined && !state.playedVideos.includes(video_id)) {
            state.playedVideos.push(video_id);
            await setAutoMixState(state);
        }
        console.log(`AutoMix; URL: ${url} => ${video_id}`);
    }

    if (changeInfo.status === "loading" && changeInfo.url?.includes("v=")) {
        console.log(`AutoMix; Wating for video to load`);
        await attachVideoLoadedObserver(state.youtubeTabID);
        console.log(`AutoMix; Wating for recommendations to load`);
        await attachRecommendationLoadedObserver(state.youtubeTabID);
    }

})

chrome.runtime.onMessage.addListener(async (msg: Message, _sender, _sendResponse) => {
    const state = await getAutoMixState();
    if (state.youtubeTabID === undefined) return;
    if (msg.videoStartMessage) {
        console.log(`AutoMix; Message => videoStartMessage`);

        if (state.ensureHighestQuality) {
            await ensureHighestQuality(state.youtubeTabID);
        }
        disableAutoplay(state.youtubeTabID);
        if (state.ensureTheatreMode) {
            ensureTheatreMode(state.youtubeTabID);
        }

    }
    else if (msg.recommendationsLoadedMessage) {
        console.log(`AutoMix; Message => recommendationsLoadedMessage`);
        state.attachedListener = true;
        getRandomRecommendation(state.youtubeTabID).then(
            async (data) => {
                console.log(`AutoMix; Message => videoStartMessage`);
                const video_url = data.url;
                const video_title = data.title;
                console.log(`AutoMix; next_video => ${video_title} : ${video_url}`);
                const state = await getAutoMixState();
                state.nextVideoId = extractVideoId(video_url)!;
                state.nextVideoTitle = video_title;
                await setAutoMixState(state);
                await attachVideoEndedListener(state.youtubeTabID as number, video_url);
            });
        await setAutoMixState(state);

    }
    else if (state.attachedListener !== false && msg.videoEndMessage !== undefined) {
        const video_end_message = msg.videoEndMessage;
        console.log(`AutoMix; Message => `);
        console.log(video_end_message);
        if (video_end_message.ended === true) {
            console.log(`AutoMix; ended`);
            navigateToNextVideo(state.youtubeTabID, video_end_message.nextVideoUrl);
        }
    }
});

chrome.commands.onCommand.addListener(async (command: string) => {
    const state = await getAutoMixState();
    if (state.youtubeTabID === undefined || state.attachedListener === false) return;

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
        const msg: PopupMessage = { ensureTheatreMode: state.ensureTheatreMode };
        await chrome.runtime.sendMessage(msg).catch((_e) => { });
        await setAutoMixState(state);
    }
});

async function attachVideoEndedListener(tabID: number, nextVideoUrl: string) {
    console.log(`AutoMix; Ataching ended event listener`);
    await chrome.scripting.executeScript({
        target: { tabId: tabID },
        func:
            (nextVideoUrl: string) => {
                const video = document.querySelectorAll('video')[0];

                console.log(`AutoMix; Ataching ended event listener => ${nextVideoUrl}`);
                video.addEventListener("ended",
                    (e: Event) => {
                        console.log(`AutoMix; ${e}`);
                        const msg: Message = { videoEndMessage: { ended: true, nextVideoUrl: nextVideoUrl }, videoStartMessage: undefined, recommendationsLoadedMessage: undefined };
                        chrome.runtime.sendMessage(msg);
                    });

            },
        args: [nextVideoUrl]
    });
}

async function getRandomRecommendation(tabID: number): Promise<{ url: string, title: string }> {
    const res = await chrome.scripting.executeScript({
        target: { tabId: tabID },
        func:
            () => {
                const elements = document.getElementsByTagName("ytd-compact-video-renderer") as HTMLCollectionOf<HTMLElement>;
                console.log(`AutoMix; elements =>`);
                console.log(elements);
                if (elements.length === 0) {
                    return undefined;
                }

                const elements_array = [...elements];
                const recommendations = elements_array.map(
                    (element) => {
                        const video_url = element.getElementsByTagName("a").item(0)?.href;
                        const video_title = [...element.getElementsByTagName("span")].find((e) => e.id === "video-title")?.innerText;
                        const duration = element.getElementsByClassName("badge-shape-wiz__text").item(0)?.innerHTML;
                        if (video_url === undefined || duration === undefined || video_title === undefined) {
                            return undefined;
                        }
                        return { video_url, video_title, duration };
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

                return duration <= 600 && !state.playedVideos.includes(video_id)
                    && (state.recommendations.length === 0
                        || state.recommendations.findIndex((v) => v.videoID === video_id) === -1);
            });

        console.log(`AutoMix; valid_recommendations =>`);
        console.log(valid_recommendations);

        if (valid_recommendations.length === 0) {
            throw new Error("No recommendation found");
        }

        const new_recommendations: { videoID: string, title: string }[] = [];
        const indexes: number[] = [];
        for (let i = 0; i < 3; i++) {
            let j = Math.floor(Math.random() * valid_recommendations.length);
            while (indexes.includes(j)) {
                j = Math.floor(Math.random() * valid_recommendations.length);
            }
            indexes.push(j);

            const recommendation = valid_recommendations[j];
            new_recommendations[i] = { videoID: extractVideoId(recommendation.video_url)!, title: recommendation.video_title };
        }



        console.log(`AutoMix; new_recommendations =>`);
        for (const r of new_recommendations) {
            console.log(r);
            if (state.recommendations.length < state.recommendationsArrayMaxSize) {
                state.recommendations.push(r);
            } else {
                const i = Math.floor(Math.random() * state.recommendations.length);
                const droped = state.recommendations[i];
                console.log(`AutoMix; Recommendation array over limit dropping =>`);
                console.log(droped);
                state.recommendations[i] = r;
            }
        }

        const i = Math.floor(Math.random() * state.recommendations.length);
        const recommendation = state.recommendations[i];
        state.recommendations[i] = state.recommendations.pop()!;
        console.log(state);
        await setAutoMixState(state);

        const video_url = videoIdIntoUrl(recommendation.videoID);
        const video_title = recommendation.title;

        return { url: video_url, title: video_title };
    } else {
        return await getRandomRecommendation(tabID);
    }
}

async function navigateToNextVideo(tabID: number, nextVideoUrl: string) {
    console.log(`AutoMix; Navigating to next video => ${nextVideoUrl}`);
    setTimeout(() => chrome.tabs.update(tabID, { url: nextVideoUrl }), 2500);

    const state = await getAutoMixState();
    state.attachedListener = false;
    await setAutoMixState(state);
}

async function disableAutoplay(tabID: number) {
    await chrome.scripting.executeScript({
        target: { tabId: tabID },
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

async function ensureTheatreMode(tabID: number) {
    await chrome.scripting.executeScript({
        target: { tabId: tabID },
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

async function ensureHighestQuality(tabID: number) {
    await chrome.scripting.executeScript({
        target: { tabId: tabID },
        world: "MAIN",
        func:
            () => {
                console.log(`AutoMix; Ensuring highest quality`);
                const player = document.querySelectorAll('.html5-video-player')[0] as VideoPlayer;
                const quality_levels = player.getAvailableQualityLevels();
                const highest_quality = quality_levels[0];
                console.log(`AutoMix; highest quality ${highest_quality}`);
                const highest2_quality = quality_levels[1];
                player.setPlaybackQualityRange(highest2_quality);
                player.setPlaybackQualityRange(highest_quality);
            },
    });
}

async function attachVideoLoadedObserver(tabID: number) {
    await chrome.scripting.executeScript({
        target: { tabId: tabID },
        func:
            () => {
                if (!document.URL) return;

                console.log(`AutoMix; Ataching video loaded observer`);
                const video_elements = document.querySelectorAll('video');
                if (video_elements.length > 0) {
                    const msg: Message = { videoStartMessage: true, videoEndMessage: undefined, recommendationsLoadedMessage: undefined };
                    chrome.runtime.sendMessage(msg);
                } else {
                    const config = { attributes: true, childList: true, subtree: true };
                    const observer = new MutationObserver(() => {
                        const video_elements = document.querySelectorAll('video');
                        if (video_elements.length > 0) {
                            observer.disconnect();
                            console.log(`AutoMix; Video loaded`);
                            const msg: Message = { videoStartMessage: true, videoEndMessage: undefined, recommendationsLoadedMessage: undefined };
                            chrome.runtime.sendMessage(msg);
                        }
                    });
                    observer.observe(document.body, config);
                }
            },
    });
}

async function attachRecommendationLoadedObserver(tabID: number) {
    await chrome.scripting.executeScript({
        target: { tabId: tabID },
        func:
            () => {
                if (!document.URL) return;

                console.log(`AutoMix; Ataching recommendations loaded observer`);

                const elements = document.getElementsByTagName("ytd-compact-video-renderer") as HTMLCollectionOf<HTMLElement>;
                const elements_array = [...elements];
                const recommendations = elements_array.filter((e) => {
                    const duration = e.getElementsByClassName("badge-shape-wiz__text").item(0)?.innerHTML;
                    if (duration === undefined) {
                        return undefined;
                    }
                    return { duration };

                }).filter((r) => r !== undefined);


                if (recommendations.length > 10) {
                    const msg: Message = { recommendationsLoadedMessage: true, videoStartMessage: undefined, videoEndMessage: undefined };
                    chrome.runtime.sendMessage(msg);
                } else {
                    const config = { attributes: true, childList: true, subtree: true };
                    const observer = new MutationObserver(
                        () => {
                            const elements = document.getElementsByTagName("ytd-compact-video-renderer") as HTMLCollectionOf<HTMLElement>;
                            const elements_array = [...elements];
                            const recommendations = elements_array.filter((e) => {
                                const duration = e.getElementsByClassName("badge-shape-wiz__text").item(0)?.innerHTML;
                                if (duration === undefined) {
                                    return undefined;
                                }
                                return { duration };

                            }).filter((r) => r !== undefined);

                            if (recommendations.length > 10) {
                                observer.disconnect();
                                console.log(`AutoMix; Mutation Recommendations loaded => ${elements.length}`);
                                const msg: Message = { recommendationsLoadedMessage: true, videoStartMessage: undefined, videoEndMessage: undefined };
                                chrome.runtime.sendMessage(msg);
                            }
                        });
                    observer.observe(document.body, config);
                }
            },
    });
}
