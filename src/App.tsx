import React, { useState, useEffect } from "react";
import "./App.css";
import { llmService, Prediction } from "./services/llmService";

function App() {
  const [inputText, setInputText] = useState("The future of work is");
  const [predictions, setPredictions] = useState<Prediction[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Function to fetch predictions
  const fetchPredictions = async (text: string) => {
    if (!text.trim()) {
      setError("Please enter some text to predict from");
      return;
    }

    setIsLoading(true);
    setError(null);

    try {
      const newPredictions = await llmService.getPredictions(text);
      setPredictions(newPredictions);
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

  const handleWordSelect = async (word: string) => {
    const newText = inputText + (inputText.endsWith(" ") ? "" : " ") + word;
    setIsLoading(true); // Start loading immediately
    setPredictions([]); // Clear predictions while loading new ones
    await fetchPredictions(newText); // Fetch new predictions for the updated text
    setInputText(newText); // Only update the main text after predictions are loaded
  };

  return (
    <div className="app-container">
      <div className="main-content">
        <div className="main-text">{inputText}</div>
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
              return (
                <button
                  key={originalIndex}
                  onClick={() => handleWordSelect(prediction.word)}
                  className={`prediction-word-item ${
                    displayIndex === 2 ? "highlighted" : ""
                  }`} // Highlight the center item (most likely)
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
