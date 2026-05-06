import { useParams } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { useSelector, useDispatch } from "react-redux";
import { useState } from "react";
import { Helmet } from "react-helmet-async";

import { useGetPokemonQuery } from "../../services/api/pokemonApi.ts";
import pokeball from "../../assets/pokeball.png";
import PokemonBaseInfos from "./pokemon-base-infos/PokemonBaseInfos.tsx";
import PokemonStats from "./pokemon-stats/PokemonStats.tsx";
import { catchPokemon, type PokemonState } from "../../store/pokemon-slice.ts";
import "./PokemonDetail.css";

export default function PokemonDetail() {
  const { id } = useParams();
  const { t } = useTranslation();
  const {
    data: pokemon,
    isFetching,
    isError,
  } = useGetPokemonQuery([id ?? "", false], { skip: !id });
  const catchedPokemons = useSelector(
    (state: { pokedex: PokemonState }) => state.pokedex.pokeballList,
  );
  const dispatch = useDispatch();
  const [pokeballThrown, setPokeballThrown] = useState(false);

  function onCatchPokemon() {
    setPokeballThrown(true);

    if (pokemon?.id) {
      dispatch(catchPokemon(pokemon));
    }

    setTimeout(() => setPokeballThrown(false), 4000);
  }

  if (isFetching) {
    return (
      <div className="grid grid-cols-5 gap-10 pb-6 pt-20 place-items-center">
        <img
          src={pokeball}
          alt="loading"
          className="c-search-result__loading-img col-start-3"
        />
      </div>
    );
  } else if (isError) {
    return (
      <div className="py-15">
        <h4 className="p-4 bg-white/30 text-gray-900 rounded-lg">
          {t("pokemonNotFound")}
        </h4>
      </div>
    );
  }

  return (
    <>
      {pokemon && (
        <Helmet>
          <title>
            {" "}
            {`${pokemon.name.charAt(0).toUpperCase() + pokemon.name.slice(1)} – Pokédex`}
          </title>
          <meta
            name="description"
            content={`Alle Infos zu ${pokemon.name}: Werte, Typen und Attacken.`}
          />
          <meta property="og:title" content={`${pokemon.name} – Pokédex`} />
          <meta property="og:image" content={pokemon.sprites?.front_default} />
          <link rel="canonical" href={`/pokemon/${pokemon.id}`} />
        </Helmet>
      )}
      <div
        className={`flex justify-center items-center bg-red-900/30 fixed z-1000 flex justify-center items-center backdrop-blur-xs ${
          pokeballThrown ? "absolute left-0 top-0 w-full h-full " : "w-0 h-0"
        }`}
      >
        <div
          className={`c-pokemon-detail__pokeball ${
            pokeballThrown ? "c-pokemon-detail__pokeball--catch" : ""
          }`}
        />
      </div>
      <div className="bg-white/40 rounded-t-3xl mt-20 pr-4">
        <div className="grid grid-cols-[1fr_2fr] gap-6">
          <div className="flex flex-col justify-between rounded-3xl pt-4 bg-white/50 items-center gap-4">
            <div className="relative w-[300px] h-[300px]">
              <div className="border border-70 rounded-full w-[300px] h-[300px] absolute border-cyan-900/90"></div>
              <div className="w-[330px] h-[330px] top-[-15px] left-[-10px] absolute">
                <img
                  src={pokemon?.sprites?.front_default}
                  alt={pokemon?.name}
                  className="inline-block w-full absolute"
                />
              </div>
            </div>
            <h3 className="p-4 rounded-bl-3xl rounded-br-3xl bg-cyan-900/90 w-100 text-center capitalize">
              {pokemon?.name}
            </h3>
          </div>
          {pokemon && <PokemonBaseInfos pokemon={pokemon} />}
          <div className="text-cyan-900">
            <p className="rounded-t-3xl bg-white/50 p-4 h-full">
              {pokemon?.description}
            </p>
          </div>
          {pokemon && <PokemonStats pokemon={pokemon} />}
        </div>
      </div>
      <div>
        <button
          type="button"
          className="w-full border-cyan-600 bg-cyan-900/90 text-white font-semibold border cursor-pointer rounded-b-3xl
          disabled:bg-gray-400 disabled:border-0 disabled:cursor-not-allowed disabled:ring-0 shadow-sm hover:outline-none hover:ring-2 hover:ring-cyan-600 h-[48px]"
          disabled={catchedPokemons.some((p) => p.id === pokemon?.id)}
          onClick={onCatchPokemon}
        >
          {t("catchPokemon").toUpperCase()}
        </button>
      </div>
    </>
  );
}
