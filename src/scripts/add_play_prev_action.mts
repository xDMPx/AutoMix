export function addPlayPrevAction() {
    function extractVideoId(url: string): string | undefined {
        if (url.includes("v=")) {
            const split = url.split("v=");
            const after_v_value = split.at(-1);
            const video_id = after_v_value?.split("&").at(0);
            return video_id;
        }

        return undefined;
    }

    const attachMediaSessionPrevAction = () => {
        const video = document.querySelectorAll('video')[0];
        if (video.currentTime > 0) {
            console.log(`AutoMix; Attaching Media Session Prev Track`);
            navigator.mediaSession.setActionHandler('previoustrack', () => {
                console.log(`AutoMix; Media Session Prev Track Action`);
                video.currentTime = 0.0;
            });

            const ytp_left_controls = document.getElementsByClassName('ytp-left-controls')[0];
            const ytp_prev_button = ytp_left_controls.getElementsByClassName("ytp-prev-button")[0] as HTMLAnchorElement;
            ytp_prev_button.style.display = "inline-block";
            ytp_prev_button.ariaDisabled = "false";
            ytp_prev_button.ariaLabel = "Replay";
            ytp_prev_button.title = "Replay";
            ytp_prev_button.setAttribute("data-tooltip-title", "Replay");
            ytp_prev_button.onclick = () => {
                const video = document.querySelectorAll('video')[0];
                console.log(`AutoMix; Prev Button`);
                video.currentTime = 0.0;
            };
            document.addEventListener("keydown", (event) => {
                if (event.shiftKey && event.key === 'p') {
                    video.currentTime = 0.0;
                }
            });
            let play_next_data_preview = "";
            ytp_prev_button.onmouseenter = () => {
                const ytp_next_button = ytp_left_controls.getElementsByClassName("ytp-next-button")[0] as HTMLAnchorElement;
                const data_preview = ytp_next_button.attributes.getNamedItem("data-preview");
                if (data_preview !== null) {
                    play_next_data_preview = data_preview.value;
                    const video_id = extractVideoId(document.URL);
                    data_preview.value = `https://i1.ytimg.com/vi/${video_id}/mqdefault.jpg`;
                }
                ytp_next_button.dispatchEvent(new Event("mouseover"));
                const ytp_tooltip = document.getElementsByClassName("ytp-tooltip ytp-bottom")[0] as HTMLElement;
                ytp_tooltip.style.left = `${ytp_prev_button.offsetWidth / 2}px`;
                ytp_tooltip.getElementsByClassName("ytp-tooltip-title")[0].children[0].textContent = "Replay";
                ytp_tooltip.getElementsByClassName("ytp-tooltip-keyboard-shortcut")[0].textContent = "SHIFT+P";
            }

            ytp_prev_button.onmouseout = () => {
                const ytp_next_button = ytp_left_controls.getElementsByClassName("ytp-next-button")[0] as HTMLAnchorElement;
                const data_preview = ytp_next_button.attributes.getNamedItem("data-preview");
                if (data_preview !== null) {
                    data_preview.value = play_next_data_preview;
                }
                ytp_next_button.dispatchEvent(new Event("mouseout"));
            }
        }
        else {
            setTimeout(() => {
                attachMediaSessionPrevAction();
            }, 1000);
        }
    };

    attachMediaSessionPrevAction();
}
