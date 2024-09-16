import { Message } from "../interfaces.mjs";

function createVideoStartMessage(): Message {
    const msg: Message = { videoStartMessage: true, videoEndMessage: undefined, recommendationsLoadedMessage: undefined };
    return msg;
}

(() => {
    if (!document.URL) return;

    console.log(`AutoMix; Ataching video loaded observer`);
    const video_elements = document.querySelectorAll('video');
    if (video_elements.length > 0) {
        const msg = createVideoStartMessage();
        chrome.runtime.sendMessage(msg);
    } else {
        const config = { attributes: true, childList: true, subtree: true };
        const observer = new MutationObserver(() => {
            const video_elements = document.querySelectorAll('video');
            if (video_elements.length > 0) {
                observer.disconnect();
                console.log(`AutoMix; Video loaded`);
                const msg = createVideoStartMessage();
                chrome.runtime.sendMessage(msg);
            }
        });
        observer.observe(document.body, config);
    }
})();
