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
