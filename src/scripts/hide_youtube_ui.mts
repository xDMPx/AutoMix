(() => {
    // Firefox bug, workaround
    // TODO: Find proper solution
    setTimeout(() => {
        console.log(`AutoMix; hideYouTubeUI => ${document.getElementById("columns")?.className}`);
        const masthead_container = document.getElementById("masthead-container")?.style;
        const primary = document.getElementById("primary")?.style;
        const secondary = document.getElementById("secondary")?.style;
        const columns = document.getElementById("columns")?.style;
        if (masthead_container?.getPropertyValue("display") === "none") {
            masthead_container?.setProperty("display", "");
            primary?.setProperty("display", "");
            secondary?.setProperty("display", "");
            columns?.setProperty("display", "");
        } else {
            masthead_container?.setProperty("display", "none");
            primary?.setProperty("display", "none");
            secondary?.setProperty("display", "none");
            columns?.setProperty("display", "none");
        }
    }, 1000);
})();
