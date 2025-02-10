import pandas as pd
import pandas_ta as ta

class TechnicalIndicators:
    @staticmethod
    def calculate_indicators(df: pd.DataFrame) -> pd.DataFrame:
        """
        Calculate technical indicators for Bitcoin price data
        
        Args:
            df: DataFrame with columns ['timestamp', 'close', 'high', 'low', 'volume']
        
        Returns:
            DataFrame with additional technical indicator columns
        """
        # Make sure the DataFrame is sorted by timestamp
        df = df.sort_values('timestamp')
        
        # Calculate RSI (Relative Strength Index)
        df['rsi'] = df.ta.rsi(close='close', length=14)
        
        # Calculate MACD (Moving Average Convergence Divergence)
        macd = df.ta.macd(close='close', fast=12, slow=26, signal=9)
        df['macd'] = macd['MACD_12_26_9']
        df['macd_signal'] = macd['MACDs_12_26_9']
        df['macd_hist'] = macd['MACDh_12_26_9']
        
        # Calculate EMAs (Exponential Moving Averages)
        df['ema_9'] = df.ta.ema(close='close', length=9)
        df['ema_21'] = df.ta.ema(close='close', length=21)
        df['ema_50'] = df.ta.ema(close='close', length=50)
        df['ema_200'] = df.ta.ema(close='close', length=200)
        
        # Additional indicators
        # Bollinger Bands
        bollinger = df.ta.bbands(close='close', length=20)
        df['bb_upper'] = bollinger['BBU_20_2.0']
        df['bb_middle'] = bollinger['BBM_20_2.0']
        df['bb_lower'] = bollinger['BBL_20_2.0']
        
        # Volume indicators
        df['obv'] = df.ta.obv(close='close', volume='volume')
        
        # Momentum
        df['mom'] = df.ta.mom(close='close', length=10)
        
        # Fill NaN values with 0
        df = df.fillna(0)
        
        return df
    
    @staticmethod
    def get_feature_columns() -> list:
        """Return list of feature columns used for prediction"""
        return [
            'rsi', 'macd', 'macd_signal', 'macd_hist',
            'ema_9', 'ema_21', 'ema_50', 'ema_200',
            'bb_upper', 'bb_middle', 'bb_lower',
            'obv', 'mom'
        ]