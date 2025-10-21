export interface Prediction {
  word: string;
  probability: number;
}

class LLMService {
  private gatewayUrl: string | null = null;
  private isInitialized: boolean = false;

  constructor() {
    this.initialize();
  }

  private initialize() {
    const gatewayUrl = (import.meta as any).env?.VITE_AI_GATEWAY_URL;
    if (gatewayUrl) {
      this.gatewayUrl = gatewayUrl;
      this.isInitialized = true;
    } else {
      console.warn("AI Gateway URL not found. Using mock predictions.");
    }
  }

  async getPredictions(text: string): Promise<Prediction[]> {
    if (!this.isInitialized || !this.gatewayUrl) {
      return this.getMockPredictions(text);
    }

    try {
      // Use Vercel AI Gateway with OpenAI completions API
      const response = await fetch(this.gatewayUrl, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          model: 'gpt-3.5-turbo-instruct',
          prompt: text,
          max_tokens: 1,
          temperature: 0.7,
          logprobs: 5, // Get top 5 log probabilities
          echo: false, // Don't echo the input
        }),
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();
      const logprobs = data.choices?.[0]?.logprobs;
      
      if (logprobs && logprobs.top_logprobs && logprobs.top_logprobs[0]) {
        const topLogprobs = logprobs.top_logprobs[0];

        // Convert log probabilities to regular probabilities
        const predictions: Prediction[] = Object.entries(topLogprobs)
          .map(([token, logprob]) => ({
            word: token.trim(),
            probability: Math.exp(logprob), // Convert log probability to probability
          }))
          .filter((pred) => pred.word.length > 0) // Filter out empty tokens
          .slice(0, 5);

        // Ensure we always return exactly 5 predictions
        if (predictions.length >= 3) {
          // If we have fewer than 5, pad with mock predictions
          if (predictions.length < 5) {
            const mockPredictions = await this.getMockPredictions(text);
            const additionalPredictions = mockPredictions
              .filter((mock) => !predictions.some((p) => p.word === mock.word))
              .slice(0, 5 - predictions.length);
            return [...predictions, ...additionalPredictions].slice(0, 5);
          }
          return predictions;
        }
      }
    } catch (error) {
      console.error("AI Gateway error:", error);
    }

    return this.getMockPredictions(text);
  }

  private async getMockPredictions(text: string): Promise<Prediction[]> {
    // Simulate API delay
    await new Promise((resolve) => setTimeout(resolve, 1000));

    // Enhanced mock predictions based on text context
    const commonWords = [
      "the",
      "and",
      "to",
      "of",
      "a",
      "in",
      "is",
      "it",
      "you",
      "that",
      "he",
      "was",
      "for",
      "on",
      "are",
      "as",
      "with",
      "his",
      "they",
      "i",
      "at",
      "be",
      "this",
      "have",
      "from",
      "or",
      "one",
      "had",
      "by",
      "word",
      "but",
      "not",
      "what",
      "all",
      "were",
      "we",
      "when",
      "your",
      "can",
      "said",
    ];

    // Simple context-aware mock logic
    const words = text.toLowerCase().split(/\s+/);
    const lastWord = words[words.length - 1];

    // Generate contextually relevant mock predictions
    let predictions: Prediction[] = [];

    if (lastWord === "the") {
      predictions = [
        { word: "quick", probability: 0.8 },
        { word: "brown", probability: 0.7 },
        { word: "lazy", probability: 0.6 },
        { word: "red", probability: 0.5 },
        { word: "blue", probability: 0.4 },
      ];
    } else if (lastWord === "and") {
      predictions = [
        { word: "the", probability: 0.9 },
        { word: "then", probability: 0.7 },
        { word: "so", probability: 0.6 },
        { word: "but", probability: 0.5 },
        { word: "or", probability: 0.4 },
      ];
    } else if (text.includes("hello") || text.includes("hi")) {
      predictions = [
        { word: "there", probability: 0.8 },
        { word: "world", probability: 0.7 },
        { word: "how", probability: 0.6 },
        { word: "are", probability: 0.5 },
        { word: "nice", probability: 0.4 },
      ];
    } else {
      // Random predictions with decreasing probabilities
      for (let i = 0; i < 5; i++) {
        const randomWord =
          commonWords[Math.floor(Math.random() * commonWords.length)];
        const probability = Math.random() * 0.8 + 0.1; // 10-90% probability
        predictions.push({
          word: randomWord,
          probability: probability,
        });
      }
    }

    // Sort by probability (highest first) and remove duplicates
    const uniquePredictions = predictions
      .filter(
        (pred, index, self) =>
          index === self.findIndex((p) => p.word === pred.word)
      )
      .sort((a, b) => b.probability - a.probability);

    // Ensure we always return exactly 5 predictions
    if (uniquePredictions.length < 5) {
      // Add more random predictions if we don't have enough
      const additionalWords = commonWords.filter(
        (word) => !uniquePredictions.some((pred) => pred.word === word)
      );

      while (uniquePredictions.length < 5 && additionalWords.length > 0) {
        const randomWord =
          additionalWords[Math.floor(Math.random() * additionalWords.length)];
        const probability = Math.random() * 0.5 + 0.1; // 10-60% probability
        uniquePredictions.push({
          word: randomWord,
          probability: probability,
        });
        // Remove the word we just added to avoid duplicates
        const index = additionalWords.indexOf(randomWord);
        if (index > -1) additionalWords.splice(index, 1);
      }
    }

    return uniquePredictions.slice(0, 5);
  }
}

export const llmService = new LLMService();