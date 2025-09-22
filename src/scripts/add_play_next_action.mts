import { Message } from "../interfaces.mjs";

export function addPlayNextAction(nextVideoUrl: string) {
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
