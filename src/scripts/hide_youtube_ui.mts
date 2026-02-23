(() => {
    // Firefox bug, workaround
    // TODO: Find proper solution
    setTimeout(() => {
        console.log(`AutoMix; hideYouTubeUI => ${document.getElementById("columns")?.className}`);
        const masthead_container = document.getElementById("masthead-container")?.style;
        const below = document.getElementById("below")?.style;
        const secondary = document.getElementById("secondary")?.style;
        if (masthead_container?.getPropertyValue("display") === "none") {
            masthead_container?.setProperty("display", "");
            below?.setProperty("display", "");
            secondary?.setProperty("display", "");
        } else {
            masthead_container?.setProperty("display", "none");
            below?.setProperty("display", "none");
            secondary?.setProperty("display", "none");
        }
    }, 1000);
})();
