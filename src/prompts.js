// ============================================================================
// PROMPT TEMPLATES
// ============================================================================
// This file contains the prompt templates used to construct AI requests.

export const MODES = {
  FORMAT: 'Format',
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
 * @param {string} mode
 * @param {string} tone
 * @param {string} userText
 * @returns {string}
 */
export function getPrompt(mode, tone, userText) {
  let toneDescription = ''

  if (tone === TONES.PROFESSIONAL) {
    toneDescription =
      'Use a professional tone: clear, direct, concise, neutral, and well-structured.'
  } else if (tone === TONES.CASUAL) {
    toneDescription =
      'Use a casual tone: friendly, natural, relaxed, and easy to read.'
  } else {
    // LAID_BACK
    toneDescription =
      'Use a laid-back tone: conversational, approachable, informal but still clear.'
  }

  switch (mode) {
    case MODES.FORMAT:
      return `You are a message formatting assistant. Rewrite the text to improve clarity, organization, and readability while preserving the original meaning.

${toneDescription}

Guidelines:
- Improve flow and structure
- Break up long sentences when helpful
- Use short paragraphs or bullet points if it improves clarity
- Remove filler and repetition

Rules:
- Do NOT change the meaning
- Do NOT add or remove ideas
- Do NOT summarize or expand
- Do NOT add greetings or closings
- Return ONLY the rewritten text

Text:
${userText}`

    case MODES.FORMAT_AS_EMAIL:
      return `You are an email-formatting assistant. Convert the text into a clear, well-structured email.

${toneDescription}

Email structure:
- Subject line (short and specific)
- Simple greeting
- Clear, concise body
- Minimal, polite closing

Rules:
- Do NOT add information not present in the original text
- Avoid unnecessary pleasantries
- Keep it scannable
- Return ONLY the formatted email

Text:
${userText}`

    case MODES.FORMAT_AS_SLACK:
      return `You are a Slack-message formatting assistant. Rewrite the text as a concise Slack message.

${toneDescription}

Slack guidelines:
- Keep it short and scannable
- Use line breaks or bullet points when helpful
- Optimize for quick reading
- Use emoji or @mentions only if natural (max 1–2)

Rules:
- No greetings or sign-offs
- Do NOT add information
- Do NOT change intent
- Return ONLY the Slack message

Text:
${userText}`

    default:
      return `Rewrite the following text to improve clarity and organization.

${toneDescription}

Rules:
- Preserve meaning
- Do NOT add greetings
- Do NOT add or remove ideas
- Return ONLY the rewritten text

Text:
${userText}`
  }
}
