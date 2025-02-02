import OpenAI from "openai";
import Tesseract from 'tesseract.js';

const openai = new OpenAI({
    apiKey: 'YOUR_OPENAI_APIKEY', // Insert your api key here
    dangerouslyAllowBrowser: true
});

const screenshotButton = document.getElementById('screenshot-button');
const canvas = document.getElementById('screenshot-canvas');
const ctx = canvas.getContext('2d');
const croppedImage = document.getElementById('cropped-image');
const extractedTextDiv = document.getElementById('extracted-text');
const processedTextDiv = document.getElementById('processed-text');

let isCropping = false;
let startX, startY, endX, endY;
let stream;

screenshotButton.addEventListener('click', async () => {
    try {
        if (navigator.mediaDevices && navigator.mediaDevices.getDisplayMedia) {
            // Start stream for screenshot
            stream = await navigator.mediaDevices.getDisplayMedia({ video: true });
            const video = document.createElement('video');
            video.srcObject = stream;
            video.autoplay = true;

            video.onloadedmetadata = async () => {
                // Draw stream on canvas
                canvas.width = video.videoWidth;
                canvas.height = video.videoHeight;
                ctx.drawImage(video, 0, 0, canvas.width, canvas.height);

                // Stop stream
                stream.getTracks().forEach(track => track.stop());
                video.srcObject = null;

                // Crop Screenshot
                isCropping = true;

                canvas.addEventListener('mousedown', startCrop);
                canvas.addEventListener('mouseup', endCrop);
            };
        } else {
            alert('Your browser does not support taking screenshots.');
        }
    } catch (error) {
        console.error('Error taking screenshot:', error);
        alert('An error occurred while taking the screenshot.');
    }
});

function startCrop(e) {
    if (!isCropping) return;

    startX = e.offsetX;
    startY = e.offsetY;
}

function endCrop(e) {
    if (!isCropping) return;

    endX = e.offsetX;
    endY = e.offsetY;

    isCropping = false;

    const width = Math.abs(endX - startX);
    const height = Math.abs(endY - startY);
    const x = Math.min(startX, endX);
    const y = Math.min(startY, endY);

    if (width > 0 && height > 0) {
        const croppedCanvas = document.createElement('canvas');
        croppedCanvas.width = width;
        croppedCanvas.height = height;
        const croppedCtx = croppedCanvas.getContext('2d');
        croppedCtx.drawImage(canvas, x, y, width, height, 0, 0, width, height);

        const dataURL = croppedCanvas.toDataURL('image/png');

        // // Download screenshot
        // const a = document.createElement('a');
        // a.href = dataURL;
        // a.download = 'screenshot.png';
        // document.body.appendChild(a);
        // a.click();
        // document.body.removeChild(a);

        // 
        croppedImage.src = dataURL;
        croppedImage.style.display = 'block';

        Tesseract.recognize(
            dataURL,
            'eng',
            { logger: m => console.log(m) }
        ).then(({ data: { text } }) => {
            extractedTextDiv.textContent = text;

            const prompt = `The following is either some text or some code. If the following is code then fix all possible syntax errors that may be in the code. The following code may have incorrect characters of parenthesis, brackets, semicolons, commas and more. the code is also not formatted well. Correct the syntax of the code by removeing any uneccesary text that may appear and fixing all the syntax error, and lint and properly format the code. you should NOT fix any bugs, change the logic of the code, or add anything extra other then necessary. The goal is the fix the syntax and format. Reply to this message with ONLY the fixed code do not add any message before or after. if the following is text then check any punctuation mistakes. and remove any unneccesaary charecters if they appear and do not make sense in the text. Once again you should NOT change the nature or the text, the words in the text. add anything extra. reply to this message with ONLY the fixed text do not add any message before or after.

            ${text}`;

            openai.chat.completions.create({
                model: "gpt-3.5-turbo",
                messages: [{ role: "user", content: prompt }],
            }).then(completion => {
                const processedText = completion.choices[0].message.content;
                processedTextDiv.textContent = processedText;

                // Console log the entire completion object:
                console.log("OpenAI Response:", completion);

                // Or, console log just the processed text:
                console.log("Processed Text:", processedText);

            }).catch(openaiError => {
                console.error("OpenAI Error:", openaiError);
                processedTextDiv.textContent = "Error processing text with OpenAI.";
            });

        }).catch((error) => {
            console.error("Tesseract Error:", error);
            extractedTextDiv.textContent = "Error during OCR.";
            processedTextDiv.textContent = "Error during OCR. Cannot process.";
        });

    } else {
        alert("Please select a valid area to crop");
    }

    ctx.drawImage(canvas, 0, 0);
}