# SET (Smart Expense Tracker)

Hey there! Welcome to **SET** – an intuitive, full-stack web application designed to help you take back control of your personal finances. Instead of just tracking numbers on a spreadsheet, SET provides a beautifully designed dashboard with real-time insights, visual analytics, and subscription management tools to help you build better spending habits.

## Features That Stand Out

*   **Beautiful Visual Analytics:** Get a clear picture of your finances with interactive donut charts and area trends powered by Recharts.
*   **Smart Financial Insights:** SET analyzes your spending habits and warns you if you're about to exceed your budget or if you're spending way more than last month.
*   **Subscription Manager:** Never get hit with a surprise charge again. SET tracks your recurring bills and notifies you before they are due.
*   **Secure Authentication:** Features robust JWT token-based authentication with Bcrypt password hashing to ensure your financial data stays private and secure.

## Built With

I built this project using a modern and scalable technology stack:

**Frontend Ecosystem:**
*   **React + Vite:** For an incredibly fast and snappy user interface.
*   **Tailwind CSS:** For the completely custom, responsive, and glassmorphic design system.
*   **Lucide React:** For clean and modern iconography.
*   **Recharts:** For dynamic data visualization.

**Backend Engine:**
*   **FastAPI (Python):** For a lightning-fast, highly-concurrent API backend.
*   **SQLAlchemy + Pydantic:** For robust data modeling, validation, and database interactions.
*   **SQLite (Local) / PostgreSQL (Production):** For secure data storage.

## How to Run It Locally

If you want to spin this up on your own machine, follow these steps:

### 1. Start the Backend
Navigate to the `Backend` directory, install the dependencies, and start the FastAPI server:
```bash
cd Backend
python -m venv venv
# On Windows use: .\venv\Scripts\activate
# On Mac/Linux use: source venv/bin/activate
pip install -r requirements.txt
uvicorn main:app --reload
```
The API will be live at `http://localhost:8000`.

### 2. Start the Frontend
Open a new terminal window, navigate to the `Frontend` directory, install the packages, and run the development server:
```bash
cd Frontend
npm install
npm run dev
```
The application will be live at `http://localhost:5173`. 

---

