"""
Database initialization script
Run this script to initialize the database with sample data
"""

import sys
import os
sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))

from app import app, db
from models import Transaction, Category
from datetime import datetime, timedelta
import random

def init_database():
    """Initialize database with sample data"""
    
    with app.app_context():
        # Drop existing tables (optional)
        # db.drop_all()
        
        # Create all tables
        db.create_all()
        print("✅ Database tables created successfully!")
        
       
        
        # Add transactions to database
        for trans in sample_transactions:
            db.session.add(trans)
        
        db.session.commit()
        print(f"✅ Added {len(sample_transactions)} sample transactions!")
        
        # Verify
        transaction_count = Transaction.query.count()
        print(f"✅ Total transactions in database: {transaction_count}")

if __name__ == '__main__':
    try:
        init_database()
        print("\n✅ Database initialization completed successfully!")
    except Exception as e:
        print(f"\n❌ Error initializing database: {e}")
        sys.exit(1)
