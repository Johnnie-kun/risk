"""
Test data generation utilities for development and testing.
"""
import pandas as pd
import numpy as np
from datetime import datetime, timedelta
from typing import Optional

def generate_mock_bitcoin_data(
    periods: int = 100,
    start_price: float = 50000,
    volatility: float = 0.02,
    volume_mean: float = 1_000_000,
    volume_std: float = 100_000,
    end_date: Optional[datetime] = None
) -> pd.DataFrame:
    """
    Generate mock Bitcoin price data for testing.
    
    Args:
        periods: Number of time periods to generate
        start_price: Starting price for the simulation
        volatility: Price volatility factor
        volume_mean: Mean trading volume
        volume_std: Standard deviation of trading volume
        end_date: End date for the data (defaults to current time)
        
    Returns:
        DataFrame with mock price data
    """
    if end_date is None:
        end_date = datetime.utcnow()
    
    # Generate timestamps
    timestamps = pd.date_range(end=end_date, periods=periods, freq="H")
    
    # Generate price movements using random walk
    returns = np.random.normal(0, volatility, periods)
    price_multipliers = np.exp(np.cumsum(returns))
    close_prices = start_price * price_multipliers
    
    # Generate high/low prices
    high_prices = close_prices * np.random.uniform(1, 1 + volatility, periods)
    low_prices = close_prices * np.random.uniform(1 - volatility, 1, periods)
    
    # Ensure high is always higher than low
    high_prices = np.maximum(high_prices, low_prices)
    
    # Generate trading volumes
    volumes = np.abs(np.random.normal(volume_mean, volume_std, periods))
    
    return pd.DataFrame({
        "timestamp": timestamps,
        "close": close_prices,
        "high": high_prices,
        "low": low_prices,
        "volume": volumes
    })

def generate_mock_news_data(num_articles: int = 10) -> list:
    """
    Generate mock news articles data for testing.
    
    Args:
        num_articles: Number of articles to generate
        
    Returns:
        List of dictionaries containing mock news data
    """
    headlines = [
        "Bitcoin Surges to New All-Time High",
        "Major Company Adds Bitcoin to Balance Sheet",
        "Cryptocurrency Market Shows Strong Recovery",
        "Bitcoin Mining Difficulty Increases",
        "New Cryptocurrency Regulations Proposed",
        "Market Analysts Predict Bitcoin Price Movement",
        "Institutional Interest in Bitcoin Grows",
        "Bitcoin Network Hash Rate Reaches Record Level",
        "Major Exchange Lists New Cryptocurrency Pairs",
        "Bitcoin Adoption Continues to Rise Globally"
    ]
    
    sources = ["CryptoNews", "BlockchainDaily", "CoinReport", "BitcoinInsider", "CryptoMarket"]
    
    articles = []
    for _ in range(num_articles):
        articles.append({
            "title": np.random.choice(headlines),
            "source": np.random.choice(sources),
            "published_at": datetime.utcnow() - timedelta(hours=np.random.randint(0, 24)),
            "url": f"https://example.com/news/{np.random.randint(1000, 9999)}"
        })
    
    return articles 