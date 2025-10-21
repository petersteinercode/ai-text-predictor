import React, { useState, useEffect } from "react";
import "./App.css";
import { llmService, Prediction } from "./services/llmService";

function App() {
  const [inputText, setInputText] = useState("The future of work is");
  const [predictions, setPredictions] = useState<Prediction[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Auto-load predictions on component mount
  useEffect(() => {
    handlePredict();
  }, []);

  const handlePredict = async () => {
    if (!inputText.trim()) {
      setError("Please enter some text to predict from");
      return;
    }

    setIsLoading(true);
    setError(null);

    try {
      const predictions = await llmService.getPredictions(inputText);
      setPredictions(predictions);
    } catch (err) {
      setError("Failed to get predictions. Please try again.");
      console.error("Prediction error:", err);
    } finally {
      setIsLoading(false);
    }
  };

  const handleWordSelect = async (word: string) => {
    const newText = inputText + (inputText.endsWith(" ") ? "" : " ") + word;
    setInputText(newText);
    setPredictions([]);
    
    // Automatically run prediction for the new text
    setIsLoading(true);
    setError(null);
    
    try {
      const newPredictions = await llmService.getPredictions(newText);
      setPredictions(newPredictions);
    } catch (err) {
      setError("Failed to get predictions. Please try again.");
      console.error("Prediction error:", err);
    } finally {
      setIsLoading(false);
    }
  };

  const handleClear = () => {
    setInputText("The future of work is");
    setPredictions([]);
    setError(null);
  };

  return (
    <div className="app">
      <div className="container">
        <h1 className="title">AI Text Predictor</h1>
        <p className="subtitle">
          Start with "The future of work is" and let AI predict the next words
        </p>

        <div className="input-section">
          <div className="input-container">
            <textarea
              value={inputText}
              onChange={(e) => setInputText(e.target.value)}
              placeholder="The future of work is..."
              className="text-input"
              rows={4}
            />
          </div>

          <div className="button-group">
            <button
              onClick={handlePredict}
              disabled={isLoading}
              className="predict-button"
            >
              {isLoading ? "Predicting..." : "Predict Next Words"}
            </button>
            <button onClick={handleClear} className="clear-button">
              Clear
            </button>
          </div>
        </div>

        {error && <div className="error-message">{error}</div>}

        {predictions.length > 0 && (
          <div className="predictions-section">
            <h3 className="predictions-title">Top 5 Predictions:</h3>
            <div className="predictions-grid">
              {predictions.map((prediction, index) => (
                <button
                  key={index}
                  onClick={() => handleWordSelect(prediction.word)}
                  className="prediction-card"
                >
                  <div className="prediction-word">{prediction.word}</div>
                  <div className="prediction-probability">
                    {(prediction.probability * 100).toFixed(1)}%
                  </div>
                </button>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

export default App;
