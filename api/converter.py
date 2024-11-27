import os
import time
import openai
from termcolor import colored
import threading

# Constants
FILE_PATH = "write_here.txt"
OPENAI_API_KEY = os.getenv("OPENAI_API_KEY")
DEFAULT_LANGUAGE = "english"
DEFAULT_STYLE = "formal"
CHECK_INTERVAL = 0.5  # seconds
MODEL = "gpt-4o-mini"

# Initialize OpenAI
try:
    openai.api_key = OPENAI_API_KEY
    if not OPENAI_API_KEY:
        raise ValueError("OpenAI API key not found")
except Exception as e:
    print(colored(f"Error initializing OpenAI: {str(e)}", "red"))
    exit(1)

def clear_file():
    """Reset the file to its initial state."""
    try:
        with open(FILE_PATH, "w", encoding="utf-8") as f:
            f.write(f"LANGUAGE: {DEFAULT_LANGUAGE}\nSTYLE: {DEFAULT_STYLE}\n\n<WRITE IN BETWEEN THESE TAGS>\n<WRITE IN BETWEEN THESE TAGS>\n\nSTYLED VERSION:")
        print(colored("File cleared and reset to initial state", "green"))
    except Exception as e:
        print(colored(f"Error clearing file: {str(e)}", "red"))

def get_file_content():
    """Read and parse the file content."""
    try:
        with open(FILE_PATH, "r", encoding="utf-8") as f:
            content = f.read()
        
        # Extract language and style
        lines = content.split("\n")
        language = lines[0].replace("LANGUAGE:", "").strip().lower()
        style = lines[1].replace("STYLE:", "").strip().lower()
        
        # Extract text between tags
        start_tag = "<WRITE IN BETWEEN THESE TAGS>"
        end_tag = "<WRITE IN BETWEEN THESE TAGS>"
        text_between_tags = content.split(start_tag)[1].split(end_tag)[0].strip()
        
        return language, style, text_between_tags
    except Exception as e:
        print(colored(f"Error reading file: {str(e)}", "red"))
        return DEFAULT_LANGUAGE, DEFAULT_STYLE, ""

def convert_style(text, target_language, style):
    """Convert text to specified style using OpenAI."""
    try:
        if not text.strip():
            return ""

        # Modified prompt to emphasize translation rather than rewriting
        prompt = (
            f"Translate the following text into {target_language} using {style} style. "
            f"Preserve the exact meaning and content - only change the language and tone. "
            f"Do not add, remove, or modify any information:\n\n{text}"
        )
        
        response = openai.chat.completions.create(
            model=MODEL,
            messages=[
                {"role": "system", "content": (
                    f"You are a precise translator that converts text to {target_language} "
                    f"using {style} style. Maintain exact meaning - only change language and tone."
                )},
                {"role": "user", "content": prompt}
            ]
        )
        
        styled_text = response.choices[0].message.content.strip()
        print(colored(f"Successfully translated to {style} style in {target_language}", "green"))
        return styled_text
    except Exception as e:
        print(colored(f"Error in translation: {str(e)}", "red"))
        return ""

def update_styled_version(styled_text):
    """Update the styled version in the file."""
    try:
        with open(FILE_PATH, "r", encoding="utf-8") as f:
            content = f.read()
        
        # Split at "STYLED VERSION:" and keep the header part
        parts = content.split("STYLED VERSION:")
        new_content = parts[0] + "STYLED VERSION:\n" + styled_text
        
        with open(FILE_PATH, "w", encoding="utf-8") as f:
            f.write(new_content)
    except Exception as e:
        print(colored(f"Error updating styled version: {str(e)}", "red"))

def main():
    """Main function to monitor file changes and update translations."""
    print(colored("Starting Style Converter...", "cyan"))
    clear_file()
    
    last_content = ""
    last_language = DEFAULT_LANGUAGE
    last_style = DEFAULT_STYLE
    
    while True:
        try:
            language, style, current_content = get_file_content()
            
            # Check if content or settings changed
            if (current_content != last_content or 
                language != last_language or 
                style != last_style) and current_content.strip():
                
                print(colored(f"Converting to {style} style in {language}...", "yellow"))
                styled_text = convert_style(current_content, language, style)
                if styled_text:
                    update_styled_version(styled_text)
                
                last_content = current_content
                last_language = language
                last_style = style
            
            time.sleep(CHECK_INTERVAL)
        except Exception as e:
            print(colored(f"Error in main loop: {str(e)}", "red"))
            time.sleep(CHECK_INTERVAL)

if __name__ == "__main__":
    main() 