interface AutoMixState {
    youtubeTabID: number | undefined,
    playedVideos: string[],
    attached_listener: boolean,
    ensureTheatreMode: boolean,
}

interface Message {
    ended: boolean | undefined,
    next_video_url: string,
}

interface PopupMessage {
    ensureTheatreMode: boolean
}

interface VideoPlayer extends Element {
    getAvailableQualityLevels: () => string[]
    setPlaybackQualityRange: (quality: string) => void
}
