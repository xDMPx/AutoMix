function ensureTheatreMode(ytd_watch_flexy: Element) {
    const ytd_watch_attributes = [...ytd_watch_flexy.attributes];

    const theatre_attribute = ytd_watch_attributes.find((a) => a.name === 'theater' || a.name === 'theater-requested_');
    if (theatre_attribute === undefined) {
        const ytp_right_controls = document.getElementsByClassName('ytp-right-controls')[0];
        const theatre_button = [...ytp_right_controls.childNodes].map((n) => n as HTMLElement).find((n) => n.ariaKeyShortcuts == 't');
        theatre_button?.click();
        // Firefox bug, workaround
        // TODO: Find proper solution
        setTimeout(() => {
            const ytd_watch_attributes = [...ytd_watch_flexy.attributes];
            const theatre_attribute = ytd_watch_attributes.find((a) => a.name === 'theater' || a.name === 'theater-requested_');
            if (theatre_attribute === undefined) {
                console.log(`AutoMix; Delayed ensuring of theatre mode`);
                const ytp_right_controls = document.getElementsByClassName('ytp-right-controls')[0];
                const theatre_button = [...ytp_right_controls.childNodes].map((n) => n as HTMLElement).find((n) => n.ariaKeyShortcuts == 't');
                theatre_button?.click();
            }
        }, 1000);
    }
}


(() => {
    console.log(`AutoMix; Ensuring theatre mode`);
    let ytd_watch_flexy = document.getElementsByTagName('ytd-watch-flexy').item(0);
    if (ytd_watch_flexy === null) {
        const config = { attributes: true, childList: true, subtree: true };
        const observer = new MutationObserver(() => {
            let ytd_watch_flexy = document.getElementsByTagName('ytd-watch-flexy').item(0);
            if (ytd_watch_flexy !== null) {
                ensureTheatreMode(ytd_watch_flexy);
                observer.disconnect();
            }
        });

        observer.observe(document.body, config);
        return;
    }
    ensureTheatreMode(ytd_watch_flexy);
})();
