import React, { useState, useEffect } from "react";
import "./App.css";
import { llmService, Prediction } from "./services/llmService";

function App() {
  const [currentText, setCurrentText] = useState("The future of work is");
  const [predictions, setPredictions] = useState<Prediction[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Auto-predict when component mounts
  useEffect(() => {
    handlePredict();
  }, []);

  const handlePredict = async () => {
    if (!currentText.trim()) {
      setError("No text to predict from");
      return;
    }

    setIsLoading(true);
    setError(null);

    try {
      const predictions = await llmService.getPredictions(currentText);
      setPredictions(predictions);
    } catch (err) {
      setError("Failed to get predictions. Please try again.");
      console.error("Prediction error:", err);
    } finally {
      setIsLoading(false);
    }
  };

  const handleWordSelect = (word: string) => {
    const newText = currentText + " " + word;
    setCurrentText(newText);
    setPredictions([]);
    
    // Auto-predict next word after selection
    setTimeout(() => {
      handlePredict();
    }, 100);
  };

  const handleReset = () => {
    setCurrentText("The future of work is");
    setPredictions([]);
    setError(null);
    
    // Auto-predict after reset
    setTimeout(() => {
      handlePredict();
    }, 100);
  };

  return (
    <div className="app">
      <div className="container">
        <h1 className="title">AI Text Predictor</h1>
        <p className="subtitle">
          Click on a word to continue the sentence
        </p>

        <div className="text-display">
          <span className="base-text">The future of work is</span>
          {currentText !== "The future of work is" && (
            <span className="selected-text">
              {currentText.replace("The future of work is", "")}
            </span>
          )}
        </div>

        {error && <div className="error-message">{error}</div>}

        {isLoading && (
          <div className="loading-message">Predicting next words...</div>
        )}

        {predictions.length > 0 && (
          <div className="predictions-section">
            <div className="bar-graph">
              {predictions.map((prediction, index) => (
                <div
                  key={index}
                  className="prediction-bar"
                  onClick={() => handleWordSelect(prediction.word)}
                  style={{
                    height: `${Math.max(prediction.probability * 200, 20)}px`,
                  }}
                >
                  <div className="bar-percentage">
                    {(prediction.probability * 100).toFixed(1)}%
                  </div>
                  <div className="bar-word">{prediction.word}</div>
                </div>
              ))}
            </div>
          </div>
        )}

        <div className="controls">
          <button onClick={handleReset} className="reset-button">
            Reset
          </button>
        </div>
      </div>
    </div>
  );
}

export default App;
