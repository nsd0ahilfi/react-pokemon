import { useEffect, useRef, useState } from "react";
import { useForm } from "react-hook-form";
import { yupResolver } from "@hookform/resolvers/yup";
import * as yup from "yup";
import { useTranslation } from "react-i18next";

import PokemonResult from "./search-result/PokemonResult.tsx";
import { useGetAllPokemonNamesQuery } from "../../services/api/pokemonApi.ts";
import "./Search.css";

interface IFormInput {
  searchTerm: string;
}

const schema = yup.object().shape({
  searchTerm: yup
    .string()
    .required("Das ist ein Pflichtfeld!")
    .matches(/^[a-zA-Z0-9-]+$/, {
      message: "Nur Buchstaben, Zahlen und Bindestriche sind erlaubt!",
      excludeEmptyString: true,
    }),
});

export default function Search() {
  const [searchTerm, setSearchTerm] = useState<string>();
  const { t } = useTranslation();
  const {
    register,
    handleSubmit,
    formState: { errors },
    setValue,
  } = useForm<IFormInput>({
    defaultValues: {
      searchTerm: "",
    },
    resolver: yupResolver(schema),
  });
  const { data: getAllPokemonNames } = useGetAllPokemonNamesQuery();
  const [autoCompleteMatches, setAutoCompleteMatches] = useState<string[]>([]);
  const [highlightIndex, setHighlightIndex] = useState<number>(-1);
  const itemRefs = useRef<Array<HTMLElement | null>>([]);

  function getAutocompleteMatch(input: string) {
    const pokemons = getAllPokemonNames ?? [];

    if (input.length <= 2) {
      setAutoCompleteMatches([]);
    } else {
      setAutoCompleteMatches(
        pokemons.filter((pokemon) =>
          pokemon.toLowerCase().includes(input.toLowerCase()),
        ),
      );
    }
  }

  function onSubmit(data: IFormInput) {
    setSearchTerm(data.searchTerm);
    setAutoCompleteMatches([]);
  }

  function setInputValue(value: string): void {
    setValue("searchTerm", value, { shouldValidate: true });
  }

  function handleKeyboardEvent(event: React.KeyboardEvent<HTMLInputElement>) {
    if (autoCompleteMatches.length === 0) return;

    if (event.key === "ArrowDown") {
      event.preventDefault();
      setHighlightIndex((prev) =>
        prev < autoCompleteMatches.length - 1 ? prev + 1 : 0,
      );
    } else if (event.key === "ArrowUp") {
      event.preventDefault();
      setHighlightIndex((prev) =>
        prev > 0 ? prev - 1 : autoCompleteMatches.length - 1,
      );
    } else if (event.key === "Enter" && highlightIndex >= 0) {
      event.preventDefault();
      const chosen = autoCompleteMatches[highlightIndex];
      setAutoCompleteMatches([]);
      setInputValue(chosen);
    }
  }

  useEffect(() => {
    if (
      highlightIndex >= 0 &&
      itemRefs.current[highlightIndex]?.scrollIntoView
    ) {
      itemRefs.current[highlightIndex]?.scrollIntoView({
        block: "nearest",
        behavior: "smooth",
      });
    }
  }, [highlightIndex]);

  return (
    <section className="c-pokemon-search relative">
      <form className="c-search pb-4" onSubmit={handleSubmit(onSubmit)}>
        <div className="flex gap-5 justify-between">
          <input
            {...register("searchTerm", {
              pattern: /^[a-zA-Z0-9-]+$/,
              required: t("requiredField"),
            })}
            className="c-search__searchbar bg-white/90 w-full px-4 py-2 border border-gray-600 text-gray-800 rounded-xl shadow-sm focus:outline-none focus:ring-2 focus:ring-gray-500 focus:border-transparent"
            placeholder={t("pokemonNameOrId")}
            onChange={(e) => getAutocompleteMatch(e.target.value)}
            onKeyDown={(e) => handleKeyboardEvent(e)}
            autoComplete="off"
            data-testid="search-input"
          />
          <button
            type="submit"
            className="min-w-[200px] border-cyan-600 bg-cyan-900/90 text-white font-semibold border cursor-pointer rounded-xl shadow-sm hover:outline-none hover:ring-2 hover:ring-cyan-600"
          >
            {t("findPokemon")}
          </button>
        </div>
        {errors.searchTerm && (
          <p className="mt-2 text-red-800 rounded-lg px-4 bg-white/70 inline-block">
            {errors.searchTerm.message}
          </p>
        )}
      </form>
      {autoCompleteMatches.length > 0 && (
        <div className="bg-white/90 p-2 border border-gray-600 rounded-xl max-w-6xl w-full min-h-[100px] shadow-sm absolute z-300 top-[48px]">
          <div className="c-search__autocomplete max-h-60 overflow-y-auto">
            <ul>
              {autoCompleteMatches.map((match, index) => (
                <li
                  key={match}
                  ref={(el) => {
                    itemRefs.current[index] = el;
                  }}
                  className={`px-4 py-2 hover:bg-cyan-900/10 cursor-pointer capitalize ${
                    index === highlightIndex
                      ? "bg-cyan-900/20"
                      : "hover:bg-cyan-900/10"
                  }`}
                  onMouseEnter={() => setHighlightIndex(index)}
                  onClick={() => {
                    setAutoCompleteMatches([]);
                    setInputValue(match);
                  }}
                >
                  {match}
                </li>
              ))}
            </ul>
          </div>
        </div>
      )}
      {searchTerm && <PokemonResult searchTerm={searchTerm} />}
    </section>
  );
}
