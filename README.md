# PayPulse - Transaction Tracking Application

PayPulse is a web-based transaction tracking application that helps you visualize your spending with interactive charts and manage your finances efficiently.

## Features

✨ **Core Features:**
- 📊 Track income and expense transactions
- 💰 Real-time balance calculation
- 📈 Interactive pie chart visualization by category
- 📉 Expense breakdown bar chart
- 🔍 Search and filter transactions
- 📥 Export data to JSON
- 🎨 Modern, responsive UI

## Technology Stack

**Backend:**
- Flask (Python web framework)
- Flask-SQLAlchemy (ORM)
- Flask-CORS (Cross-origin requests)
- SQLite (Database)

**Frontend:**
- HTML5
- CSS3
- JavaScript (Vanilla)
- Plotly.js (Data visualization)

## Project Structure

```
PayPulse/
├── backend/
│   ├── app.py              # Main Flask application
│   └── models.py           # Database models
├── frontend/
│   ├── index.html          # Main HTML file
│   ├── styles.css          # Styling
│   └── app.js              # Frontend logic
├── database/
│   └── paypulse.db         # SQLite database (auto-created)
├── requirements.txt        # Python dependencies
└── README.md              # This file
```

## Setup & Installation

### Prerequisites
- Python 3.8 or higher
- pip (Python package manager)

### Installation Steps

1. **Clone/Download the project**
   ```bash
   cd PayPulse
   ```

2. **Create a virtual environment** (recommended)
   ```bash
   # Windows
   python -m venv venv
   venv\Scripts\activate

   # macOS/Linux
   python3 -m venv venv
   source venv/bin/activate
   ```

3. **Install dependencies**
   ```bash
   pip install -r requirements.txt
   ```

4. **Run the backend server**
   ```bash
   cd backend
   python app.py
   ```
   The server will run on `http://localhost:5000`

5. **Open the frontend**
   - Open `frontend/index.html` in your web browser
   - Or navigate to `http://localhost:5000/frontend/index.html` if serving through Flask

## Usage

### Adding Transactions

1. Click "➕ Add Transaction" in the sidebar
2. Fill in the transaction details:
   - **Amount**: Transaction amount
   - **Category**: Select from predefined categories
   - **Description**: Transaction description
   - **Date**: Transaction date
   - **Type**: Income or Expense
3. Click "Add Transaction"

### Viewing Dashboard

- **Dashboard**: View statistics and spending overview
- **Transactions**: Browse all transactions with search/filter
- **Analytics**: View detailed spending breakdown

### Filtering Transactions

- Use the search bar to find transactions by description
- Use the category dropdown to filter by category

### Editing & Deleting

- Click "Edit" on any transaction to modify it
- Click "Delete" to remove a transaction

### Exporting Data

- Go to Analytics section
- Click "📥 Export Data as JSON"
- Your data will be downloaded as a JSON file

## API Endpoints

### Transactions
- `GET /api/transactions` - Get all transactions
- `POST /api/transactions` - Add new transaction
- `GET /api/transactions/<id>` - Get specific transaction
- `PUT /api/transactions/<id>` - Update transaction
- `DELETE /api/transactions/<id>` - Delete transaction

### Statistics & Data
- `GET /api/statistics` - Get transaction statistics
- `GET /api/categories` - Get all categories
- `GET /api/export` - Export all data
- `GET /api/health` - Health check

## Sample Transaction Structure

```json
{
  "amount": 25.50,
  "category": "Food",
  "description": "Lunch at restaurant",
  "date": "2026-04-30T12:30:00",
  "type": "expense"
}
```

## Available Categories

- Food
- Transport
- Entertainment
- Shopping
- Bills
- Salary
- Freelance
- Investment
- Utilities
- Healthcare
- Education
- Other

## Features in Detail

### Dashboard
- Display key statistics (income, expenses, balance)
- Show spending pie chart by category
- List recent transactions
- Quick overview of financial status

### Transactions Manager
- View all transactions in a table
- Search by description
- Filter by category
- Edit or delete transactions
- Sort by date

### Analytics
- Detailed expense breakdown chart
- Category-wise spending summary
- Export all data in JSON format

### Responsive Design
- Mobile-friendly interface
- Adapts to different screen sizes
- Touch-friendly buttons

## Database Schema

### Transactions Table
- `id`: Primary key
- `amount`: Transaction amount
- `category`: Expense/Income category
- `description`: Transaction description
- `date`: Transaction date
- `transaction_type`: 'income' or 'expense'
- `created_at`: Creation timestamp
- `updated_at`: Last update timestamp

## Troubleshooting

### Backend won't start
- Ensure Python 3.8+ is installed
- Check all dependencies: `pip install -r requirements.txt`
- Verify port 5000 is not in use

### CORS errors
- Check backend is running on localhost:5000
- Ensure Flask-CORS is installed
- Clear browser cache

### Database errors
- Delete `database/paypulse.db` and restart server to recreate
- Check folder permissions

## Future Enhancements

- 🔐 User authentication
- 📅 Monthly/yearly reports
- 💳 Budget goals & alerts
- 📱 Mobile app version
- 🌙 Dark mode toggle
- 💾 Auto-backup functionality
- 📊 Advanced analytics
- 🔔 Notifications

## License

This project is open source and available for personal use.

## Support

For issues or questions:
1. Check the troubleshooting section
2. Review API endpoints documentation
3. Ensure all dependencies are installed correctly

## Contributing

Contributions are welcome! Feel free to:
- Report bugs
- Suggest new features
- Improve documentation
- Optimize code

---

**Happy tracking! 💰**

Made with ❤️ for financial management
