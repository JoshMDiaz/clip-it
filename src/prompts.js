// ============================================================================
// PROMPT TEMPLATES
// ============================================================================
// This file contains the prompt templates used to construct AI requests.
// To add new formatting options:
// 1. Add a new mode in the MODES object below
// 2. Add corresponding prompt templates in the getPrompt function
// 3. Update the UI dropdown options in App.jsx

export const MODES = {
  FORMAT: 'Format',
  SUMMARIZE: 'Summarize',
  FORMAT_AS_EMAIL: 'Format as Email',
  FORMAT_AS_SLACK: 'Format as Slack Message',
}

export const TONES = {
  PROFESSIONAL: 'Professional',
  LAID_BACK: 'Laid-back',
  CASUAL: 'Casual',
}

/**
 * Constructs the AI prompt based on mode and tone selections
 * @param {string} mode - The formatting mode (Format, Summarize, Format as Email)
 * @param {string} tone - The tone (Professional, Laid-back)
 * @param {string} userText - The text to format
 * @returns {string} The complete prompt for the AI endpoint
 */
export function getPrompt(mode, tone, userText) {
  let toneDescription
  if (tone === TONES.PROFESSIONAL) {
    toneDescription =
      'Use a tone that is professional, concise, and well-structured.'
  } else if (tone === TONES.CASUAL) {
    toneDescription = 'Use a tone that is casual, friendly, and clear.'
  } else {
    // LAID_BACK
    toneDescription =
      'Use a tone that is laid-back, approachable, and conversational.'
  }

  switch (mode) {
    case MODES.FORMAT:
      return `You are a rewriting assistant. Rewrite the text to be cleaner, clearer, and better organized.

${toneDescription}

Rules:

- Do NOT change the meaning.

- Do NOT add or remove ideas.

- Do NOT summarize or expand.

- Remove filler and repetition.

- Do NOT add greetings or closings.

- Return ONLY the rewritten text.

Text:

${userText}`

    case MODES.SUMMARIZE:
      return `You are a summarization assistant. Summarize the text into 2–3 sentences.

${toneDescription}

Rules:

- Preserve key information only.

- Do NOT include greetings or closings.

- Do NOT add new content.

- Return ONLY the summary.

Text:

${userText}`

    case MODES.FORMAT_AS_EMAIL:
      return `You are an email-formatting assistant. Convert the text into a well-structured email with:

- A subject line

- A greeting

- A concise body (3–6 sentences unless necessary)

- A closing

${toneDescription}

Rules:

- Do NOT add information not present in the original text.

- Do NOT add unnecessary pleasantries.

- Return ONLY the formatted email.

Text:

${userText}`

    case MODES.FORMAT_AS_SLACK:
      return `You are a Slack-message formatting assistant. Rewrite the text as a concise Slack message.

${toneDescription}

Rules:

- Keep it short and scannable.

- Use @mentions or emoji only if natural (max 1–2).

- No greetings or sign-offs.

- No added information.

- Return ONLY the Slack message.

Text:

${userText}`

    default:
      return `Rewrite the following text.

${toneDescription}

Rules:

- Do NOT add greetings.

- Do NOT add or remove ideas.

- Return ONLY the rewritten text.

Text:

${userText}`
  }
}
