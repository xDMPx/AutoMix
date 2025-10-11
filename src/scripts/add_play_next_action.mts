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

            const ytp_left_controls = document.getElementsByClassName('ytp-left-controls')[0];
            const ytp_next_button = ytp_left_controls.getElementsByClassName("ytp-next-button")[0] as HTMLAnchorElement;
            ytp_next_button.style.display = "inline-block";
            ytp_next_button.attributes.removeNamedItem("data-duration");
            ytp_next_button.attributes.removeNamedItem("data-tooltip-text");
            ytp_next_button.attributes.removeNamedItem("data-preview");
            ytp_next_button.ariaKeyShortcuts = null;
            ytp_next_button.ariaLabel = "Next";
            const data_tooltip_title = ytp_next_button.attributes.getNamedItem("data-tooltip-title");
            if (data_tooltip_title !== null) {
                data_tooltip_title.value = data_tooltip_title.value.replace(" (SHIFT+n)", "");
            }
            ytp_next_button.title = ytp_next_button.title.replace(" (SHIFT+n)", "");
            ytp_next_button.href = `${nextVideoUrl}`;
            ytp_next_button.onclick = () => {
                console.log(`AutoMix; Next Button`);
                const msg: Message = { videoEndMessage: { ended: true, nextVideoUrl: nextVideoUrl }, videoStartMessage: undefined, recommendationsLoadedMessage: undefined };
                chrome.runtime.sendMessage(msg);
            };
        }
        else {
            setTimeout(() => {
                attachMediaSessionNextAction();
            }, 1000);
        }
    };
    attachMediaSessionNextAction();
}
