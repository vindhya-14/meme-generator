from flask import Flask, request, jsonify
from flask_cors import CORS
import random
from time import sleep
import logging
from functools import wraps

app = Flask(__name__)

# CORS Configuration
CORS(app, resources={
    r"/generate-meme": {
        "origins": ["http://localhost:5173", "http://127.0.0.1:5173"],
        "methods": ["POST"],
        "allow_headers": ["Content-Type"]
    }
})

# Logging Configuration
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

# Meme Captions Database
MEME_DATABASE = {
    "coding": {
        "captions": [
            "When your code works on the first try: SUSPICIOUS",
            "Git commit -m 'Fixed bug' (changes: 1,234 files)",
            "Me: I'll document this later... 3 years later: What does this even do?",
            "Debugging: Removing code until the error disappears",
            "My code has no bugs, just undocumented features",
            "I don't always test my code, but when I do, I do it in production",
            "Compiling... (5 hours later) Still compiling...",
            "Me: I'll just code for 30 minutes... *sun rises*",
            "When you finally fix a bug but create two new ones",
            "My IDE knows more about my code than I do"
        ],
        "weight": 0.8
    },
    "exam": {
        "captions": [
            "When you recognize a question but can't remember the answer",
            "Me before exam: I'm prepared. Me during exam: What is this language?",
            "Multiple choice: When all options look equally wrong",
            "When you write an essay answer for a 1-mark question",
            "That moment when you realize you studied the wrong chapter",
            "When the exam is open book but you still fail",
            "Me: I'll just guess C. Exam: There is no C option",
            "When you finish the exam first but everyone else is still writing",
            "When the professor says 'easy exam' but it's actually a nightmare",
            "That one question worth 50% of the grade that you skipped"
        ],
        "weight": 0.7
    },
    "life": {
        "captions": [
            "Me as a kid: I'll never be like my parents. Me now: *becomes parents*",
            "When you're an adult but still wait for the 'real adults' to show up",
            "My motivation: Comes and goes like Wi-Fi signal",
            "Me: I should exercise. Also me: *orders pizza*",
            "When you wake up tired despite sleeping 12 hours",
            "My bank account: *cries in negative balance*",
            "Me: I'll be productive today. *watches Netflix for 8 hours*",
            "When you're hungry but too lazy to cook or order food",
            "Me trying to adult: *fails spectacularly*",
            "When you realize weekends are just days you don't get paid to be tired"
        ],
        "weight": 0.75
    },
    "relationships": {
        "captions": [
            "When your crush texts you: *overanalyzes for 3 hours*",
            "Me trying to flirt: *sounds like a malfunctioning robot*",
            "When you're single but your pet loves you unconditionally",
            "Relationship status: In a complicated relationship with food",
            "When you're arguing but forget what you're arguing about",
            "Me: I don't need love. Also me: *cries at romcoms*",
            "When they say 'we need to talk' and your soul leaves your body",
            "Dating in 2024: Swipe right for disappointment",
            "When you're the third wheel but the food is good",
            "Love language: Leaving me alone with snacks"
        ],
        "weight": 0.65
    },
    "random": {
        "captions": [
            "My spirit animal is a sloth on Ambien",
            "I'm not arguing, I'm just explaining why I'm right",
            "My hobbies include napping and forgetting things",
            "I'm not short, I'm concentrated awesome",
            "Error 404: Adulthood not found",
            "I don't hold grudges, I remember facts",
            "My social battery: *dies after 5 minutes*",
            "I'm not ignoring you, I'm prioritizing my peace",
            "My patience is thinner than my hairline",
            "I'm not lazy, I'm in energy-saving mode"
        ],
        "weight": 1.0
    }
}

# Rate Limiting Decorator
def rate_limit(max_per_minute=60):
    def decorator(f):
        @wraps(f)
        def wrapped(*args, **kwargs):
            sleep(60 / max_per_minute)
            return f(*args, **kwargs)
        return wrapped
    return decorator

# Fuzzy Match Topic
def get_meme_category(topic):
    topic = topic.lower().strip()
    if topic in MEME_DATABASE:
        return topic
    for category in MEME_DATABASE:
        if category.startswith(topic) or topic in category:
            return category
    return "random"

# Generate Meme Endpoint
@app.route('/generate-meme', methods=['POST'])
@rate_limit(max_per_minute=120)
def generate_meme():
    if not request.is_json:
        return jsonify({'error': 'Request must be JSON'}), 400

    data = request.get_json()
    topic = data.get('topic', 'random')

    if not isinstance(topic, str) or len(topic.strip()) == 0 or len(topic) > 100:
        return jsonify({'error': 'Invalid topic format'}), 400

    category = get_meme_category(topic)
    captions = MEME_DATABASE[category]['captions']
    caption = random.choice(captions)

    logger.info(f"Meme generated for topic: {topic} (resolved category: {category})")

    # Simulate processing delay
    sleep(random.uniform(0.1, 0.5))

    return jsonify({
        'meme_text': caption,
        'category': category,
        'success': True
    })

# Health Check Endpoint
@app.route('/health', methods=['GET'])
def health_check():
    return jsonify({
        'status': 'healthy',
        'version': '1.0.0',
        'categories': list(MEME_DATABASE.keys())
    })

# App Runner
if __name__ == '__main__':
    app.run(
        host='0.0.0.0',
        port=5000,
        debug=True,
        threaded=True
    )
