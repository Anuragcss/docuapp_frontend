# AI Presentation Assistant - "Little A"

Welcome to the AI Presentation Assistant! This application, "Little A," helps users transform documents, web links, or raw text into summaries and polished PowerPoint presentations. It is powered by a Vite.js + React frontend and a Python (FastAPI) backend.

## Table of Contents

1.  [Features](#features)
2.  [Tech Stack](#tech-stack)
3.  [Prerequisites](#prerequisites)
4.  [Setup and Installation](#setup-and-installation)
    * [Backend Setup (FastAPI)](#backend-setup-fastapi)
    * [Frontend Setup (Vite)](#frontend-setup-vite)
5.  [Project Structure](#project-structure)
6.  [API Endpoints](#api-endpoints)
7.  [Notes for Developers](#notes-for-developers)

## Features

* **Multiple Input Sources**: Generate content from uploaded files (`.pptx`, `.docx`, `.pdf`, images, `.txt`), web URLs, or pasted text.
* **AI-Powered Summarization**: Create concise summaries from the source material, with options for paragraphs or bullet points.
* **Automatic PPT Generation**: Convert source material into a PowerPoint presentation with a single click.
* **Customization Options**:
    * Choose from predefined PPT templates or upload a custom one.
    * Add a custom logo and specify its position.
    * Configure headers and footers, including date/time and slide numbers.
* **PPT Preview**: Review the generated slides directly in the browser before downloading.
* **User Workspace ("MyWork")**: View, download, share, and delete previously generated presentations.
* **Default Settings**: Save default preferences for PPT and summary generation to streamline workflow.

## Tech Stack

* **Frontend**:
    * Vite.js
    * React.js
    * React Router (`react-router-dom`)
    * React Toastify (for notifications)
    * CSS Modules

* **Backend**:
    * Python 3
    * FastAPI
    * SQLAlchemy (for ORM)
    * Alembic (for database migrations)
    * `python-pptx` for generating presentations
    * `python-docx` for generating Word documents
    * `transformers` & `torch` for AI/ML tasks (summarization, content analysis)

## Prerequisites

Before you begin, ensure you have the following installed on your system:
* Node.js (v14 or later) & npm
* Python (v3.8 or later) & pip
* A virtual environment tool for Python (like `venv`)

## Setup and Installation

The project is split into two main parts: the backend server and the frontend client.

### Backend Setup (FastAPI)

The backend server handles the core logic, including AI processing and file generation.

1.  **Clone the repository (if applicable):**
    ```bash
    git clone <repository-url>
    cd <project-folder>/backend  # Assuming a nested backend folder
    ```

2.  **Create and activate a virtual environment:**
    ```bash
    python -m venv venv
    source venv/bin/activate  # On Windows, use `venv\Scripts\activate`
    ```

3.  **Install Python dependencies:**
    ```bash
    pip install -r requirements.txt
    ```

4.  **Configure your Environment and Database:**
    * Create a `.env` file for your database URL and any other secrets.
    * In your main application file (e.g., `main.py`), configure CORS Middleware to accept requests from your frontend (`http://localhost:5173`).
    * Initialize the database and run migrations using Alembic.
    ```bash
    # This command creates a new migration script after you change your SQLAlchemy models
    alembic revision --autogenerate -m "Create initial tables"
    # This command applies the migrations to the database
    alembic upgrade head
    ```

5.  **Start the backend server:**
    The frontend code makes API calls to `http://127.0.0.1:8000`. Assuming your main FastAPI app instance is in `main.py`, run:
    ```bash
    uvicorn main:app --reload --port 8000
    ```
    The backend API should now be running at `http://127.0.0.1:8000`.

### Frontend Setup (Vite)

The frontend is a Vite-powered React application that provides the user interface.

1.  **Navigate to the frontend directory:**
    ```bash
    cd <project-folder>/frontend # Assuming a nested frontend folder
    ```

2.  **Install npm packages:**
    A Vite + React `package.json` would look similar to this:
    ```json
    {
      "name": "ai-assistant-frontend",
      "private": true,
      "version": "0.0.0",
      "type": "module",
      "scripts": {
        "dev": "vite",
        "build": "vite build",
        "preview": "vite preview"
      },
      "dependencies": {
        "react": "^18.2.0",
        "react-dom": "^18.2.0",
        "react-router-dom": "^6.23.1",
        "react-toastify": "^9.1.3"
      },
      "devDependencies": {
        "@types/react": "^18.2.66",
        "@types/react-dom": "^18.2.22",
        "@vitejs/plugin-react": "^4.2.1",
        "vite": "^5.2.0"
      }
    }
    ```
    Run the installation:
    ```bash
    npm install
    ```

3.  **Start the frontend development server:**
    ```bash
    npm run dev
    ```
    The application should now be running and accessible at `http://localhost:5173` (Vite's default port).

## Project Structure

This is a brief overview of the key frontend components provided.

* `GeneratePPT.jsx`: The main page for uploading content and generating either a summary or a PPT. It contains the primary logic for handling user input, displaying customization modals, and calling the generation APIs.
* `PPTPreview.jsx`: A dedicated page to display the generated slide images. It allows users to navigate through the slides, download the final `.pptx` file, or go back to edit the options.
* `MyWork.jsx`: The user's dashboard. It fetches and displays a grid of all previously generated presentations, with options to download, delete, or share them.
* `Settings.jsx`: Allows users to set and save default preferences for summary and PPT generation, such as default templates, logos, and header/footer content.
* `Inputpage.jsx`: Appears to be a simpler, possibly deprecated or alternative input page. It contains a basic form for a title and summary type.

## API Endpoints

The frontend interacts with the following backend API endpoints. All endpoints require a `Bearer <token>` in the `Authorization` header.

* `POST /estimate-content-metrics/`
    * **Description**: Analyzes the provided content to suggest the number of slides or sections.
    * **Payload**: `FormData` containing a `file`, `pasted_text`, or `url`.
    * **Response**: JSON with `suggested_sections` and `estimation_details`.

* `POST /generate-ppt/`
    * **Description**: The main endpoint to generate either a summary or a PPT file.
    * **Payload**: `FormData` containing the `topic`, `mode` (`'summary'` or `'ppt'`), the content (`file`, `pasted_text`, or `url`), and all relevant customization options (template, logo, footer text, etc.).
    * **Response (PPT)**: JSON with `pptx_download_url`, `pptx_filename`, and an array of `slide_image_urls`.
    * **Response (Summary)**: JSON with the `topic`, `introduction`, `summary_text`, and `conclusion`.

* `POST /generate-summary-docx/`
    * **Description**: Converts a generated summary into a downloadable `.docx` file.
    * **Payload**: JSON containing the `summary_output` object and `options` for the document format.
    * **Response**: A `.docx` file blob.

* `GET /presentations/my-work/`
    * **Description**: Fetches all presentations created by the currently authenticated user.
    * **Response**: A JSON array of presentation objects, each with an `id`, `topic`, `filename`, `preview_image_url`, and `created_at`.

* `DELETE /presentations/{ppt_id}/`
    * **Description**: Deletes a specific presentation by its ID.
    * **Response**: A confirmation message on successful deletion.

## Notes for Developers

* **Missing CSS File**: The file `Inputpage.module.css` is imported in `Inputpage.jsx` but was not provided. You will need to create this file or remove the import to prevent compilation errors.
* **Authentication**: The application uses token-based authentication. The JWT token is expected to be stored in `localStorage`. The components for Login/Registration that would generate this token were not provided.
* **Environment Variables**: It is good practice to store the backend API URL (`http://127.0.0.1:8000`) in a `.env` file for the frontend application (e.g., `VITE_API_BASE_URL`).