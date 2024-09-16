export function extractRecommendations(): {
    video_url: string;
    video_title: string;
    duration: string;
}[] | undefined {
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
