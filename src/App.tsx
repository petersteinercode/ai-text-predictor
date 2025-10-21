import { useState, useEffect } from "react";
import "./App.css";
import { llmService, Prediction } from "./services/llmService";

function App() {
  const [inputText, setInputText] = useState("The future of work is");
  const [predictions, setPredictions] = useState<Prediction[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [animationStep, setAnimationStep] = useState(0);
  const [textAnimationClass, setTextAnimationClass] = useState("");
  const [animationKey, setAnimationKey] = useState(0);
  const [slidingWordIndex, setSlidingWordIndex] = useState<number | null>(null);

  // Function to fetch predictions
  const fetchPredictions = async (text: string) => {
    if (!text.trim()) {
      setError("Please enter some text to predict from");
      return;
    }

    setIsLoading(true);
    setError(null);
    setAnimationStep(0); // Reset animation

    try {
      const newPredictions = await llmService.getPredictions(text);
      setPredictions(newPredictions);

      // Start animation sequence
      // Step 1: Most likely word (center) appears first
      setTimeout(() => setAnimationStep(1), 50);

      // Step 2: Next 2 most likely words appear 0.001s after step 1 starts
      setTimeout(() => setAnimationStep(2), 50);

      // Step 3: Final 2 words appear 0.001s after step 2 starts
      setTimeout(() => setAnimationStep(3), 50);
    } catch (err) {
      setError("Failed to get predictions. Please try again.");
      console.error("Prediction error:", err);
    } finally {
      setIsLoading(false);
    }
  };

  // Auto-load predictions on component mount
  useEffect(() => {
    fetchPredictions(inputText);
  }, []); // Empty dependency array means it runs once on mount

  const handleWordSelect = async (word: string, wordIndex: number) => {
    // Check if the word is punctuation - if so, don't add a space before it
    const isPunctuation = /^[.,!?;:()"'`-]+$/.test(word);
    const newText =
      inputText +
      (isPunctuation ? "" : inputText.endsWith(" ") ? "" : " ") +
      word;

    // Trigger word slide-out animation
    setSlidingWordIndex(wordIndex);

    // Start main text slide animation before word slide completes
    setTimeout(async () => {
      // Trigger main text slide animation
      setAnimationKey((prev) => prev + 1);
      setTextAnimationClass("slide-left");

      setIsLoading(true); // Start loading immediately
      setPredictions([]); // Clear predictions while loading new ones
      setAnimationStep(0); // Reset animation

      // Update text and fetch predictions
      setInputText(newText);
      await fetchPredictions(newText);

      // Reset sliding word index
      setSlidingWordIndex(null);
    }, 150); // Start main text slide before word slide completes (0.3s)
  };

  return (
    <div className="app-container">
      <div className="main-content">
        <div key={animationKey} className={`main-text ${textAnimationClass}`}>
          {inputText}
        </div>
        {error && <div className="error-message">{error}</div>}
      </div>

      {isLoading ? (
        <div className="loading-container">
          <div className="loading-spinner"></div>
        </div>
      ) : predictions.length > 0 ? (
        <div className="predictions-list">
          {(() => {
            // Reorder predictions: most likely in center, 2nd/3rd above/below, 4th/5th at top/bottom
            const reorderedPredictions = [
              predictions[3], // 4th most likely at top
              predictions[1], // 2nd most likely
              predictions[0], // 1st most likely (center)
              predictions[2], // 3rd most likely
              predictions[4], // 5th most likely at bottom
            ].filter(Boolean); // Remove any undefined items

            return reorderedPredictions.map((prediction, displayIndex) => {
              const originalIndex = predictions.indexOf(prediction);

              // Determine animation class based on position and animation step
              let animationClass = "";
              if (displayIndex === 2) {
                // Center item (most likely) - appears first
                animationClass = animationStep >= 1 ? "build-in" : "";
              } else if (displayIndex === 1 || displayIndex === 3) {
                // 2nd and 3rd most likely - appear in step 2
                animationClass =
                  animationStep >= 2 ? "build-in build-delay-1" : "";
              } else {
                // 4th and 5th most likely - appear in step 3
                animationClass =
                  animationStep >= 3 ? "build-in build-delay-2" : "";
              }

              return (
                <button
                  key={originalIndex}
                  onClick={() =>
                    handleWordSelect(prediction.word, originalIndex)
                  }
                  className={`prediction-word-item ${
                    displayIndex === 2 ? "highlighted" : ""
                  } ${animationClass} ${
                    slidingWordIndex === originalIndex ? "slide-out" : ""
                  }`}
                >
                  <span className="word-text">{prediction.word}</span>
                  <span className="probability-text">
                    {(prediction.probability * 100).toFixed(1)}%
                  </span>
                </button>
              );
            });
          })()}
        </div>
      ) : null}
    </div>
  );
}

export default App;
