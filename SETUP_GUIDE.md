# PayPulse Setup Guide

## Quick Start (5 minutes)

### Step 1: Install Python Dependencies

Open PowerShell/Command Prompt in the PayPulse folder and run:

```powershell
pip install -r requirements.txt
```

### Step 2: Initialize Database (Optional)

To add sample data:

```powershell
cd backend
python init_db.py
cd ..
```

### Step 3: Start the Backend Server

```powershell
cd backend
python app.py
```

You should see:
```
* Running on http://127.0.0.1:5000
```

### Step 4: Open the Frontend

Open `frontend/index.html` in your web browser or navigate to:
```
file:///C:/Users/DELL/OneDrive/Desktop/PayPulse/frontend/index.html
```

## Complete Setup Guide

### Prerequisites Check

Verify Python is installed:
```powershell
python --version
```
Required: Python 3.8 or higher

### Detailed Installation

1. **Navigate to project directory**
   ```powershell
   cd "C:\Users\DELL\OneDrive\Desktop\PayPulse"
   ```

2. **Create virtual environment (recommended)**
   ```powershell
   python -m venv venv
   venv\Scripts\activate
   ```

3. **Install all dependencies**
   ```powershell
   pip install -r requirements.txt
   ```

4. **Create database folder**
   ```powershell
   mkdir -p database
   ```

5. **Initialize sample data (optional)**
   ```powershell
   cd backend
   python init_db.py
   cd ..
   ```

### Running the Application

**Terminal 1 - Start Backend:**
```powershell
cd backend
python app.py
```

**Browser:**
- Open: `frontend/index.html`
- Or use: `file:///C:/Users/DELL/OneDrive/Desktop/PayPulse/frontend/index.html`

## Windows-Specific Instructions

### Using PowerShell

```powershell
# Navigate to project
cd C:\Users\DELL\OneDrive\Desktop\PayPulse

# Activate environment
.\venv\Scripts\Activate.ps1

# Install packages
pip install -r requirements.txt

# Run backend
cd backend
python app.py
```

### Using Command Prompt

```cmd
cd C:\Users\DELL\OneDrive\Desktop\PayPulse

venv\Scripts\activate

pip install -r requirements.txt

cd backend
python app.py
```

## Troubleshooting

### Issue: "pip: command not found"
**Solution:** Make sure Python is installed and added to PATH
```powershell
python -m pip --version
```

### Issue: Module not found errors
**Solution:** Ensure virtual environment is activated and all packages installed
```powershell
pip install -r requirements.txt --upgrade
```

### Issue: Port 5000 already in use
**Solution 1:** Kill the process using port 5000
```powershell
Get-Process | Where-Object {$_.Id -eq (Get-NetTCPConnection -LocalPort 5000).OwningProcess}
```

**Solution 2:** Use a different port in `app.py`:
```python
if __name__ == '__main__':
    app.run(debug=True, host='0.0.0.0', port=5001)  # Changed to 5001
```

### Issue: CORS errors in browser console
**Solution:** Ensure backend is running on `http://localhost:5000`
```powershell
# Check in app.js that API_BASE_URL is correct:
const API_BASE_URL = 'http://localhost:5000/api';
```

### Issue: Database file not created
**Solution:** Create the database folder manually
```powershell
mkdir database
python init_db.py
```

## Project Structure After Setup

```
PayPulse/
├── venv/                   # Virtual environment (after creation)
├── backend/
│   ├── app.py             # Main Flask app
│   ├── models.py          # Database models
│   ├── config.py          # Configuration
│   └── init_db.py         # Database initialization
├── frontend/
│   ├── index.html         # Main webpage
│   ├── styles.css         # Styling
│   └── app.js             # JavaScript logic
├── database/
│   └── paypulse.db        # SQLite database (created on first run)
├── requirements.txt       # Python dependencies
├── README.md             # Full documentation
└── SETUP_GUIDE.md        # This file
```

## Verification Steps

### 1. Check Backend Running
```powershell
# In a new terminal, while backend is running:
curl http://localhost:5000/api/health
```

Expected response:
```
{"message":"PayPulse server is running","status":"ok"}
```

### 2. Check Database
```powershell
# From project root:
cd backend
python
>>> from app import db, Transaction
>>> from app import app
>>> with app.app_context():
...     print(f"Transactions: {Transaction.query.count()}")
>>> exit()
```

## First Steps After Setup

1. **Start the backend** - Keep it running
2. **Open frontend** - Open index.html in browser
3. **Add a transaction** - Test the application
4. **View dashboard** - See your data visualized

## Next Steps

- Explore all features on the dashboard
- Add multiple transactions
- Check the analytics section
- Export your data
- Read the full README.md for more features

## Getting Help

- Check the main README.md for complete documentation
- Review the TROUBLESHOOTING section in README.md
- Check browser console for JavaScript errors (F12)
- Check terminal for Python errors

## Environment Cleanup

To remove virtual environment (if needed):
```powershell
deactivate
Remove-Item venv -Recurse
```

---

**Setup complete! Happy tracking! 💰**
