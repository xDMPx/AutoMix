interface AutoMixState {
    youtubeTabID: number | undefined,
    playedVideos: string[],
    attachedListener: boolean,
    ensureTheatreMode: boolean,
    ensureHighestQuality: boolean,
    recommendations: { videoID: string, title: string }[],
    recommendationsArrayMaxSize: number,
    nextVideoId: string | null,
    nextVideoTitle: string | null,
}

interface Message {
    videoEndMessage: VideoEndMessage | undefined,
    videoStartMessage: boolean | undefined,
    recommendationsLoadedMessage: boolean | undefined,
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

interface YtdContinuationItem extends Element {
    onVisible: () => void
}
