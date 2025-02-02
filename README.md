# CodeCapture

A web application that captures screenshots, performs Optical Character Recognition (OCR), and processes the extracted text using the OpenAI API.

## Features

*   Takes screenshots of the screen or a selected portion.
*   Performs OCR to extract text from the screenshot.
*   Uses the OpenAI API to process and refine the extracted text (e.g., code formatting, punctuation correction).
*   Displays the raw and processed text.

## Technologies Used

*   HTML
*   CSS
*   JavaScript
*   Tesseract.js (for OCR)
*   OpenAI API (for text processing)

## Setup (For Development)

1.  Clone the repository: `git clone https://github.com/Areeb-Ashraf/CodeCapture.git`
2.  Navigate to the project directory: `cd CodeCapture`
3.  Install dependencies: `npm install openai tesseract.js parcel --save-dev`
4.  *Make sure to replace YOUR_OPENAI_APIKEY with your actual key (DO NOT EXPOSE YOUR KEY, research ways to make it secure)*
5.  Run Parcel: `npx parcel index.html --no-source-maps`
6.  Open `index.html` in your browser.

## How to Use

1.  Click the "Take Screenshot" button.
2.  Select the area you want to capture.
3.  The cropped screenshot will be downloaded, displayed, and the raw text will appear.
4.  The processed text (after OpenAI API call) will be displayed below.