from dataclasses import dataclass

@dataclass
class ModelConfig:
    # Data parameters
    SEQUENCE_LENGTH: int = 60  # Number of time steps to look back
    FEATURE_COLUMNS: list = None
    TARGET_COLUMN: str = 'close'
    
    # Model parameters
    LSTM_UNITS: int = 50
    DROPOUT_RATE: float = 0.2
    DENSE_UNITS: int = 1
    
    # Training parameters
    BATCH_SIZE: int = 32
    EPOCHS: int = 100
    VALIDATION_SPLIT: float = 0.2
    
    def __post_init__(self):
        self.FEATURE_COLUMNS = [
            'open', 'high', 'low', 'close', 'volume',
            'rsi', 'macd', 'macd_signal', 'ema'
        ]