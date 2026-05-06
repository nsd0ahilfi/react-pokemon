import { describe, it, vi, afterEach, type Mock, expect } from "vitest";
import { render, screen } from "@testing-library/react";
import { Provider } from "react-redux";
import { MemoryRouter, Route, Routes } from "react-router-dom";
import { configureStore } from "@reduxjs/toolkit";
import { I18nextProvider } from "react-i18next";

import i18n from "../../i18n";
import PokemonDetail from "./PokemonDetail";
import pokedexReducer, { type PokemonState } from "../../store/pokemon-slice";
import { useGetPokemonQuery } from "../../services/api/pokemonApi.ts";

vi.mock("react-router-dom", async () => {
  const actual =
    await vi.importActual<typeof import("react-router-dom")>(
      "react-router-dom",
    );
  return {
    ...actual,
    useParams: () => ({ id: "1" }),
  };
});

vi.mock("react-i18next", async () => {
  const actual =
    await vi.importActual<typeof import("react-i18next")>("react-i18next");
  return {
    ...actual,
    useTranslation: () => ({ t: (key: string) => key }),
    initReactI18next: { type: "3rdParty", init: vi.fn() },
  };
});

vi.mock("../../services/api/pokemonApi.ts", () => ({
  useGetPokemonQuery: vi.fn(),
  useLazyGetPokemonAbilityQuery: vi.fn(() => [vi.fn(), {}]), // Array mit Trigger-Funktion und Ergebnis
}));

function renderWithProviders(
  ui: React.ReactNode,
  { preloadedState }: { preloadedState?: { pokedex: PokemonState } } = {},
) {
  const store = configureStore({
    reducer: { pokedex: pokedexReducer },
    preloadedState,
  });

  return render(
    <Provider store={store}>
      <I18nextProvider i18n={i18n}>
        <MemoryRouter initialEntries={["/pokemon/1"]}>
          <Routes>
            <Route path="/pokemon/:id" element={ui} />
          </Routes>
        </MemoryRouter>
      </I18nextProvider>
    </Provider>,
  );
}

describe("PokemonDetail", () => {
  afterEach(() => {
    vi.resetAllMocks();
  });

  it("renders loading state", () => {
    (useGetPokemonQuery as Mock).mockReturnValue({
      data: undefined,
      isFetching: true,
      isError: false,
    });

    renderWithProviders(<PokemonDetail />);

    expect(screen.getByAltText("loading")).toBeInTheDocument();
  });

  it("renders error state", () => {
    (useGetPokemonQuery as Mock).mockReturnValue({
      isFetching: false,
      isError: true,
    });

    renderWithProviders(<PokemonDetail />);

    expect(screen.getByText(/pokemonNotFound/i)).toBeInTheDocument();
  });

  it("renders pokemon data", () => {
    (useGetPokemonQuery as Mock).mockReturnValue({
      data: {
        id: "1",
        name: "pikachu",
        sprites: { front_default: "pikachu.png" },
        description: "Electric mouse Pokémon",
      },
      isFetching: false,
      isError: false,
    });

    renderWithProviders(<PokemonDetail />);

    expect(screen.getByText("pikachu")).toBeInTheDocument();
    expect(screen.getByAltText("pikachu")).toBeInTheDocument();
    expect(screen.getByText("Electric mouse Pokémon")).toBeInTheDocument();
  });
});
