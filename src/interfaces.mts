export interface AutoMixState {
    youtubeTabID: number | undefined,
    playedVideos: string[],
    playedVideosArrayMaxSize: number,
    clearPlayedVideosManually: boolean,
    attachedListener: boolean,
    ensureTheatreMode: boolean,
    ensureHighestQuality: boolean,
    recommendations: { videoID: string, title: string }[],
    recommendationsArrayMaxSize: number,
    nextVideoId: string | null,
    nextVideoTitle: string | null,
}

export interface Message {
    videoEndMessage: VideoEndMessage | undefined,
    videoStartMessage: boolean | undefined,
    recommendationsLoadedMessage: boolean | undefined,
}

export interface VideoEndMessage {
    ended: boolean | undefined,
    nextVideoUrl: string,
}

export interface PopupMessage {
    ensureTheatreMode: boolean,
}

export interface VideoPlayer extends Element {
    getAvailableQualityLevels: () => string[]
    setPlaybackQualityRange: (quality: string) => void
}

export interface YtdContinuationRenderer extends Element {
    onVisible: () => void
}
