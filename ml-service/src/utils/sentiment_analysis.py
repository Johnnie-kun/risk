import nltk
from nltk.sentiment import SentimentIntensityAnalyzer
import requests
from typing import List, Dict
import os
from datetime import datetime, timedelta

class NewsAnalyzer:
    def __init__(self):
        # Download required NLTK data
        try:
            nltk.data.find('sentiment/vader_lexicon.zip')
        except LookupError:
            nltk.download('vader_lexicon')
        
        self.sia = SentimentIntensityAnalyzer()
        self.news_api_key = os.getenv('NEWS_API_KEY')
        
    def get_crypto_news(self, days: int = 1) -> List[Dict]:
        """
        Fetch cryptocurrency news articles from NewsAPI
        
        Args:
            days: Number of days of news to fetch
            
        Returns:
            List of news articles with sentiment scores
        """
        if not self.news_api_key:
            raise ValueError("NEWS_API_KEY environment variable not set")
            
        # Calculate date range
        end_date = datetime.now()
        start_date = end_date - timedelta(days=days)
        
        # NewsAPI endpoint
        url = 'https://newsapi.org/v2/everything'
        
        # Parameters for the API request
        params = {
            'q': 'bitcoin OR cryptocurrency',
            'from': start_date.strftime('%Y-%m-%d'),
            'to': end_date.strftime('%Y-%m-%d'),
            'language': 'en',
            'sortBy': 'publishedAt',
            'apiKey': self.news_api_key
        }
        
        try:
            response = requests.get(url, params=params)
            response.raise_for_status()
            articles = response.json().get('articles', [])
            
            # Analyze sentiment for each article
            analyzed_articles = []
            for article in articles:
                sentiment_scores = self.analyze_sentiment(article.get('title', '') + ' ' + article.get('description', ''))
                article['sentiment_scores'] = sentiment_scores
                analyzed_articles.append(article)
                
            return analyzed_articles
            
        except requests.exceptions.RequestException as e:
            print(f"Error fetching news: {e}")
            return []
    
    def analyze_sentiment(self, text: str) -> Dict[str, float]:
        """
        Analyze sentiment of text using VADER sentiment analyzer
        
        Args:
            text: Text to analyze
            
        Returns:
            Dictionary containing sentiment scores
        """
        return self.sia.polarity_scores(text)
    
    def get_aggregated_sentiment(self, articles: List[Dict]) -> Dict[str, float]:
        """
        Calculate aggregated sentiment scores from multiple articles
        
        Args:
            articles: List of articles with sentiment scores
            
        Returns:
            Dictionary with aggregated sentiment metrics
        """
        if not articles:
            return {
                'compound': 0,
                'positive': 0,
                'negative': 0,
                'neutral': 0
            }
        
        # Extract sentiment scores
        compounds = [a['sentiment_scores']['compound'] for a in articles]
        positives = [a['sentiment_scores']['pos'] for a in articles]
        negatives = [a['sentiment_scores']['neg'] for a in articles]
        neutrals = [a['sentiment_scores']['neu'] for a in articles]
        
        # Calculate averages
        return {
            'compound': sum(compounds) / len(compounds),
            'positive': sum(positives) / len(positives),
            'negative': sum(negatives) / len(negatives),
            'neutral': sum(neutrals) / len(neutrals)
        }