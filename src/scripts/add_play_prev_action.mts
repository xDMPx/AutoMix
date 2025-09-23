export function addPlayPrevAction() {
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
            ytp_prev_button.ariaKeyShortcuts = null;
            ytp_prev_button.ariaDisabled = "false";
            ytp_prev_button.ariaLabel = "Replay";
            ytp_prev_button.title = "Replay";
            ytp_prev_button.setAttribute("data-tooltip-title", "Replay");
            ytp_prev_button.onclick = () => {
                const video = document.querySelectorAll('video')[0];
                console.log(`AutoMix; Prev Button`);
                video.currentTime = 0.0;
            };
        }
        else {
            setTimeout(() => {
                attachMediaSessionPrevAction();
            }, 1000);
        }
    };

    attachMediaSessionPrevAction();
}
