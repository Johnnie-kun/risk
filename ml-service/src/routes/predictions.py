from fastapi import APIRouter, HTTPException
from typing import Dict, Any
from services.prediction_service import PredictionService

router = APIRouter()
prediction_service = PredictionService()

@router.post("/train")
async def train_model(days: int = 30) -> Dict[str, Any]:
    """
    Train the LSTM model with recent data
    
    Args:
        days: Number of days of historical data to use for training
        
    Returns:
        Training results and metrics
    """
    try:
        result = await prediction_service.train_model(days)
        return result
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@router.get("/predict/{timeframe}")
async def get_prediction(timeframe: str = "24h") -> Dict[str, Any]:
    """
    Get Bitcoin price prediction
    
    Args:
        timeframe: Prediction timeframe (e.g., "24h", "7d")
        
    Returns:
        Prediction results including price, confidence, and supporting metrics
    """
    valid_timeframes = ["1h", "4h", "24h", "7d"]
    if timeframe not in valid_timeframes:
        raise HTTPException(
            status_code=400,
            detail=f"Invalid timeframe. Must be one of: {', '.join(valid_timeframes)}"
        )
    
    try:
        prediction = await prediction_service.predict(timeframe)
        return prediction
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@router.get("/indicators/current")
async def get_current_indicators() -> Dict[str, Any]:
    """
    Get current technical indicators and sentiment analysis
    
    Returns:
        Current technical indicators and sentiment metrics
    """
    try:
        df = await prediction_service.get_bitcoin_data()
        df = await prediction_service.prepare_features(df)
        
        # Get the most recent values
        latest = df.iloc[-1]
        
        return {
            'timestamp': latest['timestamp'].isoformat(),
            'technical_indicators': {
                col: float(latest[col])
                for col in prediction_service.technical_indicators.get_feature_columns()
            },
            'sentiment': {
                col: float(latest[f'sentiment_{col}'])
                for col in ['compound', 'positive', 'negative', 'neutral']
            }
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))