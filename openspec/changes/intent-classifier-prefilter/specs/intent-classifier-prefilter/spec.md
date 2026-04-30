<!-- Generated 2026-04-29 by Copilot agent for openspec workflow -->

# Spec: intent-classifier-prefilter

## Requirement: Reject off-topic requests

WHEN a request contains an off-topic prompt (e.g., a coding question)
THEN the function returns 403 and does not call Groq

### Requirement: Allow roast-related requests

WHEN a request contains allowed intent (e.g., "give me a roast" or navigation help)
THEN the function proceeds to call Groq and returns 200 with the insult JSON

### Requirement: Quota enforcement

WHEN a request exceeds the allowed rate/quota
THEN the function returns 429
