export function extractGenre(): string | undefined {
    const genre_meta = document.querySelector('meta[itemprop="genre"]');

    if (genre_meta === null || !(genre_meta instanceof HTMLMetaElement)) {
        return undefined;
    }

    const genre = genre_meta.content;
    console.log(`AutoMix; genre => ${genre} || ${genre === "Music"}`);

    return genre;
}
