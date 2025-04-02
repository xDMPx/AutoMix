(() => {
    console.log(`AutoMix; Disabling autoplay`);
    const ytp_right_controls = document.getElementsByClassName('ytp-right-controls')[0];
    const autoplay_button = ytp_right_controls.childNodes[1] as HTMLElement;
    const autoplay_enabled = (autoplay_button.childNodes[0].childNodes[0] as HTMLElement).ariaChecked === 'true';

    if (autoplay_enabled) {
        autoplay_button.click();
        // Firefox bug, workaround
        // TODO: Find proper solution
        setTimeout(() => {
            const ytp_right_controls = document.getElementsByClassName('ytp-right-controls')[0];
            const autoplay_button = ytp_right_controls.childNodes[1] as HTMLElement;
            const autoplay_enabled = (autoplay_button.childNodes[0].childNodes[0] as HTMLElement).ariaChecked === 'true';
            if (autoplay_enabled) {
                console.log(`AutoMix; Delayed disabling of autoplay`);
                const autoplay_button = ytp_right_controls.childNodes[1] as HTMLElement;
                autoplay_button.click();
            }
        }, 1000);
    }
})();
