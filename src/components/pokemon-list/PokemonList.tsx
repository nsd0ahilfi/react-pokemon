import { useEffect, useMemo, useState } from "react";
import { useTranslation } from "react-i18next";
import { useNavigate, useSearchParams } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";

import { useGetPokemonPageQuery } from "../../services/api/pokemonApi.ts";
import type { PokemonOverview } from "../../models";
import "./PokemonList.css";
import PokemonCard from "../pokemon-card/PokemonCard.tsx";
import {
  type PokemonState,
  resetPokemonsToCompare,
  setPokemonsToCompare,
  toggleCompareSelection,
} from "../../store/pokemon-slice.ts";

export default function PokemonList() {
  const [page, setPage] = useState(0);
  const { t } = useTranslation();
  const limit = 10;
  const offset = page * limit;
  const [pokemons, setPokemons] = useState<PokemonOverview[]>([]);
  const { data: pokemonData, isFetching } = useGetPokemonPageQuery({
    offset,
    limit,
  });
  const selectionToggle = useSelector(
    (state: { pokedex: PokemonState }) => state.pokedex.compareSelectionToggle,
  );
  const pokemonsToCompare = useSelector(
    (state: { pokedex: PokemonState }) => state.pokedex.pokemonsToCompare,
  );
  const dispatch = useDispatch();
  const compareBtnDisabled = pokemonsToCompare.length < 2;
  const navigate = useNavigate();
  const [selectAll, setSelectAll] = useState<boolean>(false);
  const [sortAsc, setSortAsc] = useState<boolean | null>(null);
  const [sortById, setSortById] = useState<boolean>(true);
  const [searchParams, setSearchParams] = useSearchParams();
  const [lastSort, setLastSort] = useState<string>("");

  useEffect(() => {
    if (pokemonData) {
      setPokemons((prevPokemons) => [...prevPokemons, ...pokemonData]);
    }
  }, [pokemonData]);

  useEffect(() => {
    dispatch(resetPokemonsToCompare());
    dispatch(toggleCompareSelection(false));

    if (searchParams.get("sortAsc")) {
      setSortAsc(searchParams.get("sortAsc") === "true");
    }
  }, []);

  function onToggleSelection() {
    if (!selectionToggle) {
      setSelectAll(false);
    }

    dispatch(resetPokemonsToCompare());
    dispatch(toggleCompareSelection(!selectionToggle));
  }

  function onNavigateToCompare() {
    navigate("/compare");
  }

  const sortedPokemons = useMemo(() => {
    const searchParam = searchParams.get("sortAsc");
    const hasSortParam = searchParam !== null;

    if (lastSort === "numerical") {
      return [...pokemons].sort((a, b) => (sortById ? a.id - b.id : b.id - a.id));
    }

    if (lastSort === "alphabetical" || hasSortParam) {
      const asc = hasSortParam ? searchParam === "true" : sortAsc ?? true;
      return [...pokemons].sort(
        (a, b) => a.name.localeCompare(b.name) * (asc ? 1 : -1),
      );
    }

    return pokemons;
  }, [pokemons, lastSort, sortById, sortAsc, searchParams]);

  const selectedPokemonIds = useMemo(
    () => new Set(pokemonsToCompare.map((pokemon) => pokemon.id)),
    [pokemonsToCompare],
  );

  useEffect(() => {
    if (selectionToggle && selectAll) {
      dispatch(setPokemonsToCompare(sortedPokemons));
    }
  }, [selectionToggle, selectAll, sortedPokemons, dispatch]);

  function handleSelectAll() {
    const newSelectAll = !selectAll;

    if (newSelectAll) {
      dispatch(setPokemonsToCompare(sortedPokemons));
    } else {
      dispatch(setPokemonsToCompare([]));
    }

    setSelectAll(newSelectAll);
  }

  function sortAlphabetically(): void {
    const searchParam = searchParams.get("sortAsc");
    const hasSortParam = searchParam !== null;
    const nextSortAsc = !hasSortParam ? true : !(sortAsc ?? (searchParam === "true"));

    setSortAsc(nextSortAsc);
    setLastSort("alphabetical");

    const nextSearchParams = new URLSearchParams(searchParams);
    nextSearchParams.set("sortAsc", nextSortAsc.toString());
    setSearchParams(nextSearchParams);
  }

  function sortNumerical(): void {
    setSortById((prev) => !prev);
    setLastSort("numerical");
  }

  return (
    <>
      <div
        className="c-pokemon-list__header flex justify-between"
        data-testid="pokemon-card"
      >
        <div className="flex mb-3 mt-5 gap-4 items-center">
          <h1 className="text-xl font-bold">{t("pokedex")}</h1>
          <img
            src={
              sortAsc ? "/src/assets/sort_a_z.png" : "src/assets/sort_z_a.png"
            }
            alt="select all"
            className="c-pokemon-list_select-all-icon w-[32px] h-[32px] mt-[8px] rounded-[4px] cursor-pointer"
            onClick={() => {
              sortAlphabetically();
            }}
          />
          <img
            src={
              sortById ? "/src/assets/sort_up.png" : "src/assets/sort_down.png"
            }
            alt="select all"
            className="c-pokemon-list_select-all-icon w-[32px] h-[32px] mt-[8px] rounded-[4px] cursor-pointer"
            onClick={() => sortNumerical()}
          />
        </div>
        <div className="flex gap-4">
          {selectionToggle && (
            <button
              disabled={compareBtnDisabled}
              className={`px-4 py-2 bg-white/90 font-bold self-start mt-[32px] border rounded-xl flex gap-1 
                ${compareBtnDisabled ? "border-gray-500 text-gray-500 cursor-not-allowed" : "border-cyan-900 text-cyan-900 hover:ring-cyan-900 cursor-pointer shadow-sm hover:outline-none hover:ring-2"}`}
              onClick={() => onNavigateToCompare()}
            >
              <img
                src="/src/assets/graph.png"
                alt="compare"
                className={`c-pokemon-list_compare-icon w-[24px] ${compareBtnDisabled ? "grayscale" : ""}`}
              />
              <span>{t("compare")}</span>
            </button>
          )}
          {selectionToggle && (
            <button
              className="px-4 py-2 bg-white/90 font-bold self-start mt-[32px] border rounded-xl flex gap-1 border-cyan-900 text-cyan-900 hover:ring-cyan-900 cursor-pointer shadow-sm hover:outline-none hover:ring-2"
              onClick={() => handleSelectAll()}
            >
              <img
                src={
                  selectAll
                    ? "/src/assets/delete.png"
                    : "src/assets/select-all.png"
                }
                alt="select all"
                className="c-pokemon-list_select-all-icon w-[24px]"
              />
              <span>{t(!selectAll ? "selectAll" : "deselectAll")}</span>
            </button>
          )}
          <button
            onClick={() => onToggleSelection()}
            disabled={isFetching}
            className="px-4 py-2 border-cyan-800 font-semibold self-start bg-white/90 mt-[32px] text-cyan-900 border
              cursor-pointer rounded-xl shadow-sm hover:outline-none hover:ring-2 hover:ring-cyan-800 flex gap-1"
          >
            <img
              src={
                selectionToggle
                  ? "/src/assets/unchecked.png"
                  : "/src/assets/checked.png"
              }
              alt="compare"
              className="c-pokemon-list_checkbox-icon w-[24px]"
            />
            <span>
              {t(!selectionToggle ? "startSelection" : "stopSelection")}
            </span>
          </button>
        </div>
      </div>
      <div className="c-pokemon-list__container flex-1 rounded-lg border overflow-y-auto pr-4 mb-6">
        <ul className="c-pokemon-list mt-6 grid grid-cols-5 gap-10 ml-4">
          {sortedPokemons.map((pokemon: PokemonOverview) => {
            const isSelected = selectedPokemonIds.has(pokemon.id);

            return (
              <PokemonCard
                pokemon={pokemon}
                startSelection={selectionToggle}
                selected={isSelected}
                key={pokemon.id}
              />
            );
          })}
        </ul>

        <button
          onClick={() => setPage((prev) => prev + 1)}
          disabled={isFetching}
          className="mt-8 ml-4 px-4 mb-4 py-2 border-cyan-800 font-semibold self-start bg-white/90 mt-[32px] text-cyan-900 border
              cursor-pointer rounded-xl shadow-sm hover:outline-none hover:ring-2 hover:ring-cyan-800 flex gap-1"
        >
          {isFetching ? t("loading") : t("showMore")}
        </button>
      </div>
    </>
  );
}
