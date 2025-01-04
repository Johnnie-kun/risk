from dataclasses import dataclass, field
from typing import List, Optional

@dataclass
class ModelConfig:
    """
    Configuration class for the Bitcoin price prediction model.
    """

    # Data parameters
    SEQUENCE_LENGTH: int = 60  # Number of time steps to look back
    FEATURE_COLUMNS: Optional[List[str]] = None  # Use Optional for a default None value
    TARGET_COLUMN: str = "close"  # Target column for prediction

    # Model parameters
    LSTM_UNITS: int = 50  # Number of units in the LSTM layer
    DROPOUT_RATE: float = 0.2  # Dropout rate for regularization
    DENSE_UNITS: int = 1  # Number of units in the Dense output layer

    # Training parameters
    BATCH_SIZE: int = 32  # Batch size for training
    EPOCHS: int = 100  # Number of training epochs
    VALIDATION_SPLIT: float = 0.2  # Fraction of data to use for validation

    # Additional parameters
    LEARNING_RATE: float = 0.001  # Learning rate for the optimizer
    EARLY_STOPPING_PATIENCE: int = 10  # Patience for early stopping
    MODEL_SAVE_PATH: str = "models/bitcoin_predictor.h5"  # Path to save the trained model

    def __post_init__(self):
        """
        Post-initialization logic to set default feature columns if not provided.
        """
        if self.FEATURE_COLUMNS is None:
            self.FEATURE_COLUMNS = [
                "open",
                "high",
                "low",
                "close",
                "volume",
                "rsi",
                "macd",
                "macd_signal",
                "ema",
            ]

    def __str__(self):
        """
        Returns a string representation of the configuration.
        """
        return (
            f"ModelConfig(\n"
            f"  SEQUENCE_LENGTH={self.SEQUENCE_LENGTH},\n"
            f"  FEATURE_COLUMNS={self.FEATURE_COLUMNS},\n"
            f"  TARGET_COLUMN={self.TARGET_COLUMN},\n"
            f"  LSTM_UNITS={self.LSTM_UNITS},\n"
            f"  DROPOUT_RATE={self.DROPOUT_RATE},\n"
            f"  DENSE_UNITS={self.DENSE_UNITS},\n"
            f"  BATCH_SIZE={self.BATCH_SIZE},\n"
            f"  EPOCHS={self.EPOCHS},\n"
            f"  VALIDATION_SPLIT={self.VALIDATION_SPLIT},\n"
            f"  LEARNING_RATE={self.LEARNING_RATE},\n"
            f"  EARLY_STOPPING_PATIENCE={self.EARLY_STOPPING_PATIENCE},\n"
            f"  MODEL_SAVE_PATH={self.MODEL_SAVE_PATH}\n"
            f")"
        )

    def to_dict(self) -> dict:
        """
        Converts the configuration to a dictionary.
        """
        return {
            "SEQUENCE_LENGTH": self.SEQUENCE_LENGTH,
            "FEATURE_COLUMNS": self.FEATURE_COLUMNS,
            "TARGET_COLUMN": self.TARGET_COLUMN,
            "LSTM_UNITS": self.LSTM_UNITS,
            "DROPOUT_RATE": self.DROPOUT_RATE,
            "DENSE_UNITS": self.DENSE_UNITS,
            "BATCH_SIZE": self.BATCH_SIZE,
            "EPOCHS": self.EPOCHS,
            "VALIDATION_SPLIT": self.VALIDATION_SPLIT,
            "LEARNING_RATE": self.LEARNING_RATE,
            "EARLY_STOPPING_PATIENCE": self.EARLY_STOPPING_PATIENCE,
            "MODEL_SAVE_PATH": self.MODEL_SAVE_PATH,
        }

    @classmethod
    def from_dict(cls, config_dict: dict) -> "ModelConfig":
        """
        Creates a ModelConfig instance from a dictionary.
        """
        return cls(**config_dict)