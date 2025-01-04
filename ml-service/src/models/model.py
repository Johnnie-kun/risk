import tensorflow as tf
from tensorflow.keras.models import Sequential
from tensorflow.keras.layers import LSTM, Dense, Dropout
from tensorflow.keras.callbacks import EarlyStopping, ModelCheckpoint
from tensorflow.keras.optimizers import Adam
from ..config.model_config import ModelConfig

class BitcoinPriceModel:
    """
    A class to build, train, and evaluate an LSTM-based model for Bitcoin price prediction.
    """

    def __init__(self, config: ModelConfig):
        """
        Initializes the BitcoinPriceModel with the given configuration.

        Args:
            config (ModelConfig): Configuration object containing model and training parameters.
        """
        self.config = config
        self.model = self._build_model()

    def _build_model(self) -> Sequential:
        """
        Builds the LSTM model based on the configuration.

        Returns:
            Sequential: The compiled Keras model.
        """
        model = Sequential([
            LSTM(
                units=self.config.LSTM_UNITS,
                return_sequences=True,
                input_shape=(self.config.SEQUENCE_LENGTH, len(self.config.FEATURE_COLUMNS)),
            ),
            Dropout(self.config.DROPOUT_RATE),
            LSTM(units=self.config.LSTM_UNITS),
            Dropout(self.config.DROPOUT_RATE),
            Dense(units=self.config.DENSE_UNITS),
        ])

        # Compile the model
        model.compile(
            optimizer=Adam(learning_rate=self.config.LEARNING_RATE),
            loss="mean_squared_error",
            metrics=["mae"],  # Mean Absolute Error for additional evaluation
        )

        # Print model summary for debugging and verification
        model.summary()

        return model

    def train(self, X_train: tf.Tensor, y_train: tf.Tensor, use_early_stopping: bool = True):
        """
        Trains the model on the provided training data.

        Args:
            X_train (tf.Tensor): Training input data of shape (num_samples, sequence_length, num_features).
            y_train (tf.Tensor): Training target data of shape (num_samples,).
            use_early_stopping (bool): Whether to use early stopping during training.

        Returns:
            History: Training history object.

        Raises:
            ValueError: If the number of samples in X_train and y_train do not match.
        """
        # Check for data consistency
        if X_train.shape[0] != y_train.shape[0]:
            raise ValueError("The number of samples in X_train and y_train must be equal.")

        # Define callbacks
        callbacks = []
        if use_early_stopping:
            early_stopping = EarlyStopping(
                monitor="val_loss",
                patience=self.config.EARLY_STOPPING_PATIENCE,
                restore_best_weights=True,
            )
            callbacks.append(early_stopping)

        # Model checkpoint to save the best model during training
        model_checkpoint = ModelCheckpoint(
            filepath=self.config.MODEL_SAVE_PATH,
            monitor="val_loss",
            save_best_only=True,
            verbose=1,
        )
        callbacks.append(model_checkpoint)

        # Train the model
        history = self.model.fit(
            X_train,
            y_train,
            batch_size=self.config.BATCH_SIZE,
            epochs=self.config.EPOCHS,
            validation_split=self.config.VALIDATION_SPLIT,
            callbacks=callbacks,
            verbose=1,
        )

        return history

    def predict(self, X: tf.Tensor) -> tf.Tensor:
        """
        Makes predictions using the trained model.

        Args:
            X (tf.Tensor): Input data of shape (num_samples, sequence_length, num_features).

        Returns:
            tf.Tensor: Predicted values.
        """
        return self.model.predict(X)

    def save(self, path: str):
        """
        Saves the model to the specified path.

        Args:
            path (str): Path to save the model.

        Raises:
            Exception: If the model fails to save.
        """
        try:
            self.model.save(path)
            print(f"Model saved to {path}")
        except Exception as e:
            print(f"Error saving model: {e}")
            raise

    @classmethod
    def load(cls, path: str):
        """
        Loads a model from the specified path.

        Args:
            path (str): Path to load the model from.

        Returns:
            tf.keras.Model: The loaded model, or None if loading fails.
        """
        try:
            model = tf.keras.models.load_model(path)
            print(f"Model loaded from {path}")
            return model
        except Exception as e:
            print(f"Error loading model: {e}")
            return None