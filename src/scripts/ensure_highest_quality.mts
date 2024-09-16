import { VideoPlayer } from "../interfaces.mjs";

(() => {
    console.log(`AutoMix; Ensuring highest quality`);
    const player = document.querySelectorAll('.html5-video-player')[0] as VideoPlayer;
    const quality_levels = player.getAvailableQualityLevels();
    const highest_quality = quality_levels[0];
    console.log(`AutoMix; highest quality ${highest_quality}`);
    const highest2_quality = quality_levels[1];
    player.setPlaybackQualityRange(highest2_quality);
    player.setPlaybackQualityRange(highest_quality);
})();

