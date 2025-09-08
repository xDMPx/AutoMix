import { VideoPlayer } from "../interfaces.mjs";

(() => {
    const player = document.querySelectorAll('.html5-video-player')[0] as VideoPlayer;
    if (player.getAvailableAudioTracks().length != 0) {
        console.log(`AutoMix; Disabling auto dubbing`);
        const orginal_audio_track = player.getAvailableAudioTracks().find((x) => !x.tq.name.endsWith(')'))
        console.log(`AutoMix; Orginal audio track ${orginal_audio_track}`);
        if (orginal_audio_track !== undefined) {
            player.setAudioTrack(orginal_audio_track);
        }
    }
})();

