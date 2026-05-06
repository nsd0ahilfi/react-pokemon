import { useTranslation } from "react-i18next";
import { useSelector } from "react-redux";

import { useGetPokemonQuery } from "../../../services/api/pokemonApi.ts";
import PokemonCard from "../../pokemon-card/PokemonCard.tsx";
import "./SearchResult.css";
import type { PokemonState } from "../../../store/pokemon-slice.ts";
import pokeballIcon from "../../../assets/pokeball.png";

interface PokemonResultProps {
  searchTerm: string;
}

export default function PokemonResult(props: PokemonResultProps) {
  const { t } = useTranslation();
  const {
    data: pokemon,
    isFetching,
    isError,
  } = useGetPokemonQuery([props.searchTerm, false]);
  const selectionToggle = useSelector(
    (state: { pokedex: PokemonState }) => state.pokedex.compareSelectionToggle,
  );
  const pokemonsToCompare = useSelector(
    (state: { pokedex: PokemonState }) => state.pokedex.pokemonsToCompare,
  );

  const pokemonToCompareSelected = Boolean(
    pokemonsToCompare.find((p) => p.id === pokemon?.id),
  );

  if (isFetching) {
    return (
      <ul className="c-pokemon-list grid grid-cols-5 gap-10 pb-6">
        <img
          src={pokeballIcon}
          alt="loading"
          className="c-search-result__loading-img"
        />
      </ul>
    );
  } else if (isError) {
    return (
      <div className="py-4">
        <h4 className="p-4 bg-white/30 text-gray-900 rounded-lg">
          {t("pokemonNotFound")}
        </h4>
      </div>
    );
  }

  return (
    <ul className="c-pokemon-list grid grid-cols-5 gap-10 pb-6">
      {pokemon && (
        <PokemonCard
          pokemon={pokemon}
          startSelection={selectionToggle}
          selected={pokemonToCompareSelected}
        />
      )}
    </ul>
  );
}
