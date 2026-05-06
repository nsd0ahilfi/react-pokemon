import { Link } from "react-router-dom";
import { useDispatch } from "react-redux";
import { useEffect, useState } from "react";

import "./PokemonCard.css";
import type { PokemonOverview } from "../../models";
import { updatePokemonsToCompare } from "../../store/pokemon-slice.ts";

interface PokemonCardProps {
  pokemon: PokemonOverview;
  startSelection?: boolean;
  selected?: boolean;
}

export default function PokemonCard(props: PokemonCardProps) {
  const dispatch = useDispatch();
  const [isSelected, setIsSelected] = useState(false);

  function onSelectCard(event?: React.MouseEvent<HTMLAnchorElement>): void {
    if (props.startSelection) {
      event?.preventDefault();
      event?.stopPropagation();

      const newSelectedStatus = !isSelected;
      setIsSelected(newSelectedStatus);

      dispatch(
        updatePokemonsToCompare({
          pokemon: props.pokemon,
          add: newSelectedStatus,
        }),
      );
    }
  }

  useEffect(() => {
    if (!props.startSelection) {
      setIsSelected(false);
    } else {
      setIsSelected(!!props.selected);
    }
  }, [props.startSelection, props.selected]);

  return (
    <div
      key={props.pokemon.id}
      className={`c-pokemon-card flex flex-col p-3 rounded-3xl border border-cyan-800 rounded shadow ${
        props.startSelection && isSelected ? "c-pokemon-card--selected" : ""
      } ${props.startSelection ? "c-pokemon-card--selection-started" : ""}`}
    >
      <Link
        to={`/pokemon/${props.pokemon.id}`}
        onClick={(e) => onSelectCard(e)}
        className="flex flex-col justify-between gap-4"
      >
        <h4 className="c-pokemon-card__title">
          <strong>#{props.pokemon.id}</strong> {props.pokemon.name}
        </h4>
        <div className="flex justify-center relative">
          <img
            src={props.pokemon.sprites?.front_default}
            alt={props.pokemon.name}
            className="inline-block w-full absolute"
          />
          <div className="c-pokemon-card__circle border border-4 rounded-full min-w-[160px] min-h-[160px]"></div>
        </div>
      </Link>
    </div>
  );
}
