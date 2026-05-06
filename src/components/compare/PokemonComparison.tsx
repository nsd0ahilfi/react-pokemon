import { useDispatch, useSelector } from "react-redux";
import { useTranslation } from "react-i18next";
import { useNavigate } from "react-router-dom";
import { useEffect, useState } from "react";

import {
  type PokemonState,
  updatePokemonsToCompare,
} from "../../store/pokemon-slice.ts";
import type { Pokemon, PokemonOverview } from "../../models";
import PokemonCard from "../pokemon-card/PokemonCard.tsx";
import "./PokemonComparison.css";

interface PokemonMinMaxStats {
  height: { min: number; max: number };
  weight: { min: number; max: number };
  base_experience: { min: number; max: number };
}

const INITIAL_COMPARISON_MINMAX_STATS: PokemonMinMaxStats = {
  height: { min: Infinity, max: -Infinity },
  weight: { min: Infinity, max: -Infinity },
  base_experience: { min: Infinity, max: -Infinity },
};

export default function PokemonComparison() {
  const pokemons: PokemonOverview[] = useSelector(
    (state: { pokedex: PokemonState }) => state.pokedex.pokemonsToCompare,
  );
  const { t } = useTranslation();
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const [pokemonMaxMinStats, setPokemonMaxMinStats] =
    useState<PokemonMinMaxStats>(INITIAL_COMPARISON_MINMAX_STATS);

  useEffect(() => {
    const newStats: PokemonMinMaxStats = structuredClone(
      INITIAL_COMPARISON_MINMAX_STATS,
    );

    ["height", "weight", "base_experience"].forEach((key) => {
      pokemons.forEach((pokemon: PokemonOverview) => {
        const value = pokemon[key as keyof typeof pokemon] as number;
        if (value) {
          newStats[key as keyof PokemonMinMaxStats].min = Math.min(
            newStats[key as keyof PokemonMinMaxStats].min,
            value,
          );
          newStats[key as keyof PokemonMinMaxStats].max = Math.max(
            newStats[key as keyof PokemonMinMaxStats].max,
            value,
          );
        }
      });
    });

    setPokemonMaxMinStats(newStats);
  }, [pokemons]);

  function onRemovePokemon(
    event: React.MouseEvent<HTMLImageElement>,
    pokemon: Pokemon,
  ): void {
    event.preventDefault();
    event.stopPropagation();

    dispatch(updatePokemonsToCompare({ pokemon, add: false }));
  }

  return (
    <div className="c-pokemon-comparison mt-4 pr-4 flex flex-col">
      <h1 className="my-4">{t("pokemonCompare")}</h1>
      <div className="c-pokemon-comparison__container h-[calc(100vh-200px)] overflow-y-auto">
        <ul className="c-pokemon-list c-pokemon-comparison__container grid grid-cols-2 gap-8 mr-4">
          {pokemons.map((pokemon: Pokemon, index) => (
            <li
              onClick={() => navigate(`/pokemon/${pokemon.id}`)}
              className="c-pokemon-comparison__card flex justify-center relative cursor-pointer bg-white/90 overflow-hidden rounded-3xl"
              key={"card-" + index}
            >
              <div className="w-[190px]">
                <PokemonCard pokemon={pokemon} key={`${pokemon.id}-${index}`} />
              </div>
              <div className="grid grid-cols-[2fr_1fr] col-span-2 gap-y-[4px] [grid-auto-rows:minmax(16px,auto)] mt-2 p-2 w-full overflow-hidden">
                <span
                  className={`h-6 pl-2 rounded-tl-lg rounded-bl-lg ${pokemon.base_experience === pokemonMaxMinStats.base_experience.min ? "bg-red-300" : ""} ${pokemon.base_experience === pokemonMaxMinStats.base_experience.max ? "bg-green-300" : ""}`}
                >
                  {t("baseExperience")}:
                </span>
                <span
                  className={`h-6 rounded-tr-lg rounded-br-lg ${pokemon.base_experience === pokemonMaxMinStats.base_experience.min ? "bg-red-300" : ""} ${pokemon.base_experience === pokemonMaxMinStats.base_experience.max ? "bg-green-300" : ""}`}
                >
                  {pokemon?.base_experience}
                </span>
                {pokemon?.height && (
                  <>
                    <span
                      className={`h-6 pl-2 rounded-tl-lg rounded-bl-lg ${pokemon.height === pokemonMaxMinStats.height.min ? "bg-red-300" : ""} ${pokemon.height === pokemonMaxMinStats.height.max ? "bg-green-300" : ""}`}
                    >
                      {t("size")}:
                    </span>
                    <span
                      className={`h-6 rounded-tr-lg rounded-br-lg ${pokemon.height === pokemonMaxMinStats.height.min ? "bg-red-300" : ""} ${pokemon.height === pokemonMaxMinStats.height.max ? "bg-green-300" : ""}`}
                    >
                      {t("sizeValue", { unit: pokemon.height / 10 })}
                    </span>
                  </>
                )}
                {pokemon?.weight && (
                  <>
                    <span
                      className={`h-6 pl-2 rounded-tl-lg rounded-bl-lg ${pokemon.weight === pokemonMaxMinStats.weight.min ? "bg-red-300" : ""} ${pokemon.weight === pokemonMaxMinStats.weight.max ? "bg-green-300" : ""}`}
                    >
                      {t("weight")}:
                    </span>
                    <span
                      className={`h-6 rounded-tr-lg rounded-br-lg ${pokemon.weight === pokemonMaxMinStats.weight.min ? "bg-red-300" : ""} ${pokemon.weight === pokemonMaxMinStats.weight.max ? "bg-green-300" : ""}`}
                    >
                      {t("weightValue", { unit: pokemon.weight / 10 })}
                    </span>
                  </>
                )}
                {pokemon?.types?.length && (
                  <>
                    <p className="h-6 pl-2">{t("types")}</p>
                    <div>
                      {pokemon.types.map((type, index) => (
                        <p className="h-6 capitalize" key={index}>
                          {type}
                        </p>
                      ))}
                    </div>
                  </>
                )}
                {pokemon?.types?.length && (
                  <>
                    <p className="h-6 pl-2">{t("abilities")}</p>
                    <p className="h-6">{pokemon.abilities?.length}</p>
                  </>
                )}
              </div>
              <img
                src="/src/assets/delete.png"
                alt="select all"
                className="c-pokemon-list_select-all-icon cursor-pointer absolute right-[16px] bottom-[12px] w-[24px]"
                onClick={(e) => onRemovePokemon(e, pokemon)}
              />
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
}
