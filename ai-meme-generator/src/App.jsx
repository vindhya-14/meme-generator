import React, { useState, useRef } from "react";
import axios from "axios";

function App() {
  const [image, setImage] = useState(null);
  const [topic, setTopic] = useState("");
  const [memeText, setMemeText] = useState("");
  const [finalImage, setFinalImage] = useState("");
  const [isGenerating, setIsGenerating] = useState(false);
  const [isDrawing, setIsDrawing] = useState(false);
  const canvasRef = useRef(null);

  const handleImageUpload = (e) => {
    const file = e.target.files[0];
    if (file && file.size > 5 * 1024 * 1024) {
      // 5MB limit
      alert("File size should be less than 5MB");
      return;
    }
    setImage(URL.createObjectURL(file));
    setFinalImage(""); // Reset final image when new image is uploaded
  };

  const generateMeme = async () => {
    if (!topic) return;

    try {
      setIsGenerating(true);
      setMemeText(""); // Clear previous text
      const res = await axios.post("http://localhost:5000/generate-meme", {
        topic,
      });
      setMemeText(res.data.meme_text);
    } catch (err) {
      console.error("Error generating meme text:", err);
      alert("Failed to generate meme text. Please try again.");
    } finally {
      setIsGenerating(false);
    }
  };

  const drawMeme = () => {
    if (!image || !memeText) return;

    setIsDrawing(true);
    const canvas = document.createElement("canvas");
    const ctx = canvas.getContext("2d");
    const img = new Image();
    img.crossOrigin = "anonymous";
    img.src = image;

    img.onload = () => {
      // Calculate dimensions while maintaining aspect ratio
      const maxWidth = 800;
      const maxHeight = 600;
      let width = img.width;
      let height = img.height;

      if (width > maxWidth) {
        height = (maxWidth / width) * height;
        width = maxWidth;
      }
      if (height > maxHeight) {
        width = (maxHeight / height) * width;
        height = maxHeight;
      }

      canvas.width = width;
      canvas.height = height;

      // Draw image
      ctx.drawImage(img, 0, 0, width, height);

      // Set text style
      const fontSize = Math.max(24, Math.min(width / 15, 48));
      ctx.font = `bold ${fontSize}px Impact, Arial, sans-serif`;
      ctx.fillStyle = "white";
      ctx.strokeStyle = "black";
      ctx.lineWidth = fontSize / 12;
      ctx.textAlign = "center";

      // Calculate text position (with word wrapping)
      const x = width / 2;
      const y = height * 0.1; // 10% from top
      const maxTextWidth = width * 0.9; // 90% of image width

      // Wrap text function
      const lines = wrapText(ctx, memeText.toUpperCase(), maxTextWidth);

      // Draw each line
      lines.forEach((line, i) => {
        ctx.fillText(line, x, y + i * (fontSize * 1.2));
        ctx.strokeText(line, x, y + i * (fontSize * 1.2));
      });

      const final = canvas.toDataURL("image/png");
      setFinalImage(final);
      setIsDrawing(false);
    };

    img.onerror = () => {
      setIsDrawing(false);
      alert("Error loading image. Please try another one.");
    };
  };

  // Helper function to wrap text
  const wrapText = (ctx, text, maxWidth) => {
    const words = text.split(" ");
    const lines = [];
    let currentLine = words[0];

    for (let i = 1; i < words.length; i++) {
      const word = words[i];
      const width = ctx.measureText(currentLine + " " + word).width;
      if (width < maxWidth) {
        currentLine += " " + word;
      } else {
        lines.push(currentLine);
        currentLine = word;
      }
    }
    lines.push(currentLine);
    return lines;
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-purple-900 to-gray-900 text-white px-4 py-12">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <header className="text-center mb-12">
          <h1 className="text-5xl md:text-6xl font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-yellow-400 via-pink-500 to-red-500 mb-4">
            AI Meme Generator
          </h1>
          <p className="text-xl text-gray-300 max-w-2xl mx-auto">
            Upload an image, enter a topic, and let AI create hilarious memes
            for you!
          </p>
        </header>

        {/* Main Content */}
        <main className="bg-gray-800/50 backdrop-blur-sm rounded-2xl p-6 md:p-8 shadow-2xl border border-gray-700/50">
          {/* Upload Section */}
          <div className="mb-8">
            <label className="block mb-2 text-lg font-medium text-gray-300">
              Upload Your Image
            </label>
            <div className="flex flex-col items-center justify-center border-2 border-dashed border-gray-600 rounded-xl p-6 transition-all hover:border-pink-500 hover:bg-gray-700/30">
              <input
                type="file"
                onChange={handleImageUpload}
                className="hidden"
                id="file-upload"
                accept="image/*"
              />
              <label
                htmlFor="file-upload"
                className="cursor-pointer flex flex-col items-center justify-center w-full"
              >
                {image ? (
                  <div className="relative">
                    <img
                      src={image}
                      alt="Preview"
                      className="max-h-64 rounded-lg mb-4 shadow-md"
                    />
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        setImage(null);
                        setFinalImage("");
                      }}
                      className="absolute top-2 right-2 bg-red-500 hover:bg-red-600 text-white rounded-full p-1 shadow-lg"
                    >
                      <svg
                        xmlns="http://www.w3.org/2000/svg"
                        className="h-5 w-5"
                        viewBox="0 0 20 20"
                        fill="currentColor"
                      >
                        <path
                          fillRule="evenodd"
                          d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z"
                          clipRule="evenodd"
                        />
                      </svg>
                    </button>
                  </div>
                ) : (
                  <>
                    <svg
                      className="w-12 h-12 text-pink-500 mb-3"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                      xmlns="http://www.w3.org/2000/svg"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"
                      />
                    </svg>
                    <span className="text-gray-400 mb-1">
                      Click to upload or drag and drop
                    </span>
                    <span className="text-sm text-gray-500">
                      PNG, JPG, GIF (MAX. 5MB)
                    </span>
                  </>
                )}
              </label>
            </div>
          </div>

          {/* Topic Input */}
          <div className="mb-8">
            <label className="block mb-2 text-lg font-medium text-gray-300">
              Meme Topic
            </label>
            <div className="relative">
              <input
                type="text"
                placeholder="e.g. coding, exam, life, relationships..."
                value={topic}
                onChange={(e) => setTopic(e.target.value)}
                className="w-full px-5 py-3 rounded-xl bg-gray-700 border border-gray-600 focus:ring-2 focus:ring-pink-500 focus:border-transparent text-white placeholder-gray-400 transition-all duration-200 shadow-lg"
                onKeyPress={(e) => e.key === "Enter" && generateMeme()}
              />
              <div className="absolute right-2 top-2">
                <button
                  onClick={generateMeme}
                  disabled={!topic || isGenerating}
                  className={`flex items-center px-4 py-1 rounded-lg font-semibold transition-all duration-200 shadow-lg ${
                    !topic || isGenerating
                      ? "bg-gray-600 cursor-not-allowed"
                      : "bg-blue-600 hover:bg-blue-700"
                  }`}
                >
                  {isGenerating ? (
                    <>
                      <svg
                        className="animate-spin -ml-1 mr-2 h-4 w-4 text-white"
                        xmlns="http://www.w3.org/2000/svg"
                        fill="none"
                        viewBox="0 0 24 24"
                      >
                        <circle
                          className="opacity-25"
                          cx="12"
                          cy="12"
                          r="10"
                          stroke="currentColor"
                          strokeWidth="4"
                        ></circle>
                        <path
                          className="opacity-75"
                          fill="currentColor"
                          d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                        ></path>
                      </svg>
                      Generating...
                    </>
                  ) : (
                    "Generate Text"
                  )}
                </button>
              </div>
            </div>
          </div>

          {/* Generated Text */}
          {memeText && (
            <div className="mb-8 bg-gray-700/50 rounded-xl p-4 border border-gray-600">
              <div className="flex justify-between items-center mb-2">
                <h3 className="text-lg font-medium text-gray-300">
                  Generated Meme Text:
                </h3>
                <button
                  onClick={() => navigator.clipboard.writeText(memeText)}
                  className="text-pink-400 hover:text-pink-300 flex items-center text-sm"
                >
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    className="h-4 w-4 mr-1"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M8 5H6a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2v-1M8 5a2 2 0 002 2h2a2 2 0 002-2M8 5a2 2 0 012-2h2a2 2 0 012 2m0 0h2a2 2 0 012 2v3m2 4H10m0 0l3-3m-3 3l3 3"
                    />
                  </svg>
                  Copy
                </button>
              </div>
              <p className="text-xl font-bold text-pink-400">{memeText}</p>
            </div>
          )}

          {/* Action Buttons */}
          <div className="flex flex-wrap gap-4 justify-center mb-8">
            <button
              onClick={drawMeme}
              disabled={!image || !memeText || isDrawing}
              className={`flex items-center px-6 py-3 rounded-xl font-semibold transition-all duration-200 shadow-lg transform hover:scale-105 ${
                !image || !memeText || isDrawing
                  ? "bg-gray-600 cursor-not-allowed"
                  : "bg-gradient-to-r from-green-500 to-emerald-600 hover:from-green-600 hover:to-emerald-700"
              }`}
            >
              {isDrawing ? (
                <>
                  <svg
                    className="animate-spin -ml-1 mr-2 h-5 w-5 text-white"
                    xmlns="http://www.w3.org/2000/svg"
                    fill="none"
                    viewBox="0 0 24 24"
                  >
                    <circle
                      className="opacity-25"
                      cx="12"
                      cy="12"
                      r="10"
                      stroke="currentColor"
                      strokeWidth="4"
                    ></circle>
                    <path
                      className="opacity-75"
                      fill="currentColor"
                      d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                    ></path>
                  </svg>
                  Drawing...
                </>
              ) : (
                <>
                  <svg
                    className="w-5 h-5 mr-2"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                    xmlns="http://www.w3.org/2000/svg"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth="2"
                      d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z"
                    ></path>
                  </svg>
                  Draw Meme
                </>
              )}
            </button>
          </div>

          {/* Result */}
          {finalImage && (
            <div className="mt-8 text-center">
              <div className="flex justify-between items-center mb-4">
                <h2 className="text-2xl font-bold text-gray-300">
                  Your Awesome Meme!
                </h2>
                <button
                  onClick={() => setFinalImage("")}
                  className="text-gray-400 hover:text-white"
                >
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    className="h-6 w-6"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M6 18L18 6M6 6l12 12"
                    />
                  </svg>
                </button>
              </div>

              <div className="relative inline-block mb-6">
                <img
                  src={finalImage}
                  alt="Generated Meme"
                  className="mx-auto rounded-xl shadow-2xl max-w-full max-h-[500px] border-4 border-white/10"
                />
              </div>

              <div className="flex flex-wrap justify-center gap-4">
                <a
                  href={finalImage}
                  download={`meme-${Date.now()}.png`}
                  className="inline-flex items-center px-6 py-3 bg-gradient-to-r from-yellow-400 to-yellow-600 hover:from-yellow-500 hover:to-yellow-700 text-black font-bold rounded-xl transition-all duration-200 shadow-lg transform hover:scale-105"
                >
                  <svg
                    className="w-5 h-5 mr-2"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                    xmlns="http://www.w3.org/2000/svg"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth="2"
                      d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4"
                    ></path>
                  </svg>
                  Download Image
                </a>

                <button
                  onClick={() => navigator.clipboard.writeText(memeText)}
                  className="inline-flex items-center px-6 py-3 bg-gradient-to-r from-pink-500 to-purple-600 hover:from-pink-600 hover:to-purple-700 text-white font-bold rounded-xl transition-all duration-200 shadow-lg transform hover:scale-105"
                >
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    className="h-5 w-5 mr-2"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M8 5H6a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2v-1M8 5a2 2 0 002 2h2a2 2 0 002-2M8 5a2 2 0 012-2h2a2 2 0 012 2m0 0h2a2 2 0 012 2v3m2 4H10m0 0l3-3m-3 3l3 3"
                    />
                  </svg>
                  Copy Text
                </button>
              </div>
            </div>
          )}
        </main>

        {/* Footer */}
        <footer className="mt-12 text-center text-gray-500 text-sm">
          <p>Created with ❤️ using React, Tailwind CSS, and AI magic</p>
        </footer>
      </div>
    </div>
  );
}

export default App;
