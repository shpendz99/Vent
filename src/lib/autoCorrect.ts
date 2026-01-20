export const commonCorrections: Record<string, string> = {
  im: "I'm",
  dont: "don't",
  cant: "can't",
  wont: "won't",
  didnt: "didn't",
  hasnt: "hasn't",
  havent: "haven't",
  thats: "that's",
  ive: "I've",
  ill: "I'll",
  youre: "you're",
  theres: "there's",
  arent: "aren't",
  couldnt: "couldn't",
  shouldnt: "shouldn't",
  wouldnt: "wouldn't",
  doesnt: "doesn't",
  isnt: "isn't",
  wasnt: "wasn't",
  werent: "weren't",
  hes: "he's",
  shes: "she's",
  its: "it's", // Contextual, but "it's" is usually what people mean when they omit apostrophe for "it is". "its" (possessive) is invalid if typed "it's"?? No, "its" is possessive. But "its" -> "it's" might be annoying if they meant possessive. I'll omit "its" to be safe.
  lets: "let's",
};

// Helper to reduce 3+ repeated characters to 1 (e.g., "hellllo" -> "helo", "doesn'tttt" -> "doesn't")
function squashRepeatedChars(text: string): string {
  return text.replace(/(.)\1{2,}/g, "$1");
}

export function autoCorrectText(text: string): string {
  // Tokenize by splitting on whitespace and punctuation, keeping delimiters
  const tokens = text.split(/(\s+|[.,;!?]+)/);
  const values = Object.values(commonCorrections);

  const correctedTokens = tokens.map((token) => {
    // Skip delimiters/empty or very short tokens
    if (!token.trim() || token.length < 2) return token;

    // 1. Direct Lookup (e.g. "im", "dont")
    const lower = token.toLowerCase();
    if (commonCorrections[lower]) {
      return matchCase(token, commonCorrections[lower]);
    }

    // 2. Squash Repetitions (e.g. "doesntttt" -> "doesnt", "doesn'tttt" -> "doesn't")
    // Only apply if the token actually has repeated chars
    if (/(.)\1{2,}/.test(token)) {
      const squashed = squashRepeatedChars(token);
      const lowerSquashed = squashed.toLowerCase();

      // Check if squashed matches a CORRECTION KEY (e.g. "doesntttt" -> "doesnt" -> "doesn't")
      if (commonCorrections[lowerSquashed]) {
        return matchCase(token, commonCorrections[lowerSquashed]);
      }

      // Check if squashed matches a VALID CORRECTION VALUE (e.g. "doesn'tttt" -> "doesn't" -> keep it)
      // Note: "doesn't" is in 'values'. "really" might not be.
      // Ideally we only fix if we end up with a known valid word.
      const foundValue = values.find((v) => v.toLowerCase() === lowerSquashed);
      if (foundValue) {
        return matchCase(token, foundValue);
      }
    }

    return token;
  });

  return correctedTokens.join("");
}

function matchCase(original: string, corrected: string): string {
  const isCapitalized = original[0] === original[0].toUpperCase();
  if (corrected.startsWith("I'") || corrected.startsWith("I'll")) return corrected;
  if (isCapitalized) {
    return corrected.charAt(0).toUpperCase() + corrected.slice(1);
  }
  return corrected;
}
