import { render, screen } from "@testing-library/react";
import { expect, test } from "vitest";

import PokemonCard from "./PokemonCard";
import type { PokemonOverview } from "../../models";
import { MemoryRouter } from "react-router-dom";
import pokemonReducer, {
  type PokemonState,
} from "../../store/pokemon-slice.ts";
import { configureStore } from "@reduxjs/toolkit";
import { Provider } from "react-redux";
import { I18nextProvider } from "react-i18next";
import i18n from "../../i18n.ts";

const mockPokemon: PokemonOverview = {
  id: 25,
  name: "Pikachu",
  sprites: { front_default: "https://example.com/pikachu.png" },
};

function renderPokemonCard(
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
          <PokemonCard pokemon={mockPokemon} />
        </I18nextProvider>
      </MemoryRouter>
    </Provider>,
  );
}

test("renders PokemonCard", () => {
  renderPokemonCard();

  expect(screen.getByText("#25")).toBeInTheDocument();
  expect(screen.getByText("Pikachu")).toBeInTheDocument();
  const img = screen.getByAltText("Pikachu") as HTMLImageElement;
  expect(img).toBeInTheDocument();
  expect(img.src).toBe("https://example.com/pikachu.png");
});
