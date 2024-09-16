import { Message } from '../interfaces.mjs';

function getFullyLoadedVideoRecommendationsCount(): number {
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

function createRecommendationsLoadedMessage(): Message {
    const msg: Message = { recommendationsLoadedMessage: true, videoStartMessage: undefined, videoEndMessage: undefined };
    return msg;
}

(() => {
    if (!document.URL) return;

    console.log(`AutoMix; Ataching recommendations loaded observer`);
    const recommendations_count = getFullyLoadedVideoRecommendationsCount();

    if (recommendations_count > 10) {
        const msg: Message = createRecommendationsLoadedMessage();
        chrome.runtime.sendMessage(msg);
    } else {
        const config = { attributes: true, childList: true, subtree: true };
        const observer = new MutationObserver(
            () => {

                const recommendations_count = getFullyLoadedVideoRecommendationsCount();
                if (recommendations_count > 10) {
                    observer.disconnect();
                    console.log(`AutoMix; Mutation Recommendations loaded => ${recommendations_count}`);
                    const msg: Message = createRecommendationsLoadedMessage();
                    chrome.runtime.sendMessage(msg);
                }
            });
        observer.observe(document.body, config);
    }
})();
