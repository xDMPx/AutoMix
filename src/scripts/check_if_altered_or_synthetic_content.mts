export function checkIfAlteredOrSyntheticContent(): boolean | undefined {
    const altered_or_synthetic_content_elements = document.getElementsByTagName('how-this-was-made-section-view-model');

    console.log(`AutoMix; altered_or_synthetic_content_elements => ${altered_or_synthetic_content_elements}"}`);
    if (altered_or_synthetic_content_elements.length !== 0) {
        return true;
    }
    return false;
}
