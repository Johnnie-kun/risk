import tensorflow as tf
import numpy as np
from sklearn.preprocessing import MinMaxScaler
import pandas as pd

class BitcoinLSTMModel:
    def __init__(self, sequence_length=60):
        self.sequence_length = sequence_length
        self.model = None
        self.scaler = MinMaxScaler(feature_range=(0, 1))
        
    def build_model(self, input_shape):
        """Build and compile the LSTM model"""
        self.model = tf.keras.Sequential([
            tf.keras.layers.LSTM(50, return_sequences=True, input_shape=input_shape),
            tf.keras.layers.Dropout(0.2),
            tf.keras.layers.LSTM(50, return_sequences=False),
            tf.keras.layers.Dropout(0.2),
            tf.keras.layers.Dense(25),
            tf.keras.layers.Dense(1)
        ])
        
        self.model.compile(
            optimizer='adam',
            loss='mean_squared_error',
            metrics=['mae']
        )
        
    def prepare_data(self, data):
        """Prepare data for LSTM model"""
        # Scale the data
        scaled_data = self.scaler.fit_transform(data.reshape(-1, 1))
        
        # Create sequences
        X, y = [], []
        for i in range(len(scaled_data) - self.sequence_length):
            X.append(scaled_data[i:(i + self.sequence_length)])
            y.append(scaled_data[i + self.sequence_length])
            
        return np.array(X), np.array(y)
    
    def train(self, data, epochs=50, batch_size=32, validation_split=0.2):
        """Train the LSTM model"""
        # Prepare training data
        X, y = self.prepare_data(data)
        
        # Build model if not already built
        if self.model is None:
            self.build_model((X.shape[1], X.shape[2]))
        
        # Train model
        history = self.model.fit(
            X, y,
            epochs=epochs,
            batch_size=batch_size,
            validation_split=validation_split,
            verbose=1
        )
        
        return history
    
    def predict(self, data):
        """Make predictions using the trained model"""
        if self.model is None:
            raise ValueError("Model needs to be trained first")
        
        # Scale the input data
        scaled_data = self.scaler.transform(data.reshape(-1, 1))
        
        # Prepare sequence for prediction
        X = np.array([scaled_data[-self.sequence_length:]])
        
        # Make prediction
        scaled_prediction = self.model.predict(X)
        
        # Inverse transform the prediction
        prediction = self.scaler.inverse_transform(scaled_prediction)
        
        return prediction[0][0]
    
    def save_model(self, path):
        """Save the model to disk"""
        if self.model is None:
            raise ValueError("No model to save")
        self.model.save(path)
        
    def load_model(self, path):
        """Load the model from disk"""
        self.model = tf.keras.models.load_model(path)