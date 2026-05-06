import { useDispatch, useSelector } from "react-redux";
import { Link } from "react-router-dom";
import { useTranslation } from "react-i18next";

import {
  type PokemonState,
  removeCatchedPokemon,
} from "../../store/pokemon-slice.ts";
import "./PokemonBall.css";
import type { Pokemon } from "../../models";
import pokeballIcon from "../../assets/pokeball.png";
import openPokeballIcon from "../../assets/open-pokeball.png";

interface ChildProps {
  closePokeball: () => void;
}

export default function PokemonBall({ closePokeball }: ChildProps) {
  const pokeballList = useSelector(
    (state: { pokedex: PokemonState }) => state.pokedex.pokeballList,
  );
  const dispatch = useDispatch();
  const { t } = useTranslation();

  function onRemoveCatchedPokemon(
    event: React.MouseEvent<HTMLDivElement>,
    id: number,
  ): void {
    event.preventDefault();
    event.stopPropagation();

    if (pokeballList.length === 1) {
      closePokeball();
    }

    dispatch(removeCatchedPokemon(id));
  }

  return (
    <div
      className="c-pokeball__backdrop h-[calc(100vh-48px)] w-full top-48px left-0 bg-red-900/30 fixed p-20 z-1000 flex justify-center items-center backdrop-blur-xs"
      data-testid="pokeball-modal"
    >
      <div className="p-3 rounded-3xl border border-cyan-800 rounded bg-white shadow flex flex-col text-cyan-900 absolute w-full max-w-xl -mt-[24px]">
        <div className="flex justify-between mb-4 pb-3 border-b border-cyan-800">
          <div className="flex gap-4 items-center">
            <img
              src={pokeballIcon}
              alt="pokeball"
              className="c-header__pokeball w-[32px]"
            />
            <h4 className="text-center">
              {pokeballList.length} {t("catchedPokemons")}
            </h4>
          </div>
          <button
            onClick={() => closePokeball()}
            className="
            w-8 h-8
            flex items-center justify-center
            bg-white
            border border-cyan-800
            rounded-md
            hover:bg-cyan-50
            focus:outline-none focus:ring-2 focus:ring-cyan-400
            transition-colors
            font-bold z-1000
            cursor-pointer"
            data-testid="close-pokeball-modal"
          >
            X
          </button>
        </div>
        <div className="c-pokeball__list max-h-[600px] overflow-y-auto">
          <ul className="flex flex-col gap-2 mr-2">
            {pokeballList.map((pokemon: Pokemon) => (
              <li key={pokemon.id}>
                <Link
                  to={`/pokemon/${pokemon.id}`}
                  className="flex gap-4 items-center border border-cyan-800 rounded p-2 pr-6 hover:bg-cyan-50"
                  onClick={() => closePokeball()}
                >
                  <div className="w-[50px] h-[50px] overflow-hidden">
                    <img
                      src={pokemon.sprites?.front_default}
                      alt="pokemon"
                      className="w-full h-full object-cover scale-115"
                    />
                  </div>
                  <h4 className="">
                    <strong>#{pokemon.id}</strong> {pokemon.name}
                  </h4>
                  <div
                    className="ml-auto"
                    onClick={(e) => onRemoveCatchedPokemon(e, pokemon.id)}
                  >
                    <img
                      src={openPokeballIcon}
                      alt="release pokemon"
                      className="w-[25px]"
                    />
                  </div>
                </Link>
              </li>
            ))}
          </ul>
        </div>
      </div>
    </div>
  );
}
