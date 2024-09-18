import { YtdContinuationRenderer } from "../interfaces.mjs";

function loadMoreRecommendations() {
    const related = document.getElementById("related");
    const ytd_continuation_renderer = related?.getElementsByTagName("ytd-continuation-item-renderer").item(0);
    if (ytd_continuation_renderer !== null && ytd_continuation_renderer !== undefined) {
        (ytd_continuation_renderer as YtdContinuationRenderer).onVisible();
    } else {
        throw Error("No more recommendations to load");
    }
}

(() => {
    let loading_started = false;
    const interval_id = setInterval(() => {
        try {
            console.log("AutoMix; Loading recommendations");
            loadMoreRecommendations();
            loading_started = true;
        } catch (_e) {
            if (loading_started) {
                console.log("AutoMix; All recommendations have been loaded");
                clearInterval(interval_id);
            }
        }
    }, 200);
})();
