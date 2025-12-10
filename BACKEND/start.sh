#!/bin/bash

# VoxAI Backend Startup Script

echo "Starting VoxAI Backend..."

# Check if virtual environment exists
if [ ! -d "venv" ]; then
    echo "Creating virtual environment..."
    python -m venv venv
fi

# Activate virtual environment
source venv/bin/activate

# Install dependencies
echo "Installing dependencies..."
pip install -r requirements.txt

# Run database initialization
echo "Initializing database..."
python init_db.py

# Start the backend server
echo "Starting server..."
python main.py