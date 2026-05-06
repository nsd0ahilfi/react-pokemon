import { useState, useRef, useEffect, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { useLazyGetPokemonQuery } from "../../services/api/pokemonApi";
import {
  chatWithOllama,
  extractSearchTerms,
  cleanBotMessage,
  pokemonToContext,
  checkOllamaConnection,
  type OllamaMessage,
} from "../../services/ollama/ollamaService";
import type { Pokemon } from "../../models";
import ashImg from "../../assets/ash.png";
import "./PokemonChatbot.css";

interface ChatMessage {
  role: "bot" | "user";
  text: string;
  pokemons?: Pokemon[];
  isStreaming?: boolean;
}

function getRandomPokemonId(): number {
  return Math.floor(Math.random() * 1025) + 1;
}

export default function PokemonChatbot() {
  const { t } = useTranslation();
  const [open, setOpen] = useState(false);
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [ollamaHistory, setOllamaHistory] = useState<OllamaMessage[]>([]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [connected, setConnected] = useState<boolean | null>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const abortRef = useRef<AbortController | null>(null);
  const navigate = useNavigate();
  const [triggerGetPokemon] = useLazyGetPokemonQuery();

  // Prüfe Ollama-Verbindung beim Öffnen
  useEffect(() => {
    if (open && connected === null) {
      checkOllamaConnection().then((ok) => {
        setConnected(ok);
        setMessages([
          {
            role: "bot",
            text: ok
              ? t("chatbot.welcome")
              : t("chatbot.ollamaNotReachable"),
          },
        ]);
      });
    }
  }, [open, connected, t]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const fetchPokemon = useCallback(
    async (name: string): Promise<Pokemon | null> => {
      try {
        const searchTerm =
          name === "random" ? String(getRandomPokemonId()) : name;
        return await triggerGetPokemon([searchTerm, false]).unwrap();
      } catch {
        return null;
      }
    },
    [triggerGetPokemon],
  );

  const handleSend = async () => {
    const trimmed = input.trim();
    if (!trimmed || loading || !connected) return;

    const userMessage: ChatMessage = { role: "user", text: trimmed };
    setMessages((prev) => [...prev, userMessage]);
    setInput("");
    setLoading(true);

    const newHistory: OllamaMessage[] = [
      ...ollamaHistory,
      { role: "user", content: trimmed },
    ];

    const streamingMsg: ChatMessage = {
      role: "bot",
      text: t("chatbot.thinking"),
      isStreaming: true,
    };
    setMessages((prev) => [...prev, streamingMsg]);

    try {
      abortRef.current = new AbortController();

      const fullResponse = await chatWithOllama(
        newHistory,
        (partialText) => {
          setMessages((prev) => {
            const updated = [...prev];
            const lastIdx = updated.length - 1;
            if (updated[lastIdx]?.isStreaming) {
              updated[lastIdx] = {
                ...updated[lastIdx],
                text: cleanBotMessage(partialText) || t("chatbot.thinking"),
              };
            }
            return updated;
          });
        },
        abortRef.current.signal,
      );

      const searchTerms = extractSearchTerms(fullResponse);
      let foundPokemons: Pokemon[] = [];

      if (searchTerms.length > 0) {
        const results = await Promise.all(
          searchTerms.map((term) => fetchPokemon(term)),
        );
        foundPokemons = results.filter((p): p is Pokemon => p !== null);

        if (foundPokemons.length > 0) {
          const pokemonContext = foundPokemons
            .map((p) => pokemonToContext(p))
            .join("\n---\n");

          const contextHistory: OllamaMessage[] = [
            ...newHistory,
            { role: "assistant", content: fullResponse },
            {
              role: "user",
              content: t("chatbot.pokemonContextPrompt", { context: pokemonContext }),
            },
          ];

          const informedResponse = await chatWithOllama(
            contextHistory,
            (partialText) => {
              setMessages((prev) => {
                const updated = [...prev];
                const lastIdx = updated.length - 1;
                if (updated[lastIdx]?.isStreaming) {
                  updated[lastIdx] = {
                    ...updated[lastIdx],
                    text: cleanBotMessage(partialText) || t("chatbot.thinking"),
                  };
                }
                return updated;
              });
            },
            abortRef.current.signal,
          );

          setMessages((prev) => {
            const updated = [...prev];
            const lastIdx = updated.length - 1;
            updated[lastIdx] = {
              role: "bot",
              text: cleanBotMessage(informedResponse),
              pokemons: foundPokemons,
              isStreaming: false,
            };
            return updated;
          });

          setOllamaHistory([
            ...newHistory,
            { role: "assistant", content: informedResponse },
          ]);
        } else {
          setMessages((prev) => {
            const updated = [...prev];
            const lastIdx = updated.length - 1;
            updated[lastIdx] = {
              role: "bot",
              text:
                cleanBotMessage(fullResponse) +
                t("chatbot.pokemonDataNotLoaded"),
              isStreaming: false,
            };
            return updated;
          });
          setOllamaHistory([
            ...newHistory,
            { role: "assistant", content: fullResponse },
          ]);
        }
      } else {
        setMessages((prev) => {
          const updated = [...prev];
          const lastIdx = updated.length - 1;
          updated[lastIdx] = {
            role: "bot",
            text: cleanBotMessage(fullResponse),
            isStreaming: false,
          };
          return updated;
        });
        setOllamaHistory([
          ...newHistory,
          { role: "assistant", content: fullResponse },
        ]);
      }
    } catch (err) {
      const isAbort = err instanceof DOMException && err.name === "AbortError";
      setMessages((prev) => {
        const updated = [...prev];
        const lastIdx = updated.length - 1;
        updated[lastIdx] = {
          role: "bot",
          text: isAbort
            ? t("chatbot.aborted")
            : t("chatbot.communicationError"),
          isStreaming: false,
        };
        return updated;
      });
    } finally {
      setLoading(false);
      abortRef.current = null;
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter") handleSend();
  };

  const handleStop = () => {
    abortRef.current?.abort();
  };

  return (
    <>
      <button
        className="chatbot-toggle"
        onClick={() => setOpen(!open)}
        title={t("chatbot.toggleTitle")}
      >
        <img src={ashImg} alt="Chatbot" />
      </button>

      {open && (
        <div className="chatbot-panel">
          <div className="chatbot-header">
            <img src={ashImg} alt="" width={20} height={20} />
            {t("chatbot.title")}
            <span style={{ marginLeft: "auto", fontSize: 10, opacity: 0.7 }}>
              {connected ? `🟢 ${t("chatbot.online")}` : `🔴 ${t("chatbot.offline")}`}
            </span>
          </div>

          <div className="chatbot-messages">
            {messages.map((msg, i) => (
              <div key={i}>
                <div className={`chat-msg ${msg.role}`}>
                  {msg.text.split("\n").map((line, j) => (
                    <div key={j}>{line || <br />}</div>
                  ))}
                </div>
                {msg.pokemons?.map((pokemon) => (
                  <div
                    key={pokemon.id}
                    className="chat-pokemon-card"
                    onClick={() => {
                      navigate(`/pokemon/${pokemon.id}`);
                      setOpen(false);
                    }}
                  >
                    <img
                      src={pokemon.sprites?.front_default}
                      alt={pokemon.name}
                    />
                    <div className="info">
                      <div className="name">
                        #{pokemon.id} {pokemon.name}
                      </div>
                      <div>
                        {pokemon.types?.join(", ")} | HP: {pokemon.stats?.hp} |
                        ATK: {pokemon.stats?.attack} | SPD:{" "}
                        {pokemon.stats?.speed}
                      </div>
                      <div style={{ fontSize: 11, color: "#999" }}>
                        {t("chatbot.clickForDetails")}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            ))}
            <div ref={messagesEndRef} />
          </div>

          <div className="chatbot-input">
            <input
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder={
                !connected
                  ? t("chatbot.placeholderDisconnected")
                  : loading
                    ? t("chatbot.placeholderLoading")
                    : t("chatbot.placeholderDefault")
              }
              disabled={loading || !connected}
            />
            {loading ? (
              <button onClick={handleStop} title={t("chatbot.stop")}>
                ⏹
              </button>
            ) : (
              <button onClick={handleSend} disabled={!connected}>
                ▶
              </button>
            )}
          </div>
        </div>
      )}
    </>
  );
}
