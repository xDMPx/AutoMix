import { Message } from "../interfaces.mjs";

export function addPlayNextAction(nextVideoUrl: string) {
    function extractVideoId(url: string): string | undefined {
        if (url.includes("v=")) {
            const split = url.split("v=");
            const after_v_value = split.at(-1);
            const video_id = after_v_value?.split("&").at(0);
            return video_id;
        }

        return undefined;
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

            const ytp_left_controls = document.getElementsByClassName('ytp-left-controls')[0];
            const ytp_next_button = ytp_left_controls.getElementsByClassName("ytp-next-button")[0] as HTMLAnchorElement;
            ytp_next_button.style.display = "inline-block";
            const data_duration = ytp_next_button.attributes.getNamedItem("data-duration");
            if (data_duration !== null) {
                data_duration.value = "";
            }
            const data_tooltip_text = ytp_next_button.attributes.getNamedItem("data-tooltip-text");
            if (data_tooltip_text !== null) {
                const video_id = extractVideoId(nextVideoUrl);
                data_tooltip_text.value = video_id!;
            }

            const data_preview = ytp_next_button.attributes.getNamedItem("data-preview");
            if (data_preview !== null) {
                const video_id = extractVideoId(nextVideoUrl);
                data_preview.value = `https://i1.ytimg.com/vi/${video_id}/mqdefault.jpg`;
            }

            ytp_next_button.href = `${nextVideoUrl}`;
            ytp_next_button.onclick = () => {
                console.log(`AutoMix; Next Button`);
                const msg: Message = { videoEndMessage: { ended: true, nextVideoUrl: nextVideoUrl }, videoStartMessage: undefined, recommendationsLoadedMessage: undefined };
                chrome.runtime.sendMessage(msg);
            };
            document.addEventListener("keydown", (event) => {
                if (event.shiftKey && event.key === 'N') {
                    const msg: Message = { videoEndMessage: { ended: true, nextVideoUrl: nextVideoUrl }, videoStartMessage: undefined, recommendationsLoadedMessage: undefined };
                    chrome.runtime.sendMessage(msg);
                }
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
