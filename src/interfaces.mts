export interface AutoMixState {
    youtubeTabID: number | undefined,
    playedVideos: string[],
    playedVideosArrayMaxSize: number,
    clearPlayedVideosManually: boolean,
    attachedListener: boolean,
    ensureTheatreMode: boolean,
    ensureHighestQuality: boolean,
    hideYouTubeUI: boolean,
    filterOutNonMusicContent: boolean,
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

export interface AutoMixStateUpdateMessage {
    source: string,
}

export interface VideoPlayer extends Element {
    getAvailableQualityLevels: () => string[]
    setPlaybackQualityRange: (quality: string) => void
    getAvailableAudioTracks: () => AudioTrack[]
    setAudioTrack: (track: AudioTrack) => void
}

export interface AudioTrack {
    tq: { id: string, name: string, isDefault: boolean }
}

export interface YtdContinuationRenderer extends Element {
    onVisible: () => void
}
