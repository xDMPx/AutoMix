import { getAutoMixState, setAutoMixState } from "./utils.mjs";

async function getEnsureTheatreModeValue(): Promise<boolean> {
    const state = await getAutoMixState();
    return state.ensureTheatreMode;
}

const ensureTheatreModeCheckbox = document.getElementById("ensureTheatreMode") as HTMLInputElement;
getEnsureTheatreModeValue().then(
    (checked) => ensureTheatreModeCheckbox.checked = checked
);

chrome.runtime.onMessage.addListener(async (msg: PopupMessage, _sender, _sendResponse) => {
    console.log(`AutoMixPopup; Message => `);
    console.log(msg);
    ensureTheatreModeCheckbox.checked = msg.ensureTheatreMode;
});

async function clearPlayedVideos() {
    console.log(`AutoMixPopup; Clearing played videos`);
    const state = await getAutoMixState();
    state.playedVideos = [];
    await setAutoMixState(state);
}

(() => {
    const button = document.getElementById("clear-played-button");
    button?.addEventListener("click", clearPlayedVideos);
})()
