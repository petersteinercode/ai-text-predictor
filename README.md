# AI Text Predictor

A modern web application that uses AI to predict the next words in a text. Built with React, TypeScript, and Vite.

## Features

- **Smart Text Prediction**: Get AI-powered suggestions for the next words in your text
- **Interactive Interface**: Click on predicted words to add them to your text
- **Real-time Predictions**: Get new predictions after each word selection
- **Beautiful UI**: Modern, responsive design with gradient backgrounds
- **LLM Integration**: Supports OpenAI GPT models (with fallback to mock predictions)

## Getting Started

### Prerequisites

- Node.js (version 16 or higher)
- npm or yarn

### Installation

1. Clone or download this project
2. Install dependencies:

   ```bash
   npm install
   ```

3. (Optional) Set up OpenAI API key:
   - Copy `env.example` to `.env`
   - Add your OpenAI API key to the `.env` file:
     ```
     VITE_OPENAI_API_KEY=your_openai_api_key_here
     ```
   - If no API key is provided, the app will use intelligent mock predictions

### Running the App

```bash
npm run dev
```

The app will be available at `http://localhost:3000`

### Building for Production

```bash
npm run build
```

## How to Use

1. **Type your text**: Enter some text in the text area
2. **Get predictions**: Click "Predict Next Words" to see AI-suggested next words
3. **Select words**: Click on any of the 5 predicted words to add it to your text
4. **Continue predicting**: After selecting a word, click "Predict Next Words" again for more suggestions
5. **Clear and start over**: Use the "Clear" button to reset and start fresh

## Features in Detail

### Smart Predictions

- The app analyzes your input text and suggests the 5 most likely next words
- Each prediction shows a probability percentage
- Predictions are contextually relevant to your input

### Interactive Workflow

- Seamlessly add predicted words to your text
- Get new predictions after each word selection
- Build longer texts through iterative prediction

### Modern UI

- Responsive design that works on desktop and mobile
- Beautiful gradient backgrounds and smooth animations
- Intuitive button layouts and clear visual feedback

## Technical Details

- **Frontend**: React 18 with TypeScript
- **Build Tool**: Vite for fast development and building
- **Styling**: CSS with modern features (gradients, flexbox, grid)
- **AI Integration**: OpenAI GPT-3.5-turbo (with intelligent mock fallback)
- **State Management**: React hooks for local state

## API Integration

The app supports OpenAI's GPT models for real predictions. If no API key is provided, it uses intelligent mock predictions that are contextually relevant to your input.

## Development

The project uses:

- **TypeScript** for type safety
- **Vite** for fast development server
- **ESLint** for code quality (if configured)
- **Modern CSS** with flexbox and grid layouts

## License

This project is open source and available under the MIT License.
