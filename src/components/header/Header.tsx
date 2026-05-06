import { useDispatch, useSelector } from "react-redux";
import {
  type PokemonState,
  setPokeballList,
} from "../../store/pokemon-slice.ts";
import { useEffect, useState } from "react";
import PokemonBall from "../pokeball/PokemonBall.tsx";
import { useLazyGetPokemonQuery } from "../../services/api/pokemonApi.ts";
import { Link } from "react-router-dom";
import homeIcon from "../../assets/home.png";
import pokeballIcon from "../../assets/pokeball.png";

export default function Header() {
  const pokeballList = useSelector(
    (state: { pokedex: PokemonState }) => state.pokedex.pokeballList,
  );
  const [isPokeBallOpen, togglePokeBall] = useState(false);
  const [getLazyCatchedPokemon] = useLazyGetPokemonQuery();
  const dispatch = useDispatch();

  useEffect((): void => {
    const storedPokemons = JSON.parse(
      localStorage.getItem("catchedPokemons") ?? "[]",
    );

    if (pokeballList.length > 0 || storedPokemons.length === 0) {
      return;
    }

    Promise.all(
      storedPokemons.map((id: string) => {
        return getLazyCatchedPokemon([id, true]).unwrap();
      }),
    ).then((p) => dispatch(setPokeballList(p)));
  }, [pokeballList, getLazyCatchedPokemon, dispatch]);

  return (
    <div className="bg-white/90 h-[48px] mb-4">
      <div className="max-w-6xl m-auto flex justify-between items-center h-full">
        <Link to="/" className="flex cursor-pointer">
          <img
            src={homeIcon}
            alt="home"
            className="c-header__home w-[32px]"
          />
        </Link>
        <div
          className="flex cursor-pointer"
          onClick={() => togglePokeBall(pokeballList.length > 0)}
        >
          <img
            src={pokeballIcon}
            alt="pokeball"
            className="c-header__pokeball w-[32px]"
          />
          <span className="text-red-700 font-bold -mt-[4px] ml-[3px]">
            {pokeballList.length}
          </span>
        </div>
      </div>
      {isPokeBallOpen && (
        <PokemonBall closePokeball={() => togglePokeBall(false)} />
      )}
    </div>
  );
}
