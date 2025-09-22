import { Message } from "../interfaces.mjs";

export function addVideoEndedListener(nextVideoUrl: string) {
    const video = document.querySelectorAll('video')[0];

    console.log(`AutoMix; Ataching ended event listener => ${nextVideoUrl}`);
    console.log(`AutoMix; Ataching ended event listener => ${video.ended}`);
    if (!video.ended) {
        video.addEventListener("ended",
            (e: Event) => {
                console.log(`AutoMix; ${e}`);

                const msg: Message = { videoEndMessage: { ended: true, nextVideoUrl: nextVideoUrl }, videoStartMessage: undefined, recommendationsLoadedMessage: undefined };
                chrome.runtime.sendMessage(msg);
            });
    }
    else {
        const msg: Message = { videoEndMessage: { ended: true, nextVideoUrl: nextVideoUrl }, videoStartMessage: undefined, recommendationsLoadedMessage: undefined };
        chrome.runtime.sendMessage(msg);
    }

    const attachMediaSessionNextAction = () => {
        const video = document.querySelectorAll('video')[0];
        if (video.currentTime > 0) {
            console.log(`AutoMix; Attaching Media Session Next Track`);
            navigator.mediaSession.setActionHandler('nexttrack', () => {
                console.log(`AutoMix; Media Session Next Track Action`);
                const msg: Message = { videoEndMessage: { ended: true, nextVideoUrl: nextVideoUrl }, videoStartMessage: undefined, recommendationsLoadedMessage: undefined };
                chrome.runtime.sendMessage(msg);
            });
        }
        else {
            setTimeout(() => {
                attachMediaSessionNextAction();
            }, 1000);
        }
    };
    attachMediaSessionNextAction();
}
