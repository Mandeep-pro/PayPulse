"""
PayPulse - Transaction Tracking Application
Backend Flask Server
"""

from flask import Flask, request, jsonify
from flask_cors import CORS
from flask_sqlalchemy import SQLAlchemy
from datetime import datetime
import os
import json
from models import db, Transaction, Category

# Initialize Flask app
app = Flask(__name__)

# Configuration
import os
# Use absolute path with forward slashes for cross-platform compatibility
db_path = 'C:/Users/DELL/OneDrive/Desktop/PayPulse/database/paypulse.db'
os.makedirs(os.path.dirname(db_path), exist_ok=True)
app.config['SQLALCHEMY_DATABASE_URI'] = f'sqlite:///{db_path}'
app.config['SQLALCHEMY_TRACK_MODIFICATIONS'] = False
app.config['JSON_SORT_KEYS'] = False

# Initialize extensions
db.init_app(app)
CORS(app)

# Create database tables
with app.app_context():
    db.create_all()

# ==================== API Routes ====================

@app.route('/api/health', methods=['GET'])
def health_check():
    """Health check endpoint"""
    return jsonify({'status': 'ok', 'message': 'PayPulse server is running'})

@app.route('/api/transactions', methods=['GET'])
def get_transactions():
    """Get all transactions with optional filtering"""
    try:
        category_filter = request.args.get('category')
        
        query = Transaction.query
        
        if category_filter:
            query = query.filter_by(category=category_filter)
        
        transactions = query.order_by(Transaction.date.desc()).all()
        
        return jsonify({
            'success': True,
            'data': [t.to_dict() for t in transactions]
        })
    except Exception as e:
        return jsonify({'success': False, 'error': str(e)}), 500

@app.route('/api/transactions', methods=['POST'])
def add_transaction():
    """Add a new transaction"""
    try:
        data = request.get_json()
        
        # Validate required fields
        if not data or not all(key in data for key in ['amount', 'category', 'description']):
            return jsonify({'success': False, 'error': 'Missing required fields'}), 400
        
        # Create new transaction
        transaction = Transaction(
            amount=float(data['amount']),
            category=data['category'],
            description=data['description'],
            date=datetime.fromisoformat(data.get('date', datetime.now().isoformat())),
            transaction_type=data.get('type', 'expense')
        )
        
        db.session.add(transaction)
        db.session.commit()
        
        return jsonify({
            'success': True,
            'message': 'Transaction added successfully',
            'data': transaction.to_dict()
        }), 201
    except Exception as e:
        db.session.rollback()
        return jsonify({'success': False, 'error': str(e)}), 500

@app.route('/api/transactions/<int:transaction_id>', methods=['GET'])
def get_transaction(transaction_id):
    """Get a specific transaction"""
    try:
        transaction = Transaction.query.get(transaction_id)
        if not transaction:
            return jsonify({'success': False, 'error': 'Transaction not found'}), 404
        
        return jsonify({'success': True, 'data': transaction.to_dict()})
    except Exception as e:
        return jsonify({'success': False, 'error': str(e)}), 500

@app.route('/api/transactions/<int:transaction_id>', methods=['PUT'])
def update_transaction(transaction_id):
    """Update a transaction"""
    try:
        transaction = Transaction.query.get(transaction_id)
        if not transaction:
            return jsonify({'success': False, 'error': 'Transaction not found'}), 404
        
        data = request.get_json()
        
        if 'amount' in data:
            transaction.amount = float(data['amount'])
        if 'category' in data:
            transaction.category = data['category']
        if 'description' in data:
            transaction.description = data['description']
        if 'date' in data:
            transaction.date = datetime.fromisoformat(data['date'])
        if 'type' in data:
            transaction.transaction_type = data['type']
        
        db.session.commit()
        
        return jsonify({
            'success': True,
            'message': 'Transaction updated successfully',
            'data': transaction.to_dict()
        })
    except Exception as e:
        db.session.rollback()
        return jsonify({'success': False, 'error': str(e)}), 500

@app.route('/api/transactions/<int:transaction_id>', methods=['DELETE'])
def delete_transaction(transaction_id):
    """Delete a transaction"""
    try:
        transaction = Transaction.query.get(transaction_id)
        if not transaction:
            return jsonify({'success': False, 'error': 'Transaction not found'}), 404
        
        db.session.delete(transaction)
        db.session.commit()
        
        return jsonify({'success': True, 'message': 'Transaction deleted successfully'})
    except Exception as e:
        db.session.rollback()
        return jsonify({'success': False, 'error': str(e)}), 500

@app.route('/api/statistics', methods=['GET'])
def get_statistics():
    """Get transaction statistics"""
    try:
        transactions = Transaction.query.all()
        
        if not transactions:
            return jsonify({
                'success': True,
                'data': {
                    'total_income': 0,
                    'total_expense': 0,
                    'balance': 0,
                    'transaction_count': 0,
                    'by_category': {}
                }
            })
        
        # Calculate totals
        total_income = sum(t.amount for t in transactions if t.transaction_type == 'income')
        total_expense = sum(t.amount for t in transactions if t.transaction_type == 'expense')
        balance = total_income - total_expense
        
        # Group by category
        by_category = {}
        for t in transactions:
            if t.transaction_type == 'expense':
                if t.category not in by_category:
                    by_category[t.category] = 0
                by_category[t.category] += t.amount
        
        return jsonify({
            'success': True,
            'data': {
                'total_income': round(total_income, 2),
                'total_expense': round(total_expense, 2),
                'balance': round(balance, 2),
                'transaction_count': len(transactions),
                'by_category': {k: round(v, 2) for k, v in by_category.items()}
            }
        })
    except Exception as e:
        return jsonify({'success': False, 'error': str(e)}), 500

@app.route('/api/categories', methods=['GET'])
def get_categories():
    """Get all available categories"""
    try:
        categories = [
            'Food',
            'Transport',
            'Entertainment',
            'Shopping',
            'Bills',
            'Salary',
            'Freelance',
            'Investment',
            'Utilities',
            'Healthcare',
            'Education',
            'Other'
        ]
        
        return jsonify({'success': True, 'data': categories})
    except Exception as e:
        return jsonify({'success': False, 'error': str(e)}), 500

@app.route('/api/export', methods=['GET'])
def export_data():
    """Export all transactions as JSON"""
    try:
        transactions = Transaction.query.all()
        data = {
            'exported_at': datetime.now().isoformat(),
            'transaction_count': len(transactions),
            'transactions': [t.to_dict() for t in transactions]
        }
        
        return jsonify({'success': True, 'data': data})
    except Exception as e:
        return jsonify({'success': False, 'error': str(e)}), 500

# Error handlers
@app.errorhandler(404)
def not_found(error):
    return jsonify({'success': False, 'error': 'Endpoint not found'}), 404

@app.errorhandler(500)
def internal_error(error):
    return jsonify({'success': False, 'error': 'Internal server error'}), 500

if __name__ == '__main__':
    app.run(debug=True, host='0.0.0.0', port=5000)
