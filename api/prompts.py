"""Configuration file for voice prompts"""

# Historical voice prompts
HISTORICAL_PROMPTS = {
    'cave-person-era': "Transform text into primitive caveman speech: drop articles, use 'me' instead of 'I', add grunts (Ugg!), and keep very short with basic words.",
    'ancient-egyptian': "Use formal, hieroglyphic-inspired language with references to Egyptian deities, pharaohs, and the Nile. Include references to Ra, Horus, and ancient Egyptian customs.",
    'classical-greek': "Use philosophical and poetic language with references to Greek mythology, the Agora, and democratic ideals. Include references to Zeus, Apollo, and the Greek virtues.",
    'roman-empire': "Use imperial Roman terminology with Latin phrases. Reference the Senate, legions, and Roman virtues. Use phrases like 'By Jupiter' and reference Roman customs.",
    'medieval-times': "Use medieval terminology with feudal references. Include mentions of lords, knights, and kingdoms. Use archaic terms like 'thee', 'thou', and period-appropriate expressions.",
    'renaissance': "Use eloquent Renaissance language with references to art, science, and humanism. Include references to great thinkers and artists of the period.",
    'victorian-era': "Use formal Victorian English with proper etiquette. Include references to propriety, social customs, and industrial progress. Use elaborate, proper language.",
    'roaring-20s': "Use Jazz Age slang and speakeasy terminology. Include references to prohibition, flappers, and jazz. Use phrases like 'bee's knees' and 'cat's pajamas'.",
    '1950s-america': "Use post-war Americana language. Reference suburbia, rock'n'roll, and optimistic prosperity. Include phrases like 'gee whiz' and 'swell'.",
    '1960s-counterculture': "Use peace-and-love terminology and protest language. Include references to flower power, civil rights, and psychedelic culture. Use phrases like 'far out' and 'groovy'.",
    '1980s-pop-culture': "Use Valley Girl slang and MTV-era references. Include mentions of malls, video games, and pop culture. Use words like 'totally', 'radical', and 'awesome'.",
    '1990s-valley-girl': "Use heavy Valley Girl speech patterns. Include 'like', 'totally', 'whatever', and 'as if'. Reference 90s pop culture, fashion, and technology.",
    'y2k-era': "Use early internet slang and millennium buzz words. Reference dial-up internet, early social media, and Y2K concerns. Use 'lol', 'brb', and early texting language.",
    'modern-gen-z': "Use current Gen Z slang and internet terminology. Include references to TikTok, memes, and social media culture. Use terms like 'no cap', 'based', and current internet slang."
}

# Character voice prompts
CHARACTER_PROMPTS = {
    'shakespearean': "Speak in theatrical Elizabethan English with poetic flourishes and iambic rhythm.",
    'yoda': "Speak in Object-Subject-Verb order with 'Hmm' and 'Yes' for emphasis, using wisdom and Force references.",
    'pirate-captain': "Use pirate slang ('arr', 'matey') with nautical terms and seafaring expressions ('shiver me timbers').",
    'royal-decree': "Use formal, regal language with royal pronouns (we/our) and ceremonial terminology.",
    'mystical-wizard': "Use arcane terminology, magical references, and mysterious, cryptic phrasing."
}

def get_prompt(voice_type, specific=None):
    if not specific:
        return None
        
    specific_key = specific.strip().lower().replace(' ', '-').replace('(', '').replace(')', '')
    
    # Handle custom input first
    if 'custom' in specific_key:
        custom_description = specific.replace('Custom Historical...', '').replace('Custom Character...', '').strip()
        return f"Transform the text using this voice style: {custom_description}" if custom_description else None
    
    # Use dictionary get method with None default
    prompts = HISTORICAL_PROMPTS if voice_type == 'historical' else CHARACTER_PROMPTS
    return prompts.get(specific_key) 