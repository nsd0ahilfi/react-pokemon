import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import { Provider } from "react-redux";
import { configureStore } from "@reduxjs/toolkit";
import { MemoryRouter } from "react-router-dom";
import { vi, describe, test, expect, beforeEach } from "vitest";
import Header from "./Header.tsx";
import pokemonReducer, {
  type PokemonState,
} from "../../store/pokemon-slice.ts";
import type { Pokemon } from "../../models";

vi.mock("react-i18next", async () => {
  const actual =
    await vi.importActual<typeof import("react-i18next")>("react-i18next");
  return {
    ...actual,
    useTranslation: () => ({ t: (key: string) => key }),
  };
});

const mockGetLazyCatchedPokemon = vi.fn();
vi.mock("../../services/api/pokemonApi", () => ({
  useLazyGetPokemonQuery: () => [mockGetLazyCatchedPokemon],
}));

function renderHeader(
  preloadedState = { pokedex: { pokeballList: [] } as PokemonState },
) {
  const store = configureStore({
    reducer: { pokedex: pokemonReducer },
    preloadedState,
  });
  return render(
    <Provider store={store}>
      <MemoryRouter>
        <Header />
      </MemoryRouter>
    </Provider>,
  );
}

describe("Header", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    localStorage.clear();
  });

  test("shows home icon und pokéball icon", () => {
    renderHeader();
    expect(screen.getByAltText("home")).toBeInTheDocument();
    expect(screen.getByAltText("pokeball")).toBeInTheDocument();
  });

  test("shows the count of catched pokemons", () => {
    renderHeader({
      pokedex: { pokeballList: [{ id: "1" }, { id: "2" }] as Pokemon[] },
    });
    expect(screen.getByText("2")).toBeInTheDocument();
  });

  test("opens pokeball by clicking, when pokeball has pokemon", () => {
    renderHeader({ pokedex: { pokeballList: [{ id: "1" }] as Pokemon[] } });
    const pokeball = screen.getByAltText("pokeball").parentElement;

    if (pokeball) {
      fireEvent.click(pokeball);
    }

    expect(screen.getByTestId("pokeball-modal")).toBeInTheDocument();
  });

  test("closes pokeball when closePokeball is fired", () => {
    renderHeader({ pokedex: { pokeballList: [{ id: "1" }] as Pokemon[] } });
    const pokeball = screen.getByAltText("pokeball").parentElement;

    if (pokeball) {
      fireEvent.click(pokeball);
    }
    fireEvent.click(screen.getByTestId("close-pokeball-modal"));

    expect(screen.queryByTestId("pokeball-modal")).not.toBeInTheDocument();
  });

  test("loads pokemon from LocalStorage, when pokeball is empty", async () => {
    localStorage.setItem("catchedPokemons", JSON.stringify(["25"]));
    mockGetLazyCatchedPokemon.mockReturnValue({
      unwrap: () => Promise.resolve({ id: "25", name: "Pikachu" }),
    });
    const store = configureStore({
      reducer: { pokedex: pokemonReducer },
      preloadedState: { pokedex: { pokeballList: [] } },
    });
    render(
      <Provider store={store}>
        <MemoryRouter>
          <Header />
        </MemoryRouter>
      </Provider>,
    );
    await waitFor(() => {
      const state = store.getState();
      expect(state.pokedex.pokeballList[0].name).toBe("Pikachu");
    });
  });
});
