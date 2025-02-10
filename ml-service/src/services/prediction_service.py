import pandas as pd
import numpy as np
from datetime import datetime, timedelta
import os
from typing import Dict, Any

from models.lstm_model import BitcoinLSTMModel
from utils.technical_indicators import TechnicalIndicators
from utils.sentiment_analysis import NewsAnalyzer

class PredictionService:
    def __init__(self):
        self.lstm_model = BitcoinLSTMModel()
        self.technical_indicators = TechnicalIndicators()
        self.news_analyzer = NewsAnalyzer()
        self.model_path = os.path.join(os.path.dirname(__file__), '../models/saved/lstm_model')
        
        # Load model if exists
        if os.path.exists(self.model_path):
            self.lstm_model.load_model(self.model_path)
    
    async def get_bitcoin_data(self) -> pd.DataFrame:
        """Fetch Bitcoin price data from an API"""
        # You can use ccxt, cryptocompare, or any other crypto API
        # For now, we'll use a placeholder
        # TODO: Implement actual API call
        df = pd.DataFrame({
            'timestamp': pd.date_range(end=datetime.now(), periods=100, freq='H'),
            'close': np.random.normal(50000, 1000, 100),
            'high': np.random.normal(51000, 1000, 100),
            'low': np.random.normal(49000, 1000, 100),
            'volume': np.random.normal(1000000, 100000, 100)
        })
        return df
    
    async def prepare_features(self, df: pd.DataFrame) -> pd.DataFrame:
        """Prepare features for prediction"""
        # Calculate technical indicators
        df = self.technical_indicators.calculate_indicators(df)
        
        # Get news sentiment
        articles = self.news_analyzer.get_crypto_news(days=1)
        sentiment = self.news_analyzer.get_aggregated_sentiment(articles)
        
        # Add sentiment scores to each row
        for col in ['compound', 'positive', 'negative', 'neutral']:
            df[f'sentiment_{col}'] = sentiment[col]
        
        return df
    
    async def train_model(self, days: int = 30) -> Dict[str, Any]:
        """Train the LSTM model with recent data"""
        # Fetch historical data
        df = await self.get_bitcoin_data()
        
        # Prepare features
        df = await self.prepare_features(df)
        
        # Train model
        feature_columns = self.technical_indicators.get_feature_columns()
        feature_columns.extend(['sentiment_compound', 'sentiment_positive', 
                              'sentiment_negative', 'sentiment_neutral'])
        
        X = df[feature_columns].values
        y = df['close'].values
        
        history = self.lstm_model.train(X)
        
        # Save model
        os.makedirs(os.path.dirname(self.model_path), exist_ok=True)
        self.lstm_model.save_model(self.model_path)
        
        return {
            'message': 'Model trained successfully',
            'history': history.history
        }
    
    async def predict(self, timeframe: str = '24h') -> Dict[str, Any]:
        """Make price predictions"""
        # Fetch recent data
        df = await self.get_bitcoin_data()
        
        # Prepare features
        df = await self.prepare_features(df)
        
        # Make prediction
        feature_columns = self.technical_indicators.get_feature_columns()
        feature_columns.extend(['sentiment_compound', 'sentiment_positive', 
                              'sentiment_negative', 'sentiment_neutral'])
        
        X = df[feature_columns].values
        current_price = df['close'].iloc[-1]
        
        predicted_price = self.lstm_model.predict(X)
        
        # Calculate confidence based on recent prediction accuracy
        confidence = 0.8  # Placeholder - implement actual confidence calculation
        
        return {
            'timestamp': datetime.now().isoformat(),
            'timeframe': timeframe,
            'current_price': float(current_price),
            'predicted_price': float(predicted_price),
            'confidence': confidence,
            'technical_indicators': {
                col: float(df[col].iloc[-1])
                for col in self.technical_indicators.get_feature_columns()
            },
            'sentiment': {
                col: float(df[f'sentiment_{col}'].iloc[-1])
                for col in ['compound', 'positive', 'negative', 'neutral']
            }
        }