# PURRSONA

A playful cat-personality quiz built with FastAPI and a simple frontend.

## Features
- Quiz flow with personality-based results
- Responsive landing page and result card experience
- Local static assets and GIFs

## Run locally
1. Install dependencies:
   ```bash
   pip install -r requirements.txt
   ```
2. Start the app from the project root:
   ```bash
   uvicorn app.main:app --reload
   ```
3. Open http://127.0.0.1:8000 in your browser.

## Project structure
- app/ - FastAPI app, routes, database, and models
- frontend/ - HTML pages for the quiz experience
- static/ - images and GIF assets
- data/ - quiz question data
