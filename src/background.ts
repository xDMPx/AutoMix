import { VideoEndMessage, Message, PopupMessage } from "./interfaces.mjs";
import { getAutoMixState, clearAutoMixState, setAutoMixState, extractVideoId, videoIdIntoUrl, durationToSec } from "./utils.mjs";
import { extractRecommendations } from "./scripts/extract_recommendations.mjs";
import { addVideoEndedListener } from "./scripts/add_video_ended_listener.mjs";
import { extractGenre } from "./scripts/extract_genre.mjs";

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
                const clear_played_videos_manually = state.clearPlayedVideosManually;
                const new_state = await getAutoMixState();
                new_state.ensureTheatreMode = ensure_theatre_mode;
                new_state.ensureHighestQuality = ensure_highest_quality;
                new_state.clearPlayedVideosManually = clear_played_videos_manually;
                if (clear_played_videos_manually === true) {
                    new_state.playedVideos = state.playedVideos;
                }
                await setAutoMixState(new_state);
                state = new_state;
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
            if (state.playedVideos.length >= state.playedVideosArrayMaxSize) {
                const video_id = state.playedVideos.shift();
                console.log(`AutoMix; Played Videos array over limit dropping => ${video_id}`);
            }
            state.playedVideos.push(video_id);
            await setAutoMixState(state);
        }
        console.log(`AutoMix; URL: ${url} => ${video_id}`);
    }

    if (changeInfo.status === "loading" && changeInfo.url?.includes("v=")) {
        console.log(`AutoMix; Wating for video to load`);
        await attachVideoLoadedObserver(state.youtubeTabID);
        console.log(`AutoMix; Wating for recommendations to load`);
        await attachRecommendationsLoadedObserver(state.youtubeTabID);
    }


    if (changeInfo.status === "loading" && state.attachedListener === true && state.nextVideoId !== null) {
        attachVideoEndedListener(tabId, state.nextVideoId);
    }

})

chrome.runtime.onMessage.addListener(async (msg: Message, _sender, _sendResponse) => {
    const state = await getAutoMixState();
    if (state.youtubeTabID === undefined) return;
    if (msg.videoStartMessage) {
        console.log(`AutoMix; Message => videoStartMessage`);
        handleVideoStartMessage();
    }
    else if (msg.recommendationsLoadedMessage) {
        console.log(`AutoMix; Message => recommendationsLoadedMessage`);
        handleRecommendationsLoadedMessage();
    }
    else if (msg.videoEndMessage) {
        console.log(`AutoMix; Message => videoEndMessage`);
        handleVideoEndMessage(msg.videoEndMessage);
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
        });
    }
    if (command == "toggleTheatreMode") {
        state.ensureTheatreMode = !state.ensureTheatreMode;
        const msg: PopupMessage = { ensureTheatreMode: state.ensureTheatreMode };
        await chrome.runtime.sendMessage(msg).catch((_e) => { });
        await setAutoMixState(state);
    }
});

async function getRandomRecommendation(tabID: number): Promise<{ url: string, title: string }> {
    const res = await chrome.scripting.executeScript({
        target: { tabId: tabID },
        func: extractRecommendations,
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

        if (valid_recommendations.length === 0 && state.recommendations.length === 0) {
            throw new Error("No recommendation found");
        }

        const new_recommendations: { videoID: string, title: string }[] = [];
        const indexes: number[] = [];
        if (valid_recommendations.length > 3) {
            for (let i = 0; i < 3; i++) {
                let j = Math.floor(Math.random() * valid_recommendations.length);
                while (indexes.includes(j)) {
                    j = Math.floor(Math.random() * valid_recommendations.length);
                }
                indexes.push(j);

                const recommendation = valid_recommendations[j];
                new_recommendations[i] = { videoID: extractVideoId(recommendation.video_url)!, title: recommendation.video_title };
            }
        } else {
            new_recommendations.concat(
                valid_recommendations.map(
                    x => { return { videoID: extractVideoId(x.video_url)!, title: x.video_title } }
                )
            );
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
    chrome.tabs.update(tabID, { url: nextVideoUrl });

    const state = await getAutoMixState();
    state.attachedListener = false;
    await setAutoMixState(state);
}

async function attachVideoEndedListener(tabID: number, nextVideoUrl: string) {
    console.log(`AutoMix; Ataching ended event listener`);
    await chrome.scripting.executeScript({
        target: { tabId: tabID },
        func: addVideoEndedListener,
        args: [nextVideoUrl]
    });
}

async function disableAutoplay(tabID: number) {
    await chrome.scripting.executeScript({
        target: { tabId: tabID },
        files: ["disable_autoplay.js"],
    });
}

async function ensureTheatreMode(tabID: number) {
    await chrome.scripting.executeScript({
        target: { tabId: tabID },
        files: ["ensure_theatre_mode.js"],
    });
}

async function ensureHighestQuality(tabID: number) {
    await chrome.scripting.executeScript({
        target: { tabId: tabID },
        world: "MAIN",
        files: ["ensure_highest_quality.js"],
    });
}

async function attachVideoLoadedObserver(tabID: number) {
    await chrome.scripting.executeScript({
        target: { tabId: tabID },
        files: ["video_loaded_observer.js"],
    });
}

async function attachRecommendationsLoadedObserver(tabID: number) {
    await attachLoadAllRecommendations(tabID);
    await chrome.scripting.executeScript({
        target: { tabId: tabID },
        files: ["recommendations_loaded_observer.js"],
    });
}

async function attachLoadAllRecommendations(tabID: number) {
    await chrome.scripting.executeScript({
        target: { tabId: tabID },
        world: "MAIN",
        files: ["load_all_recommendations.js"],
    });
}

async function handleVideoStartMessage() {
    const state = await getAutoMixState();
    if (state.youtubeTabID === undefined) return;

    if (state.ensureHighestQuality) {
        await ensureHighestQuality(state.youtubeTabID);
    }
    disableAutoplay(state.youtubeTabID);
    if (state.ensureTheatreMode) {
        await ensureTheatreMode(state.youtubeTabID);
    }
}

async function handleRecommendationsLoadedMessage() {
    const state = await getAutoMixState();
    if (state.youtubeTabID === undefined) return;

    state.attachedListener = true;
    getRandomRecommendation(state.youtubeTabID).then(
        async (data) => {
            const video_url = data.url;
            const video_title = data.title;
            console.log(`AutoMix; next_video => ${video_title} : ${video_url}`);
            const state = await getAutoMixState();
            state.nextVideoId = extractVideoId(video_url)!;
            state.nextVideoTitle = video_title;
            await setAutoMixState(state);
            await attachVideoEndedListener(state.youtubeTabID!, video_url);

            let genre: string | undefined = "Music";
            if (state.filterOutNonMusicContent === true) {
                const res = await chrome.scripting.executeScript({
                    target: { tabId: state.youtubeTabID! },
                    func: extractGenre,
                });
                genre = res.at(0)?.result;
            }

            if (genre !== "Music") {
                await chrome.scripting.executeScript({
                    target: { tabId: state.youtubeTabID! },
                    func:
                        () => {
                            const video = document.querySelectorAll('video')[0];
                            console.log(`AutoMix; Skipping video => ${video.duration}`);
                            video.currentTime = video.duration - 1;
                        }
                });
            }
        });
    await setAutoMixState(state);
}


async function handleVideoEndMessage(msg: VideoEndMessage) {
    const state = await getAutoMixState();
    if (state.youtubeTabID === undefined || state.attachedListener === false) return;

    console.log(`AutoMix; Message => `);
    console.log(msg);

    if (msg.ended === true) {
        navigateToNextVideo(state.youtubeTabID, msg.nextVideoUrl);
    }
}
