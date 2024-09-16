(() => {
    console.log(`AutoMix; Ensuring theatre mode`);
    const ytd_watch_attributes = [...document.getElementsByTagName('ytd-watch-flexy')[0].attributes];

    const theatre_attribute = ytd_watch_attributes.find((a) => a.name === 'theatre' || a.name === 'theater-requested_');
    if (theatre_attribute === undefined) {
        const ytp_right_controls = document.getElementsByClassName('ytp-right-controls')[0];
        const theatre_button = ytp_right_controls.childNodes[6] as HTMLElement;
        theatre_button.click();
    }
})();
