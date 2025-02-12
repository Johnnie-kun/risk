"""
Common constants used throughout the application.
"""

# Feature related constants
SENTIMENT_FEATURES = ["compound", "positive", "negative", "neutral"]
TECHNICAL_FEATURES = [
    'rsi', 'MACD_12_26_9', 'MACDs_12_26_9', 'MACDh_12_26_9',
    'EMA_9', 'EMA_21', 'EMA_50', 'EMA_200',
    'bb_upper', 'bb_middle', 'bb_lower',
    'OBV', 'MOM_10'
]

# Model related constants
SEQUENCE_LENGTH = 60  # Number of time steps to use for LSTM input
TRAIN_TEST_SPLIT = 0.8  # Ratio for train/test split

# API related constants
DEFAULT_PREDICTION_TIMEFRAME = "24h"
VALID_TIMEFRAMES = {
    "24h": 24,
    "7d": 168,
    "30d": 720
}

# Technical indicators parameters
TECHNICAL_INDICATORS_CONFIG = {
    "rsi": {"length": 14},
    "macd": {"fast": 12, "slow": 26, "signal": 9},
    "ema": [{"length": n} for n in [9, 21, 50, 200]],
    "bbands": {"length": 20},
    "obv": {},
    "mom": {"length": 10}
}

# Required columns for technical analysis
REQUIRED_PRICE_COLUMNS = {"timestamp", "close", "high", "low", "volume"} 