# Flask Meme Generator API

A simple Flask-based REST API that generates random meme captions based on user-specified topics such as coding, exams, life, relationships, and random. The API supports CORS to allow integration with frontend applications and includes rate limiting and a health check endpoint.

---

## Features

* Generate random meme captions by topic
* Supports topics: `coding`, `exam`, `life`, `relationships`, and `random`
* Rate limiting to prevent abuse (configurable)
* Health check endpoint to verify API status
* CORS enabled for specified origins

---

## Getting Started

### Prerequisites

* Python 3.7 or higher
* pip (Python package installer)

### Installation

1. Clone the repository:

   ```bash
   git clone https://github.com/yourusername/flask-meme-generator.git
   cd flask-meme-generator
   ```

2. Create and activate a virtual environment (optional but recommended):

   ```bash
   python -m venv venv
   source venv/bin/activate  # On Windows: venv\Scripts\activate
   ```

3. Install dependencies:

   ```bash
   pip install -r requirements.txt
   ```

### Running the API

```bash
python app.py
```

The API will be available at `http://localhost:5000`.

---

## API Endpoints

### Generate Meme Caption

* **URL:** `/generate-meme`

* **Method:** `POST`

* **Headers:** `Content-Type: application/json`

* **Body:**

  ```json
  {
    "topic": "coding"
  }
  ```

* **Response:**

  ```json
  {
    "meme_text": "When your code works on the first try: SUSPICIOUS",
    "category": "coding",
    "success": true
  }
  ```

* If no topic or an unknown topic is provided, it defaults to `random`.

---

### Health Check

* **URL:** `/health`
* **Method:** `GET`
* **Response:**

  ```json
  {
    "status": "healthy",
    "version": "1.0.0",
    "categories": ["coding", "exam", "life", "relationships", "random"]
  }
  ```

---

## Configuration

* CORS allowed origins configured in `app.py`.
* Rate limiting can be adjusted in the `rate_limit` decorator.

---


