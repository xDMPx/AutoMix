(() => {
    console.log(`AutoMix; Disabling autoplay`);
    const ytp_right_controls = document.getElementsByClassName('ytp-right-controls')[0];
    const autoplay_button = ytp_right_controls.childNodes[1] as HTMLElement;
    const autoplay_enabled = (autoplay_button.childNodes[0].childNodes[0] as HTMLElement).ariaChecked === 'true';

    if (autoplay_enabled) {
        autoplay_button.click();
    }
})();
