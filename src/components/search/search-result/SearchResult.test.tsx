import { render, screen } from "@testing-library/react";
import { expect, type Mock, test, vi } from "vitest";
import { Provider } from "react-redux";
import { I18nextProvider } from "react-i18next";
import { configureStore } from "@reduxjs/toolkit";

import * as pokemonApi from "../../../services/api/pokemonApi";
import PokemonResult from "./PokemonResult";
import { MemoryRouter } from "react-router-dom";
import pokedexReducer from "../../../store/pokemon-slice.ts";
import i18n from "../../../i18n.ts";

vi.mock("../../../services/api/pokemonApi", () => ({
  useGetPokemonQuery: vi.fn(),
}));

const mockPokemon = {
  id: 25,
  name: "Pikachu",
  sprites: { front_default: "pikachu.png" },
};

function renderWithProviders(ui: React.ReactNode) {
  const store = configureStore({
    reducer: { pokedex: pokedexReducer },
  });

  return render(
    <Provider store={store}>
      <I18nextProvider i18n={i18n}>
        <MemoryRouter>{ui}</MemoryRouter>
      </I18nextProvider>
    </Provider>,
  );
}

test("zeigt Ladesymbol während des Ladens", () => {
  (pokemonApi.useGetPokemonQuery as Mock).mockReturnValue({
    isFetching: true,
    isError: false,
    data: undefined,
  });

  renderWithProviders(<PokemonResult searchTerm="pikachu" />);

  expect(screen.getByAltText("loading")).toBeInTheDocument();
});

test("zeigt Fehlermeldung bei Fehler", () => {
  (pokemonApi.useGetPokemonQuery as Mock).mockReturnValue({
    isFetching: false,
    isError: true,
    data: undefined,
  });

  renderWithProviders(<PokemonResult searchTerm="unbekannt" />);
  expect(
    screen.getByText("Pokemon mit diesem Namen/ID nicht gefunden."),
  ).toBeInTheDocument();
});

test("zeigt PokemonCard bei Erfolg", () => {
  (pokemonApi.useGetPokemonQuery as Mock).mockReturnValue({
    isFetching: false,
    isError: false,
    data: mockPokemon,
  });

  renderWithProviders(<PokemonResult searchTerm="pikachu" />);

  expect(screen.getByText("Pikachu")).toBeInTheDocument();
});
