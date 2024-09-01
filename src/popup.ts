interface AutoMixState {
    youtubeTabID: number | undefined,
    playedVideos: string[],
    attached_listener: boolean,
    ensureTheatreMode: boolean,
}

interface PopupMessage {
    ensureTheatreMode: boolean
}

async function getEnsureTheatreModeValue(): Promise<boolean> {
    let { state }: { [key: string]: AutoMixState | undefined } = await chrome.storage.local.get("state");
    console.log(state);
    if (state == undefined) {
        state = {
            youtubeTabID: undefined,
            playedVideos: [],
            attached_listener: false,
            ensureTheatreMode: false
        }
    }

    return state.ensureTheatreMode;
}

const ensureTheatreModeCheckbox = document.getElementById("ensureTheatreMode") as HTMLInputElement;
getEnsureTheatreModeValue().then(
    (checked) => ensureTheatreModeCheckbox.checked = checked
);

chrome.runtime.onMessage.addListener(async (msg: PopupMessage, _sender, _sendResponse) => {
    console.log(`AutoMixPopup; Message => `);
    ensureTheatreModeCheckbox.checked = msg.ensureTheatreMode;
});
