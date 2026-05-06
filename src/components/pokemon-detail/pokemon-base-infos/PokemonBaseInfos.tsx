import { useTranslation } from "react-i18next";
import { useEffect, useState } from "react";

import type { Pokemon, PokemonAbility } from "../../../models";
import { useLazyGetPokemonAbilityQuery } from "../../../services/api/pokemonApi.ts";
import { PokemonTooltip } from "../../shared";

export default function PokemonBaseInfos(props: { pokemon: Pokemon }) {
  const [pokemon] = useState<Pokemon>(props.pokemon);
  const { t } = useTranslation();
  const [abilities, setAbilities] = useState<PokemonAbility[]>([]);
  const [triggerAbility] = useLazyGetPokemonAbilityQuery();

  useEffect(() => {
    if (!props.pokemon?.abilities) return;
    Promise.all(
      props.pokemon.abilities.map((id: string) => {
        return triggerAbility(id).unwrap();
      }),
    ).then(setAbilities);
  }, [props.pokemon, triggerAbility]);

  return (
    <div className="grid grid-cols-5 grid-rows-2 gap-x-6 gap-y-4 text-cyan-900 pt-10 pl-10">
      <div className="grid grid-cols-[2fr_1fr] col-span-2 gap-y-[4px] auto-rows-[24px]">
        <h4 className="col-span-full">{t("baseInfo")}</h4>
        <span>{t("baseExperience")}:</span>
        <span>{pokemon?.base_experience}</span>
        {pokemon?.height && (
          <>
            <span>{t("size")}:</span>
            <span>{t("sizeValue", { unit: pokemon.height / 10 })}</span>
          </>
        )}
        {pokemon?.weight && (
          <>
            <span>{t("weight")}:</span>
            <span>{t("weightValue", { unit: pokemon.weight / 10 })}</span>
          </>
        )}
      </div>
      <div className="flex flex-col gap-[4px]">
        <h4 className="mb-[4px]">{t("abilities")}</h4>
        {abilities?.map((ability: PokemonAbility) => (
          <PokemonTooltip
            key={ability.name}
            text={ability.name}
            tooltipText={ability.effect}
          />
        ))}
      </div>
      {pokemon?.types?.length && (
        <div>
          <h4 className="mb-[4px]">{t("types")}</h4>
          {pokemon.types.map((type, index) => (
            <p key={index}>{type}</p>
          ))}
        </div>
      )}
      <div>
        <h4 className="mb-[4px]">{t("habitat")}</h4>
        <p className="capitalize">{pokemon?.habitat}</p>
      </div>
      {pokemon?.heldItems && pokemon.heldItems.length > 0 && (
        <div>
          <h4 className="mb-[4px]">{t("heldItems")}</h4>
          <ul>
            {pokemon.heldItems?.map((item, index) => (
              <li key={item.name + index} className="flex gap-2 capitalize">
                <img
                  src={item.img}
                  alt={item.name}
                  className="inline-block w-6 h-6 mr-2"
                />
                <PokemonTooltip
                  key={item.name}
                  text={item.name}
                  tooltipText={item.description}
                />
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
}
