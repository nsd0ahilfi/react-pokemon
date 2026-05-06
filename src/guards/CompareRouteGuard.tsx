import { Navigate } from "react-router-dom";
import { useSelector } from "react-redux";
import type { ReactNode } from "react";

import type { PokemonState } from "../store/pokemon-slice.ts";

type CompareRouteAuthProps = {
  children: ReactNode;
};

export function CompareRouteGuard({ children }: CompareRouteAuthProps) {
  const pokemonsToCompare = useSelector(
    (state: { pokedex: PokemonState }) => state.pokedex.pokemonsToCompare,
  );

  if (!pokemonsToCompare || pokemonsToCompare.length < 2) {
    return <Navigate to="/" replace />;
  }

  return <>{children}</>;
}
