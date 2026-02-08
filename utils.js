// Fallback words in case API fails
const fallbackWords = [
  "apple",
  "house",
  "water",
  "happy",
  "music",
  "flower",
  "bridge",
  "simple",
  "bright",
  "garden",
  "friend",
  "circle",
  "button",
  "dinner",
  "forest",
];

export async function getRandomWord() {
  try {
    // Wordnik API for random everyday words
    const response = await fetch(
      "https://api.wordnik.com/v4/words.json/randomWord?hasDictionaryDef=true&maxCorpusCount=-1&minDictionaryCount=1&maxDictionaryCount=-1&minLength=4&maxLength=10&api_key=a2a73e7b926c924fad7001ca3111acd55af2ffabf50eb4ae5",
    );

    if (!response.ok) {
      throw new Error("API request failed");
    }

    const data = await response.json();

    // Validate the word (simple everyday words only)
    if (data?.word && /^[a-zA-Z]+$/.test(data.word)) {
      return data.word.toLowerCase();
    } else {
      throw new Error("Invalid word received");
    }
  } catch (error) {
    console.warn("Failed to fetch word from API, using fallback:", error);
    // Use fallback words if API fails
    const randomIndex = Math.floor(Math.random() * fallbackWords.length);
    return fallbackWords[randomIndex];
  }
}

export function getFarewellText(support) {
  const options = [
    `${support} has failed!`,
    `${support} crumbles away...`,
    `R.I.P., ${support}`,
    `The ${support} couldn't hold!`,
    `Oh no, the ${support} snapped!`,
    `${support} gives way under pressure`,
    `${support} has been compromised`,
    `Critical failure: ${support}`,
    `${support} buckles under the stress`,
    `${support} breaks apart`,
    `Structural damage to ${support}`,
    `${support} collapses into the void`,
  ];

  const randomIndex = Math.floor(Math.random() * options.length);
  return options[randomIndex];
}
