export function extractRecommendations(): {
    video_url: string;
    video_title: string;
    duration: string;
}[] | undefined {
    const elements = document.getElementsByTagName("yt-lockup-view-model") as HTMLCollectionOf<HTMLElement>;
    console.log(`AutoMix; elements =>`);
    console.log(elements);
    if (elements.length === 0) {
        return undefined;
    }

    const elements_array = [...elements];
    const recommendations = elements_array.map(
        (element) => {
            const video_url = element.getElementsByTagName("a").item(0)?.href.split('&')[0];
            const video_title = element.getElementsByClassName("yt-lockup-view-model__metadata")[0].getElementsByTagName("span").item(0)?.innerText;
            const duration = element.getElementsByClassName("yt-badge-shape__text").item(0)?.innerHTML;
            if (video_url === undefined || duration === undefined || video_title === undefined) {
                return undefined;
            }
            return { video_url, video_title, duration };
        }).filter((recommendation) => recommendation !== undefined);

    if (recommendations.length === 0) {
        console.log(`AutoMix; No recommendations found`);
        return undefined;
    }

    console.log(recommendations);
    return recommendations;
}
