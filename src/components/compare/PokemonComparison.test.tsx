import { render, screen, fireEvent } from "@testing-library/react";
import { Provider } from "react-redux";
import { configureStore } from "@reduxjs/toolkit";
import { describe, expect, test } from "vitest";
import { MemoryRouter } from "react-router-dom";
import { I18nextProvider } from "react-i18next";

import PokemonComparison from "./PokemonComparison";
import i18n from "../../i18n";
import type { PokemonOverview } from "../../models";
import pokemonReducer, {
  type PokemonState,
} from "../../store/pokemon-slice.ts";

function renderWithProviders(
  preloadedState = {
    pokedex: {
      pokeballList: [],
      pokemonsToCompare: [],
      compareSelectionToggle: false,
    } as PokemonState,
  },
) {
  const store = configureStore({
    reducer: { pokedex: pokemonReducer },
    preloadedState,
  });

  return render(
    <Provider store={store}>
      <MemoryRouter>
        <I18nextProvider i18n={i18n}>
          <PokemonComparison />
        </I18nextProvider>
      </MemoryRouter>
    </Provider>,
  );
}

const mockPokemons: PokemonOverview[] = [
  {
    id: 1,
    name: "Bulbasaur",
    base_experience: 64,
    height: 7,
    weight: 69,
  },
  {
    id: 2,
    name: "Ivysaur",
    base_experience: 142,
    height: 10,
    weight: 130,
  },
];

describe("PokemonComparison", () => {
  test("renders pokemons from store", () => {
    renderWithProviders({
      pokedex: { pokemonsToCompare: mockPokemons } as PokemonState,
    });

    expect(screen.getByText(/Bulbasaur/i)).toBeInTheDocument();
    expect(screen.getByText(/Ivysaur/i)).toBeInTheDocument();
  });

  test("computes min/max stats in useEffect", () => {
    renderWithProviders({
      pokedex: { pokemonsToCompare: mockPokemons } as PokemonState,
    });

    const bulbaExp = screen.getByText("64");
    expect(bulbaExp).toHaveClass("bg-red-300");

    const ivyExp = screen.getByText("142");
    expect(ivyExp).toHaveClass("bg-green-300");
  });

  test("calls onRemovePokemon when delete icon clicked", () => {
    const { container } = renderWithProviders({
      pokedex: { pokemonsToCompare: mockPokemons } as PokemonState,
    });

    const deleteIcons = container.querySelectorAll(
      ".c-pokemon-list_select-all-icon",
    );

    expect(deleteIcons.length).toBe(2);

    fireEvent.click(deleteIcons[0]);

    expect(screen.queryByText(/Bulbasaur/i)).not.toBeInTheDocument();
    expect(screen.getByText(/Ivysaur/i)).toBeInTheDocument();
  });
});
