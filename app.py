from flask import Flask, render_template, jsonify, request
import os
import openai
from termcolor import colored

# Constants
OPENAI_API_KEY = os.getenv("OPENAI_API_KEY")
MODEL = "gpt-4o-mini"

app = Flask(__name__)

# Initialize OpenAI
try:
    if not (OPENAI_API_KEY := os.getenv("OPENAI_API_KEY")):
        raise ValueError("OpenAI API key not found")
    openai.api_key = OPENAI_API_KEY
except Exception as e:
    print(colored(f"Error initializing OpenAI: {str(e)}", "red"))
    exit(1)

@app.route('/')
def index():
    return render_template('index.html')

@app.route('/convert', methods=['POST'])
def convert():
    try:
        data = request.json
        input_text = data.get('text', '')
        style = data.get('style', '')
        example = data.get('example', '')
        specific = data.get('specific', '')
        target_language = data.get('target_language', 'english')
        
        print(colored(f"Processing translation request: {style} in {target_language}", "cyan"))
        
        # Build the translation prompt
        prompt = get_translation_prompt(style, example, specific)
        
        # Add language instruction
        language_instruction = {
            'english': "Translate to English",
            'french': "Translate to French",
            'spanish': "Translate to Spanish"
        }.get(target_language, "Translate to English")
        
        # Call OpenAI API with modified system message
        response = openai.chat.completions.create(
            model=MODEL,
            messages=[
                {"role": "system", "content": (
                    f"You are a precise translator. {language_instruction} using {style} style. "
                    f"Preserve exact meaning - only change language and tone."
                )},
                {"role": "user", "content": prompt + "\n\nText to translate:\n" + input_text}
            ]
        )
        
        translated_text = response.choices[0].message.content.strip()
        print(colored("Translation completed successfully", "green"))
        
        return jsonify({
            'converted_text': translated_text,
            'status': 'success'
        })

    except Exception as e:
        print(colored(f"Error during translation: {str(e)}", "red"))
        return jsonify({
            'error': str(e),
            'status': 'error'
        }), 500

def get_translation_prompt(style, example=None, specific=None):
    base_prompts = {
        'formal': 'Translate using formal, sophisticated language appropriate for academic or official documents.',
        'professional': 'Translate using clear, professional language suitable for business communication.',
        'casual': 'Translate using relaxed, conversational language.',
        'creative': 'Translate using creative language while preserving exact meaning.'
    }
    
    prompt = base_prompts.get(style, 'Translate using standard language.')
    
    if example and example != 'custom-format...':
        if example == 'historical-voice' and specific:
            prompt += f"\nUse language typical of the {specific} historical period while preserving meaning."
        elif example == 'character-voice' and specific:
            prompt += f"\nUse language typical of a {specific} character while preserving meaning."
        elif example == 'storytelling' and specific:
            prompt += f"\nUse language typical of a {specific} story while preserving meaning."
            
    return prompt

def get_character_prompt(character):
    character_prompts = {
        'caveman': "Transform this text into primitive cave-person speech.",
        'pirate': "Speak like a salty sea captain with lots of 'Arr', 'ye', 'matey', and nautical references. Use pirate slang and seafaring terminology.",
        'jester': "Write in a playful, rhyming style with lots of wordplay, puns, and silly jokes. Add occasional bells and foolery references.",
    }
    return character_prompts.get(character, "Write in a standard style.")

if __name__ == '__main__':
    app.run(debug=True) 