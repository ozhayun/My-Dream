# MyDreams

MyDreams is a life-goal and dream management platform that helps you track your aspirations, categorized into various life domains. It features AI-powered dream analysis to automatically categorize and structure your goals.

## Project Structure

- **frontend/**: Next.js application (React 19, Tailwind CSS v4). Dream data is stored in **Supabase** (Clerk auth + server actions). See [frontend/README.md](frontend/README.md) for setup.
- **backend/**: FastAPI application (Python) used for **AI analysis** (Ollama) and optional JSON-file storage. Production dream CRUD goes through the frontend → Supabase.

## Getting Started

### Prerequisites

- Node.js 18+
- Python 3.10+
- [Ollama](https://ollama.com/) (for local AI analysis) with `llama3` or compatible model.

### Frontend (primary)

```bash
cd frontend
npm install
npm run dev
```

Frontend runs at `http://localhost:3000`. Dreams are loaded and saved via Supabase.

### Backend (AI / optional)

```bash
cd backend
python -m venv venv
source venv/bin/activate   # Windows: venv\Scripts\activate
pip install -r requirements.txt
uvicorn app.main:app --reload
```

Backend runs at `http://localhost:8000`. Used for dream analysis and polish/roadmap when configured.

## Features

- **Dream Dashboard**: Overview of your goals by category.
- **Timeline**: Visualize life goals on a timeline.
- **Kanban Board**: Drag-and-drop interface to manage dream status.
- **AI Analysis**: Input natural language dreams and let AI structure them.
