// Function to capture the manga image
function captureMangaImage() {
    return new Promise((resolve) => {
        // Find the manga image
        const images = document.querySelectorAll("img");
        let mangaImage = null;

        // Look for the largest image that's likely the manga page
        images.forEach(img => {
            if (img.width > 300 && img.height > 300) {
                mangaImage = img;
            }
        });

        if (!mangaImage) {
            resolve(null);
            return;
        }

        // Create a canvas element
        const canvas = document.createElement('canvas');
        const context = canvas.getContext('2d');
        
        // Set canvas size to match the image
        canvas.width = mangaImage.width;
        canvas.height = mangaImage.height;
        
        // Draw the image to the canvas
        context.drawImage(mangaImage, 0, 0);
        
        // Convert canvas to base64 image
        const imageData = canvas.toDataURL('image/png');
        resolve(imageData);
    });
}

// Listen for messages from the popup
chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
    if (request.action === 'capture') {
        captureMangaImage().then(imageData => {
            sendResponse({ imageData });
        });
        return true; // Will respond asynchronously
    }
});

(async function () {
    // Load Tesseract.js
    const script = document.createElement("script");
    script.src = "https://cdnjs.cloudflare.com/ajax/libs/tesseract.js/4.0.2/tesseract.min.js";
    document.body.appendChild(script);

    script.onload = async function () {
        const Tesseract = window.Tesseract;

        // Capture the first large image (manga page)
        const images = document.querySelectorAll("img");
        let mangaImage = null;

        images.forEach(img => {
            if (img.width > 300 && img.height > 300) {
                mangaImage = img;
            }
        });

        if (!mangaImage) {
            alert("No manga image found!");
            return;
        }

        // Perform OCR
        const result = await Tesseract.recognize(mangaImage.src, "eng", {
            logger: (m) => console.log(m),
        });

        const extractedText = result.data.text.trim();
        if (extractedText) {
            alert("Extracted Text: " + extractedText);

            // Read aloud using Web Speech API
            const speech = new SpeechSynthesisUtterance(extractedText);
            speech.lang = "en-US"; // Change based on manga language
            speechSynthesis.speak(speech);
        } else {
            alert("No text detected!");
        }
    };
})();
