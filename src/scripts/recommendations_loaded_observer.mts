import { Message } from '../interfaces.mjs';

export function recommendationsLoadedObserver(min_recommendations_count: number) {

    const getFullyLoadedVideoRecommendationsCount = () => {
        const elements = document.getElementsByTagName("yt-lockup-view-model") as HTMLCollectionOf<HTMLElement>;
        const elements_array = [...elements];
        const recommendations = elements_array.filter((e) => {
            const duration = e.getElementsByClassName("yt-badge-shape__text").item(0)?.innerHTML;
            if (duration === undefined) {
                return undefined;
            }
            return { duration };

        }).filter((r) => r !== undefined);

        return recommendations.length;
    }

    const createRecommendationsLoadedMessage = () => {
        const msg: Message = { recommendationsLoadedMessage: true, videoStartMessage: undefined, videoEndMessage: undefined };
        return msg;
    }

    if (!document.URL) return;

    console.log(`AutoMix; Attaching recommendations loaded observer => ${min_recommendations_count}`);
    const recommendations_count = getFullyLoadedVideoRecommendationsCount();

    if (recommendations_count > min_recommendations_count) {
        const msg: Message = createRecommendationsLoadedMessage();
        chrome.runtime.sendMessage(msg);
    } else {
        const config = { attributes: true, childList: true, subtree: true };
        const observer = new MutationObserver(
            () => {

                const recommendations_count = getFullyLoadedVideoRecommendationsCount();
                if (recommendations_count > min_recommendations_count) {
                    observer.disconnect();
                    console.log(`AutoMix; Mutation Recommendations loaded => ${recommendations_count}`);
                    const msg: Message = createRecommendationsLoadedMessage();
                    chrome.runtime.sendMessage(msg);
                }
            });
        observer.observe(document.body, config);
    }
}
