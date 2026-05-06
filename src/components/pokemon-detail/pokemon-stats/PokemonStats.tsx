import { useTranslation } from "react-i18next";

import type { Pokemon } from "../../../models";

export default function PokemonStats(props: { pokemon: Pokemon }) {
  const { t } = useTranslation();
  const maxStats = {
    hp: 255,
    attack: 181,
    defense: 230,
    specialAttack: 180,
    specialDefense: 230,
    speed: 180,
  };

  return (
    <div className="flex flex-col gap-4 pl-10 pb-8">
      {(Object.keys(maxStats) as (keyof typeof maxStats)[]).map(
        (key, index) => {
          return (
            <li
              key={index}
              className="grid grid-cols-[1fr_3fr] gap-4 items-center"
            >
              <p className="text-cyan-900 font-bold">{t(key)}</p>
              <div className="w-full bg-gray-200 rounded-full h-4">
                <div
                  className="bg-cyan-900/85  h-4 rounded-full transition-all duration-300 flex pl-2"
                  style={{
                    width: `${((props.pokemon?.stats?.[key] ?? 0) / maxStats[key]) * 100}%`,
                  }}
                >
                  <small className="h-[17px] flex items-end mt-[1px]">
                    {props.pokemon?.stats?.[key]}
                  </small>
                </div>
              </div>
            </li>
          );
        },
      )}
    </div>
  );
}
