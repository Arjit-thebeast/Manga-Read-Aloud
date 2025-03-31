// Load Tesseract.js from local file
const script = document.createElement('script');
script.src = chrome.runtime.getURL('lib/tesseract.min.js');
document.head.appendChild(script);

let extractedText = '';
const readAloudButton = document.getElementById('readAloud');
const output = document.getElementById('output');

// Function to read text aloud
function readText(text) {
    // Cancel any ongoing speech
    window.speechSynthesis.cancel();
    
    // Create new speech utterance
    const utterance = new SpeechSynthesisUtterance(text);
    
    // Configure speech settings
    utterance.lang = 'en-US'; // Default to English, can be changed based on manga language
    utterance.rate = 0.9; // Slightly slower rate for better clarity
    utterance.pitch = 1.0;
    utterance.volume = 1.0;
    
    // Start speaking
    window.speechSynthesis.speak(utterance);
}

// Add click handler for read aloud button
readAloudButton.addEventListener('click', () => {
    if (extractedText) {
        readText(extractedText);
    }
});

document.getElementById('capture').addEventListener('click', async () => {
    output.textContent = 'Processing...';
    readAloudButton.disabled = true;

    try {
        // Get the active tab
        const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });
        
        // Inject the content script if not already injected
        await chrome.scripting.executeScript({
            target: { tabId: tab.id },
            files: ['content.js']
        });
        
        // Send message to content script to capture the page
        const response = await new Promise((resolve) => {
            chrome.tabs.sendMessage(tab.id, { action: 'capture' }, (response) => {
                if (chrome.runtime.lastError) {
                    console.error(chrome.runtime.lastError);
                    resolve(null);
                } else {
                    resolve(response);
                }
            });
        });
        
        if (response && response.imageData) {
            try {
                // Initialize Tesseract
                const worker = await Tesseract.createWorker();
                
                // Perform OCR on the captured image
                const { data: { text } } = await worker.recognize(response.imageData, 'eng', {
                    logger: m => console.log(m)
                });
                
                // Store and display the extracted text
                extractedText = text.trim();
                output.textContent = extractedText || 'No text detected';
                
                // Enable read aloud button if text was found
                readAloudButton.disabled = !extractedText;
                
                // Terminate the worker
                await worker.terminate();
            } catch (ocrError) {
                console.error('OCR Error:', ocrError);
                output.textContent = 'Error during OCR processing: ' + ocrError.message;
                readAloudButton.disabled = true;
            }
        } else {
            throw new Error('No manga image found on the page');
        }
    } catch (error) {
        console.error('Capture Error:', error);
        output.textContent = 'Error: ' + error.message;
        readAloudButton.disabled = true;
    }
});
