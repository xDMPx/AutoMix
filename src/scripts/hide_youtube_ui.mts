(() => {
    // Firefox bug, workaround
    // TODO: Find proper solution
    setTimeout(() => {
        console.log(`AutoMix; hideYouTubeUI => ${document.getElementById("columns")?.className}`)
        document.getElementById("masthead-container")?.style.setProperty("display", "none");
        document.getElementById("primary")?.style.setProperty("display", "none");
        document.getElementById("secondary")?.style.setProperty("display", "none");
        document.getElementById("columns")?.style.setProperty("display", "none");
    }, 1000);
})();
