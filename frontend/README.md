# MyDreams

MyDreams is a life-goal and dream management platform that helps you track your aspirations, categorized into various life domains. It features AI-powered dream analysis to automatically categorize and structure your goals.

## Project Structure

- **frontend/**: Next.js 15 application (React 19, Tailwind CSS v4).
- **backend/**: FastAPI application (Python) handling data persistence and AI analysis.

## Getting Started

### Prerequisites

- Node.js 18+
- Python 3.10+
- [Ollama](https://ollama.com/) (for local AI analysis) running with `llama3` or compatible model.

### Backend Setup

1.  Navigate to the backend directory:
    ```bash
    cd backend
    ```

2.  Create and activate a virtual environment:
    ```bash
    python -m venv venv
    source venv/bin/activate  # On Windows: venv\Scripts\activate
    ```

3.  Install dependencies:
    ```bash
    pip install -r requirements.txt
    ```

4.  Run the server:
    ```bash
    # Assuming main.py is in app/
    uvicorn app.main:app --reload
    ```
    The backend will start at `http://localhost:8000`.

### Frontend Setup

1.  Navigate to the frontend directory:
    ```bash
    cd frontend
    ```

2.  Install dependencies:
    ```bash
    npm install
    ```

3.  Run the development server:
    ```bash
    npm run dev
    ```
    The frontend will be available at `http://localhost:3000`.

## Features

- **Dream Dashboard**: Overview of your goals by category.
- **Timeline**: Visualize your life goals on a timeline.
- **Kanban Board**: Drag-and-drop interface to manage dream status.
- **AI Analysis**: Input natural language dreams and let AI structure them for you.
