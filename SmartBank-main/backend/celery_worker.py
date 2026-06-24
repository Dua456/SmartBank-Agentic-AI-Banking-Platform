"""
Celery worker entry point for SmartBank background tasks.

Usage:
    celery -A backend.celery_worker worker --loglevel=info
    celery -A backend.celery_worker beat --loglevel=info
"""

from backend.celery_app import celery_app

if __name__ == "__main__":
    celery_app.start()
