interface AutoMixState {
    youtubeTabID: number | undefined,
    playedVideos: string[],
    attachedListener: boolean,
    ensureTheatreMode: boolean,
    ensureHighestQuality: boolean,
    nextVideoId: string | null,
    nextVideoTitle: string | null,
}

interface Message {
    videoEndMessage: VideoEndMessage | undefined,
    videoStartMessage: boolean | undefined,
}

interface VideoEndMessage {
    ended: boolean | undefined,
    nextVideoUrl: string,
}

interface PopupMessage {
    ensureTheatreMode: boolean,
}

interface VideoPlayer extends Element {
    getAvailableQualityLevels: () => string[]
    setPlaybackQualityRange: (quality: string) => void
}
