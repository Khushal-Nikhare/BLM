# Business Lead Manager (BLM)

Business Lead Manager (BLM) is a custom, local-first CRM application designed to automate and manage your sales lead generation effortlessly. It incorporates an automated Google Maps data scraper, robust CSV import functionality, and an intuitive frontend for effective lead tracking.

## Features
- **Local-First Environment:** A secure, API-free CRM environment running completely on your local machine.
- **Automated Google Maps Scraping:** A dedicated Python scraping service powered by Playwright for extracting local business leads automatically.
- **Bulk CSV Importing:** Seamless capabilities to import external datasets directly into the CRM.
- **Lead Tracing & Tagging:** Powerful search keyword tagging applied to all scraped leads, for meticulous categorization and easier outreach follow-ups.

## Stack Overview
- **Frontend:** React + Vite
- **Backend:** Node.js, Express
- **Database:** Prisma ORM
- **Scraper:** Python, FastAPI, Playwright

## Project Structure
- `/frontend` - Contains the React single-page application.
- `/backend` - Contains the Express server, REST API endpoints, and Prisma schemas.
- `/python-scraper` - Contains the FastAPI application and Playwright scripts for web scraping.

## Prerequisites
- **Node.js**: v18 or newer recommended.
- **Python**: v3.9 or newer.

## Setup Instructions

1. **Backend Dependencies**
   ```bash
   cd backend
   npm install
   npx prisma generate
   ```

2. **Frontend Dependencies**
   ```bash
   cd frontend
   npm install
   ```

3. **Python Scraper Setup**
   ```bash
   # create a virtual environment in the root directory
   python -m venv .venv 
   
   # activate the virtual environment
   # On Windows:
   .venv\Scripts\activate
   
   # install requirements
   cd python-scraper
   pip install fastapi uvicorn playwright
   
   # install playwright browsers
   playwright install
   ```

## Running the Application

### The Easy Way (Windows)
Double-click the `start_project.bat` file located in the root directory. 
This batch script will automatically spawn three terminal windows and start all required services:
1. React Frontend (Typically accessible at http://localhost:3000 or http://localhost:5173)
2. Node.js Backend Server (Port 3001)
3. Python Web Scraper API (Port 8000)

*To stop the project, simply close the three terminal windows.*

### The Manual Way
If you prefer or are using another OS, open three terminals and run the following commands respectively:

**Terminal 1 (Backend):**
```bash
cd backend
npm run dev
```

**Terminal 2 (Frontend):**
```bash
cd frontend
npm run dev
```

**Terminal 3 (Scraper):**
```bash
cd python-scraper
# Ensure your virtual environment is activated
uvicorn main:app --host 0.0.0.0 --port 8000 --reload
```
