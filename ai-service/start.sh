#!/bin/bash

# Setup and run the Family Planning AI Service

echo "Setting up Family Planning AI Service..."

# Create virtual environment if it doesn't exist
if [ ! -d "venv" ]; then
    echo "Creating virtual environment..."
    python -m venv venv
fi

# Activate virtual environment
source venv/bin/activate

# Install dependencies
echo "Installing dependencies..."
pip install -r requirements.txt

# Create .env file if it doesn't exist
if [ ! -f ".env" ]; then
    echo "Creating .env file from .env.example..."
    cp .env.example .env
    echo "Please edit .env and add your OpenAI API key"
fi

# Run the service
echo "Starting FastAPI server..."
python -m uvicorn main:app --host 0.0.0.0 --port 8000 --reload
