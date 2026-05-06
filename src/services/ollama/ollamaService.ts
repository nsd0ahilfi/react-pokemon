import type { Pokemon } from "../../models";

const OLLAMA_URL = "/ollama/api/chat";
const MODEL = "llama3.2";

export interface OllamaMessage {
  role: "system" | "user" | "assistant";
  content: string;
}

const SYSTEM_PROMPT = `Du bist ein freundlicher Pokémon-Experte und Assistent in einem Pokédex.
Du sprichst Deutsch und hilfst dem Nutzer, Pokémon zu finden und ihre Werte zu verstehen.

Wenn der Nutzer nach einem bestimmten Pokémon fragt, antworte mit dem englischen Pokémon-Namen
in diesem exakten Format irgendwo in deiner Antwort: [SEARCH:pokemonname]
Beispiel: "Klar, ich suche Pikachu für dich! [SEARCH:pikachu]"

Wenn der Nutzer ein zufälliges Pokémon möchte, antworte mit: [SEARCH:random]

Wenn der Nutzer nach mehreren Pokémon fragt, nutze mehrere [SEARCH:name] Tags.

Wenn Pokémon-Daten im Kontext stehen, nutze diese um detailliert über Stats, Typen,
Fähigkeiten etc. zu sprechen. Vergleiche Pokémon wenn der Nutzer das möchte.
Sei enthusiastisch und nutze Pokémon-Wissen!

Wenn der Nutzer NICHT nach einem Pokémon fragt sondern einfach chattet, antworte normal
ohne SEARCH-Tags.`;

/**
 * Sendet eine Nachricht an Ollama und streamt die Antwort.
 */
export async function chatWithOllama(
  messages: OllamaMessage[],
  onChunk: (text: string) => void,
  signal?: AbortSignal,
): Promise<string> {
  const response = await fetch(OLLAMA_URL, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      model: MODEL,
      messages: [{ role: "system", content: SYSTEM_PROMPT }, ...messages],
      stream: true,
    }),
    signal,
  });

  if (!response.ok) {
    throw new Error(`Ollama-Fehler: ${response.status}`);
  }

  const reader = response.body?.getReader();
  if (!reader) throw new Error("Kein Stream verfügbar");

  const decoder = new TextDecoder();
  let fullText = "";

  while (true) {
    const { done, value } = await reader.read();
    if (done) break;

    const chunk = decoder.decode(value, { stream: true });
    // Ollama sendet JSON-Zeilen
    for (const line of chunk.split("\n").filter(Boolean)) {
      try {
        const parsed = JSON.parse(line);
        if (parsed.message?.content) {
          fullText += parsed.message.content;
          onChunk(fullText);
        }
      } catch {
        // Unvollständige JSON-Zeile, ignorieren
      }
    }
  }

  return fullText;
}

/**
 * Extrahiert [SEARCH:name] Tags aus der Bot-Antwort.
 */
export function extractSearchTerms(text: string): string[] {
  const matches = text.matchAll(/\[SEARCH:(\w[\w-]*)\]/gi);
  return [...matches].map((m) => m[1].toLowerCase());
}

/**
 * Entfernt [SEARCH:...] Tags aus dem angezeigten Text.
 */
export function cleanBotMessage(text: string): string {
  return text.replace(/\[SEARCH:\w[\w-]*\]/gi, "").trim();
}

/**
 * Formatiert Pokémon-Daten als Kontext für Ollama.
 */
export function pokemonToContext(pokemon: Pokemon): string {
  const parts = [
    `Name: ${pokemon.name}`,
    `ID: #${pokemon.id}`,
    pokemon.types?.length ? `Typen: ${pokemon.types.join(", ")}` : null,
    pokemon.height ? `Größe: ${pokemon.height / 10}m` : null,
    pokemon.weight ? `Gewicht: ${pokemon.weight / 10}kg` : null,
    pokemon.base_experience
      ? `Basis-Erfahrung: ${pokemon.base_experience}`
      : null,
    pokemon.habitat ? `Habitat: ${pokemon.habitat}` : null,
    pokemon.description ? `Beschreibung: ${pokemon.description}` : null,
    pokemon.stats
      ? `Stats: HP=${pokemon.stats.hp}, Angriff=${pokemon.stats.attack}, Verteidigung=${pokemon.stats.defense}, Spezial-Angriff=${pokemon.stats.specialAttack}, Spezial-Verteidigung=${pokemon.stats.specialDefense}, Speed=${pokemon.stats.speed}`
      : null,
    pokemon.heldItems?.length
      ? `Items: ${pokemon.heldItems.map((i) => i.name).join(", ")}`
      : null,
  ];
  return parts.filter(Boolean).join("\n");
}

/**
 * Prüft ob Ollama erreichbar ist.
 */
export async function checkOllamaConnection(): Promise<boolean> {
  try {
    const res = await fetch("/ollama/api/tags", {
      signal: AbortSignal.timeout(3000),
    });
    return res.ok;
  } catch {
    return false;
  }
}

