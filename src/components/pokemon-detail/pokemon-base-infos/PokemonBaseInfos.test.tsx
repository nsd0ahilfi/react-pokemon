import { describe, it, expect, vi } from "vitest";
import { render, screen, waitFor } from "@testing-library/react";
import { Provider } from "react-redux";

import PokemonBaseInfos from "./PokemonBaseInfos";
import type { Pokemon } from "../../../models";
import { store } from "../../../store/store.ts";
import * as api from "../../../services/api/pokemonApi.ts";

vi.mock("react-i18next", () => ({
  useTranslation: () => ({
    t: (str: string) => str,
  }),
}));

vi.mock("../../../services/api/pokemonApi.ts", async () => {
  const original: typeof api = await vi.importActual(
    "../../../services/api/pokemonApi.ts",
  );
  return {
    ...original,
    useLazyGetPokemonAbilityQuery: vi.fn(() => [
      vi.fn(() => ({
        unwrap: () =>
          Promise.resolve({ name: "ability-1", effect: "effect-1" }),
      })),
    ]),
  };
});

describe("PokemonBaseInfos", () => {
  const mockPokemon: Pokemon = {
    id: 1,
    name: "bulbasaur",
    base_experience: 64,
    height: 70,
    weight: 69,
    abilities: ["1"],
    types: ["grass"],
    habitat: "forest",
    heldItems: [{ name: "berry", img: "berry.png", description: "heals 10hp" }],
  };

  it("renders base infos", () => {
    render(
      <Provider store={store}>
        <PokemonBaseInfos pokemon={mockPokemon} />
      </Provider>,
    );

    expect(screen.getByText("baseInfo")).toBeInTheDocument();
    expect(screen.getByText("baseExperience:")).toBeInTheDocument();
    expect(screen.getByText("64")).toBeInTheDocument();
    expect(screen.getByText("sizeValue")).toBeInTheDocument();
    expect(screen.getByText("weightValue")).toBeInTheDocument();
    expect(screen.getByText("types")).toBeInTheDocument();
    expect(screen.getByText("grass")).toBeInTheDocument();
    expect(screen.getByText("habitat")).toBeInTheDocument();
    expect(screen.getByText("forest")).toBeInTheDocument();
    expect(screen.getByText("heldItems")).toBeInTheDocument();
    expect(screen.getByText("berry - heals 10hp")).toBeInTheDocument();
  });

  it("loads abilities via triggerAbility", async () => {
    render(
      <Provider store={store}>
        <PokemonBaseInfos pokemon={mockPokemon} />
      </Provider>,
    );

    await waitFor(() => {
      expect(screen.getByText("ability-1 - effect-1")).toBeInTheDocument();
    });
  });
});
