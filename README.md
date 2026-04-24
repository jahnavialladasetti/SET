# SpendSense - Smart Personal Finance + Subscription Manager 💸

SpendSense is a full-stack web application designed to help users track their daily expenses and manage recurring subscriptions seamlessly. Built to demonstrate real-world engineering practices including secure authentication, relational database modeling, and robust API development.

## Tech Stack
- **Frontend:** React (Vite), Tailwind CSS, Recharts, Lucide React
- **Backend:** Python, FastAPI, SQLAlchemy, Alembic, Pydantic, Passlib
- **Database:** SQLite (Local) / PostgreSQL (Production)

## Features
- **Secure Authentication:** JWT-based login and signup with hashed passwords.
- **Dashboard:** At-a-glance financial summary with dynamic pie charts and upcoming bills alerts.
- **Expense Tracker:** Log daily income/expenses with categorization.
- **Subscription Manager:** Track recurring bills and automatically calculate the next due date based on monthly/yearly cycles.

## Local Setup

### 1. Backend
```bash
cd backend
python -m venv venv
# Activate virtual environment
# Windows: .\venv\Scripts\activate
# Mac/Linux: source venv/bin/activate

pip install -r requirements.txt
uvicorn main:app --reload
```
The API will run at `http://localhost:8000`.

### 2. Frontend
```bash
cd frontend
npm install
npm run dev
```
The React app will run at `http://localhost:5173`.

## Deployment (Render & Vercel)
- **Backend (Render):** Create a PostgreSQL database on Render. Update the `DATABASE_URL` environment variable. Deploy the `backend` folder as a Web Service. Use `uvicorn main:app --host 0.0.0.0 --port $PORT` as the start command.
- **Frontend (Vercel):** Connect the GitHub repository to Vercel, set the Root Directory to `frontend`, and configure `VITE_API_URL` to point to the Render backend URL.
