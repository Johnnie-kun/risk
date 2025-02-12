import pandas as pd
import numpy as np
import os
import asyncio
from datetime import datetime
from typing import Dict, Any
from loguru import logger

from models.lstm_model import BitcoinLSTMModel
from utils.technical_indicators import TechnicalIndicators
from utils.sentiment_analysis import NewsAnalyzer
from utils.test_data_generator import generate_mock_bitcoin_data
from config.constants import SENTIMENT_FEATURES, TECHNICAL_FEATURES, VALID_TIMEFRAMES, DEFAULT_PREDICTION_TIMEFRAME
from config.environment import MODEL_PATH

class PredictionService:
    """Service for making Bitcoin price predictions."""

    def __init__(self):
        self.lstm_model = BitcoinLSTMModel()
        self.technical_indicators = TechnicalIndicators()
        self.news_analyzer = NewsAnalyzer()

        # Load model if it exists
        if os.path.exists(MODEL_PATH):
            self.lstm_model.load_model(MODEL_PATH)
            logger.info("Model loaded successfully from {}", MODEL_PATH)
        else:
            logger.warning("No existing model found at {}", MODEL_PATH)

    async def get_bitcoin_data(self) -> pd.DataFrame:
        """Fetch Bitcoin price data from an API."""
        try:
            # TODO: Replace with actual API call
            df = generate_mock_bitcoin_data()
            logger.info("Bitcoin price data fetched successfully")
            return df
        except Exception as e:
            logger.error("Error fetching Bitcoin data: {}", str(e))
            return pd.DataFrame()

    async def prepare_features(self, df: pd.DataFrame) -> pd.DataFrame:
        """Prepare features for model training and prediction."""
        if df.empty:
            raise ValueError("Received empty DataFrame in prepare_features")

        # Compute technical indicators asynchronously
        df = await asyncio.to_thread(self.technical_indicators.calculate_indicators, df)

        # Fetch and aggregate sentiment data asynchronously
        sentiment = await asyncio.to_thread(self._get_sentiment_scores)

        # Add sentiment features to each row
        for col in SENTIMENT_FEATURES:
            df[f"sentiment_{col}"] = sentiment.get(col, 0.0)

        logger.info("Features prepared successfully")
        return df

    async def _get_sentiment_scores(self) -> Dict[str, float]:
        """Fetch sentiment scores for Bitcoin-related news."""
        articles = await asyncio.to_thread(self.news_analyzer.get_crypto_news, days=1)
        return await asyncio.to_thread(self.news_analyzer.get_aggregated_sentiment, articles)

    async def train_model(self, days: int = 30) -> Dict[str, Any]:
        """Train the LSTM model using recent Bitcoin data."""
        df = await self.get_bitcoin_data()
        if df.empty:
            return {"message": "Training aborted: No data available"}

        df = await self.prepare_features(df)

        # Prepare features and target
        feature_columns = TECHNICAL_FEATURES + [f"sentiment_{f}" for f in SENTIMENT_FEATURES]
        X = df[feature_columns].values
        y = df["close"].values

        # Train model
        history = await asyncio.to_thread(self.lstm_model.train, X, y)

        # Save trained model
        os.makedirs(os.path.dirname(MODEL_PATH), exist_ok=True)
        await asyncio.to_thread(self.lstm_model.save_model, MODEL_PATH)
        logger.info("Model trained and saved successfully")

        return {
            "message": "Model trained successfully",
            "history": history.history,
        }

    async def predict(self, timeframe: str = DEFAULT_PREDICTION_TIMEFRAME) -> Dict[str, Any]:
        """Make price predictions based on the latest Bitcoin data."""
        if timeframe not in VALID_TIMEFRAMES:
            raise ValueError(f"Invalid timeframe. Must be one of: {list(VALID_TIMEFRAMES.keys())}")

        df = await self.get_bitcoin_data()
        if df.empty:
            return {"message": "Prediction aborted: No data available"}

        df = await self.prepare_features(df)

        # Prepare features
        feature_columns = TECHNICAL_FEATURES + [f"sentiment_{f}" for f in SENTIMENT_FEATURES]
        X = df[feature_columns].values
        current_price = df["close"].iloc[-1]

        # Run prediction asynchronously
        predicted_price = await asyncio.to_thread(self.lstm_model.predict, X)
        logger.info("Price prediction completed successfully")

        # Calculate prediction metrics
        price_change = ((predicted_price - current_price) / current_price) * 100
        confidence = self._calculate_confidence(df, predicted_price)

        return {
            "timestamp": datetime.utcnow().isoformat(),
            "timeframe": timeframe,
            "current_price": float(current_price),
            "predicted_price": float(predicted_price),
            "price_change_percent": float(price_change),
            "confidence": confidence,
            "technical_indicators": {
                col: float(df[col].iloc[-1]) for col in TECHNICAL_FEATURES
            },
            "sentiment": {
                col: float(df[f"sentiment_{col}"].iloc[-1]) for col in SENTIMENT_FEATURES
            },
        }

    def _calculate_confidence(self, df: pd.DataFrame, predicted_price: float) -> float:
        """
        Calculate confidence score for the prediction.
        This is a placeholder implementation.
        """
        # TODO: Implement actual confidence calculation based on model metrics
        return 0.8
