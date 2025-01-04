import numpy as np
import pandas as pd
from sklearn.preprocessing import MinMaxScaler

class DataPreprocessor:
    def __init__(self):
        self.scaler = MinMaxScaler()
    
    def prepare_sequences(self, data, sequence_length):
        """Convert data into sequences for LSTM"""
        X, y = [], []
        for i in range(len(data) - sequence_length):
            X.append(data[i:(i + sequence_length)])
            y.append(data[i + sequence_length])
        return np.array(X), np.array(y)
    
    def scale_data(self, data):
        """Scale the data to [0,1] range"""
        return self.scaler.fit_transform(data)
    
    def inverse_scale(self, data):
        """Convert scaled data back to original range"""
        return self.scaler.inverse_transform(data)