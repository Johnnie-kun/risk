import pandas as pd
import pandas_ta as ta
from loguru import logger
from config.constants import REQUIRED_PRICE_COLUMNS, TECHNICAL_INDICATORS_CONFIG, TECHNICAL_FEATURES

class TechnicalIndicators:
    """Class for calculating technical indicators for Bitcoin price data."""
    
    @staticmethod
    def calculate_indicators(df: pd.DataFrame) -> pd.DataFrame:
        """
        Calculate technical indicators for Bitcoin price data.
        
        Args:
            df: DataFrame with columns ['timestamp', 'close', 'high', 'low', 'volume']
        
        Returns:
            DataFrame with additional technical indicator columns
        """
        # Ensure required columns exist
        missing_cols = REQUIRED_PRICE_COLUMNS - set(df.columns)
        if missing_cols:
            raise ValueError(f"Missing required columns: {missing_cols}")

        # Ensure DataFrame is sorted by timestamp
        if not df['timestamp'].is_monotonic_increasing:
            df = df.sort_values('timestamp')
            logger.info("DataFrame sorted by timestamp")

        # Apply indicators using pandas_ta strategy
        df.ta.strategy(TECHNICAL_INDICATORS_CONFIG)

        # Rename Bollinger Bands columns for consistency
        df.rename(columns={
            'BBU_20_2.0': 'bb_upper',
            'BBM_20_2.0': 'bb_middle',
            'BBL_20_2.0': 'bb_lower',
        }, inplace=True)

        # Fill missing values using forward-fill and back-fill
        df.fillna(method="ffill", inplace=True)
        df.fillna(method="bfill", inplace=True)

        logger.info("Technical indicators calculated successfully")
        return df

    @staticmethod
    def get_feature_columns() -> list:
        """Return list of feature columns used for prediction."""
        return TECHNICAL_FEATURES
