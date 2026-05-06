import { fireEvent, render, screen } from "@testing-library/react";
import { expect, type Mock, test, vi } from "vitest";

import * as pokemonApi from "../../services/api/pokemonApi";
import PokemonList from "./PokemonList";
import type { PokemonOverview } from "../../models";
import { MemoryRouter } from "react-router-dom";
import pokemonReducer, {
  type PokemonState,
} from "../../store/pokemon-slice.ts";
import { configureStore } from "@reduxjs/toolkit";
import { Provider } from "react-redux";
import { I18nextProvider } from "react-i18next";
import i18n from "../../i18n.ts";

const mockPokemons: PokemonOverview[] = [
  { id: 1, name: "Bulbasaur", sprites: { front_default: "bulba.png" } },
  { id: 2, name: "Ivysaur", sprites: { front_default: "ivy.png" } },
];

vi.mock("../../services/api/pokemonApi", () => ({
  useGetPokemonPageQuery: vi.fn(),
}));

vi.mock("react-router-dom", async () => {
  const actual =
    await vi.importActual<typeof import("react-router-dom")>(
      "react-router-dom",
    );
  return {
    ...actual,
    useNavigate: () => vi.fn(),
    MemoryRouter: actual.MemoryRouter,
  };
});

function renderPokemonList(
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

  return {
    store,
    ...render(
      <Provider store={store}>
        <MemoryRouter>
          <I18nextProvider i18n={i18n}>
            <PokemonList />
          </I18nextProvider>
        </MemoryRouter>
      </Provider>,
    ),
  };
}

test("rendert die Pokémon-Liste und den Button", () => {
  (pokemonApi.useGetPokemonPageQuery as Mock).mockReturnValue({
    data: mockPokemons,
    isFetching: false,
  });

  renderPokemonList();

  expect(screen.getByText("Pokédex")).toBeInTheDocument();
  expect(screen.getByText("Bulbasaur")).toBeInTheDocument();
  expect(screen.getByText("Ivysaur")).toBeInTheDocument();
  expect(
    screen.getByRole("button", { name: "Weitere Pokemons" }),
  ).toBeInTheDocument();
});

test("Button ist während des Ladens deaktiviert", () => {
  (pokemonApi.useGetPokemonPageQuery as Mock).mockReturnValue({
    data: mockPokemons,
    isFetching: true,
  });

  renderPokemonList();

  const button = screen.getByRole("button", { name: "Lädt..." });
  expect(button).toBeDisabled();
});

test("Button toggelt zwischen 'Auswahl starten' und 'Auswahl beenden'", async () => {
  (pokemonApi.useGetPokemonPageQuery as Mock).mockReturnValue({
    data: mockPokemons,
    isFetching: false,
  });
  renderPokemonList();

  fireEvent.click(screen.getByRole("button", { name: /Auswahl starten/i }));

  expect(
    await screen.getByRole("button", { name: /Auswahl beenden/i }),
  ).toBeInTheDocument();
});

test("handleSelectAll fügt Pokemons zu Compare-List hinzu", async () => {
  (pokemonApi.useGetPokemonPageQuery as Mock).mockReturnValue({
    data: mockPokemons,
    isFetching: false,
  });

  const { store } = renderPokemonList({
    pokedex: {
      pokeballList: [],
      pokemonsToCompare: [],
      compareSelectionToggle: false,
    },
  });

  fireEvent.click(screen.getByRole("button", { name: /Auswahl starten/i }));

  const selectButton = await screen.findByRole("button", {
    name: /Alle auswählen/i,
  });

  fireEvent.click(selectButton);

  const state = store.getState().pokedex;
  expect(state.pokemonsToCompare).toEqual(mockPokemons);
});
