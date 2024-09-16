import { Message } from "../interfaces.mjs";


export function addVideoEndedListener(nextVideoUrl: string) {
    const video = document.querySelectorAll('video')[0];

    console.log(`AutoMix; Ataching ended event listener => ${nextVideoUrl}`);
    video.addEventListener("ended",
        (e: Event) => {
            console.log(`AutoMix; ${e}`);

            const msg: Message = { videoEndMessage: { ended: true, nextVideoUrl: nextVideoUrl }, videoStartMessage: undefined, recommendationsLoadedMessage: undefined };
            chrome.runtime.sendMessage(msg);
        });
}
