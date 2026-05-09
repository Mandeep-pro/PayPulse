@echo off
REM PayPulse Quick Start Script

echo ========================================
echo    PayPulse - Transaction Tracker
echo ========================================
echo.
echo Installing dependencies...
pip install -r requirements.txt
echo.
echo Starting Flask Backend Server...
echo.
echo Backend will run on: http://localhost:5000
echo Frontend: file:///C:/Users/DELL/OneDrive/Desktop/PayPulse/frontend/index.html
echo.
cd backend
python app.py
pause
