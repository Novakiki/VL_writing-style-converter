from flask import Flask, render_template, jsonify, request
import os
import openai
from api.prompts import get_prompt

# Constants
OPENAI_API_KEY = os.getenv("OPENAI_API_KEY")
MODEL = "gpt-4o-mini"

app = Flask(__name__)

# Initialize OpenAI
if not (OPENAI_API_KEY := os.getenv("OPENAI_API_KEY")):
    raise ValueError("OpenAI API key not found")
openai.api_key = OPENAI_API_KEY

@app.route('/')
def index():
    return render_template('index.html')

@app.route('/convert', methods=['POST'])
def convert():
    try:
        data = request.json
        text = data.get('text', '').strip()
        voice_type = data.get('voice_type', '').strip()
        specific = data.get('specific', '').strip()
        target_language = data.get('target_language', 'english').strip()
        
        if not all([text, voice_type, specific]):
            raise ValueError("Missing required fields")
        
        # Get prompt from configuration
        prompt = get_prompt(voice_type, specific)
        if not prompt:
            raise ValueError("Invalid voice type or specific option selected")
        
        # Enhanced language instructions
        language_instructions = {
            'english': "Keep the text in English",
            'french': (
                "Translate the final result to French. "
                "Make sure to use proper French grammar and accents. "
                "Keep the same style and tone as the original. "
                "Example: 'Where is the bathroom?' in caveman style should become 'Ugh! Où être grotte d'eau?'"
            ),
            'spanish': (
                "Translate the final result to Spanish. "
                "Make sure to use proper Spanish grammar and accents. "
                "Keep the same style and tone as the original. "
                "Example: 'Where is the bathroom?' in caveman style should become '¡Ugh! ¿Dónde estar cueva de agua?'"
            )
        }.get(target_language, "Keep the text in English")
        
        response = openai.chat.completions.create(
            model=MODEL,
            messages=[
                {"role": "system", "content": (
                    f"You are a precise voice and language translator. {language_instructions}. "
                    "First apply the voice style, then translate if needed. "
                    "Respond with plain text only, no quotation marks."
                )},
                {"role": "user", "content": f"{prompt}\n\nText to transform:\n{text}"}
            ]
        )
        
        # Clean any remaining quotes from the response
        converted_text = response.choices[0].message.content.strip().replace('"', '').replace("'", '')
        
        return jsonify({
            'converted_text': converted_text,
            'status': 'success'
        })

    except Exception as e:
        return jsonify({
            'error': str(e),
            'status': 'error'
        }), 500

if __name__ == '__main__':
    app.run(debug=True) 