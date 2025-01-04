import numpy as np
import pandas as pd
from sklearn.preprocessing import MinMaxScaler
from typing import Optional, Tuple, List

class DataPreprocessor:
    """
    A class for preprocessing data for LSTM-based models.
    Includes functionality for scaling data and preparing sequences.
    """

    def __init__(self):
        self.scaler = MinMaxScaler()

    def prepare_sequences(
        self,
        data: pd.DataFrame,
        sequence_length: int,
        target_column: str = "close",
        feature_columns: Optional[List[str]] = None,
    ) -> Tuple[np.ndarray, np.ndarray]:
        """
        Convert data into sequences for LSTM.

        Args:
            data (pd.DataFrame): DataFrame containing the input data (e.g., historical Bitcoin prices).
            sequence_length (int): Number of time steps for the LSTM input sequence.
            target_column (str): The column that contains the target variable (default is 'close').
            feature_columns (Optional[List[str]]): List of columns to use as features. If None, all columns except the target are used.

        Returns:
            Tuple[np.ndarray, np.ndarray]: Input features (X) and target labels (y) as numpy arrays.

        Raises:
            ValueError: If the input data is empty, the target column is missing, or feature columns are invalid.
        """
        if data.empty:
            raise ValueError("Input data is empty.")

        if target_column not in data.columns:
            raise ValueError(f"Target column '{target_column}' not found in the data.")

        if feature_columns is None:
            feature_columns = [col for col in data.columns if col != target_column]

        # Validate feature columns
        for col in feature_columns:
            if col not in data.columns:
                raise ValueError(f"Feature column '{col}' not found in the data.")

        X, y = [], []
        for i in range(len(data) - sequence_length):
            X.append(data.iloc[i : (i + sequence_length)][feature_columns].values)  # Features
            y.append(data.iloc[i + sequence_length][target_column])  # Target value

        return np.array(X), np.array(y)

    def scale_data(
        self, data: pd.DataFrame, columns: Optional[List[str]] = None
    ) -> pd.DataFrame:
        """
        Scale the data to [0, 1] range.

        Args:
            data (pd.DataFrame): DataFrame containing the input data.
            columns (Optional[List[str]]): List of columns to scale. If None, scale all numeric columns.

        Returns:
            pd.DataFrame: Scaled DataFrame.

        Raises:
            ValueError: If the input data is empty or specified columns are invalid.
        """
        if data.empty:
            raise ValueError("Input data is empty.")

        if columns is None:
            columns = data.select_dtypes(include=[np.number]).columns.tolist()

        # Validate that all columns exist in the data
        for column in columns:
            if column not in data.columns:
                raise ValueError(f"Column '{column}' not found in the data.")

        scaled_data = data.copy()
        scaled_data[columns] = self.scaler.fit_transform(data[columns])

        return scaled_data

    def inverse_scale(self, data: np.ndarray, columns: Optional[List[str]] = None) -> np.ndarray:
        """
        Convert scaled data back to the original range.

        Args:
            data (np.ndarray): Scaled data (numpy array).
            columns (Optional[List[str]]): List of columns to inverse transform. If None, inverse transform all columns.

        Returns:
            np.ndarray: Data converted back to the original range.

        Raises:
            ValueError: If the input data is empty or columns are invalid.
        """
        if data.size == 0:
            raise ValueError("Input data is empty.")

        if columns is not None and len(columns) != data.shape[1]:
            raise ValueError("Number of columns does not match the data shape.")

        return self.scaler.inverse_transform(data)