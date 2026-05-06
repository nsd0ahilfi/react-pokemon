import { describe, it, expect, vi } from "vitest";
import { render, screen } from "@testing-library/react";

import PokemonStats from "./PokemonStats";
import type { Pokemon } from "../../../models";

vi.mock("react-i18next", () => ({
  useTranslation: () => ({
    t: (str: string) => str,
  }),
}));

describe("PokemonStats", () => {
  const mockPokemon: Pokemon = {
    id: 25,
    name: "pikachu",
    stats: {
      hp: 35,
      attack: 36,
      defense: 37,
      specialAttack: 38,
      specialDefense: 39,
      speed: 40,
    },
  };

  it("renders all stat labels", () => {
    render(<PokemonStats pokemon={mockPokemon} />);

    expect(screen.getByText("hp")).toBeInTheDocument();
    expect(screen.getByText("attack")).toBeInTheDocument();
    expect(screen.getByText("defense")).toBeInTheDocument();
    expect(screen.getByText("specialAttack")).toBeInTheDocument();
    expect(screen.getByText("specialDefense")).toBeInTheDocument();
    expect(screen.getByText("speed")).toBeInTheDocument();
  });

  it("renders correct stat values", () => {
    render(<PokemonStats pokemon={mockPokemon} />);

    expect(screen.getByText("35")).toBeInTheDocument();
    expect(screen.getByText("36")).toBeInTheDocument();
    expect(screen.getByText("37")).toBeInTheDocument();
    expect(screen.getByText("38")).toBeInTheDocument();
    expect(screen.getByText("39")).toBeInTheDocument();
  });
});
