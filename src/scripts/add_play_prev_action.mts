export function addPlayPrevAction() {
    const attachMediaSessionPrevAction = () => {
        const video = document.querySelectorAll('video')[0];
        if (video.currentTime > 0) {
            console.log(`AutoMix; Attaching Media Session Prev Track`);
            navigator.mediaSession.setActionHandler('previoustrack', () => {
                console.log(`AutoMix; Media Session Prev Track Action`);
                video.currentTime = 0.0;
            });
        }
        else {
            setTimeout(() => {
                attachMediaSessionPrevAction();
            }, 1000);
        }
    };

    attachMediaSessionPrevAction();
}
