import OpenAI from "openai";

export interface Prediction {
  word: string;
  probability: number;
}

class LLMService {
  private openai: OpenAI | null = null;
  private isInitialized = false;

  constructor() {
    this.initialize();
  }

  private initialize() {
    const apiKey = import.meta.env.VITE_OPENAI_API_KEY;
    if (apiKey) {
      this.openai = new OpenAI({
        apiKey: apiKey,
        dangerouslyAllowBrowser: true, // Note: In production, use a backend proxy
      });
      this.isInitialized = true;
    } else {
      console.warn("OpenAI API key not found. Using mock predictions.");
    }
  }

  async getPredictions(text: string): Promise<Prediction[]> {
    if (!this.isInitialized || !this.openai) {
      return this.getMockPredictions(text);
    }

    try {
      const response = await this.openai.chat.completions.create({
        model: "gpt-4o-mini",
        messages: [
          {
            role: "system",
            content: `You are a text prediction assistant. Given a piece of text, predict the next 5 most likely DIFFERENT words that could follow. 
            IMPORTANT: Each word must be unique - no duplicates allowed.
            Return your response as a JSON array of objects with "word" and "probability" fields. 
            The probability should be a number between 0 and 1 representing how likely that word is to follow the given text.
            Provide diverse, contextually appropriate words that could naturally follow the text.
            Example format: [{"word": "the", "probability": 0.8}, {"word": "and", "probability": 0.6}, {"word": "to", "probability": 0.4}, {"word": "in", "probability": 0.3}, {"word": "for", "probability": 0.2}]`,
          },
          {
            role: "user",
            content: `Predict the next 5 most likely words for this text: "${text}"`,
          },
        ],
        temperature: 0.7,
        max_tokens: 200,
      });

      const content = response.choices[0]?.message?.content;
      if (content) {
        try {
          const predictions = JSON.parse(content);
          // Remove duplicates and ensure we have unique words
          const uniquePredictions = predictions
            .filter(
              (pred, index, self) =>
                index === self.findIndex((p) => p.word === pred.word)
            )
            .slice(0, 5);

          // If we don't have enough unique predictions, fall back to mock
          if (uniquePredictions.length < 3) {
            console.warn(
              "LLM returned too few unique predictions, using mock fallback"
            );
            return this.getMockPredictions(text);
          }

          return uniquePredictions;
        } catch (parseError) {
          console.error("Failed to parse LLM response:", parseError);
          return this.getMockPredictions(text);
        }
      }
    } catch (error) {
      console.error("LLM API error:", error);
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
      .sort((a, b) => b.probability - a.probability)
      .slice(0, 5);

    return uniquePredictions;
  }
}

export const llmService = new LLMService();
