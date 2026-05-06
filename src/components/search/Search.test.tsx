import { fireEvent, render, screen } from "@testing-library/react";
import { expect, test, vi } from "vitest";
import userEvent from "@testing-library/user-event";

import Search from "./Search";
import { configureStore } from "@reduxjs/toolkit";
import { Provider } from "react-redux";
import { I18nextProvider } from "react-i18next";
import i18n from "../../i18n.ts";
import { MemoryRouter } from "react-router-dom";
import pokemonReducer from "../../store/pokemon-slice.ts";

vi.mock("../../services/api/pokemonApi", async (importOriginal) => {
  const actual =
    await importOriginal<typeof import("../../services/api/pokemonApi")>();
  return {
    ...actual,
    useGetAllPokemonNamesQuery: vi.fn(() => ({
      data: mockPokemonNames,
      isLoading: false,
      error: null,
    })),
  };
});

const mockPokemonNames: string[] = [
  "Bulbasaur",
  "Granbull",
  "Ivysaur",
  "Venusaur",
];

function renderSearchWithProviders() {
  const store = configureStore({
    reducer: { pokedex: pokemonReducer },
  });

  return {
    store,
    ...render(
      <Provider store={store}>
        <MemoryRouter>
          <I18nextProvider i18n={i18n}>
            <Search />
          </I18nextProvider>
        </MemoryRouter>
      </Provider>,
    ),
  };
}

test("zeigt Eingabefeld und Button an", () => {
  renderSearchWithProviders();
  expect(
    screen.getByPlaceholderText("Pokemon Name oder ID"),
  ).toBeInTheDocument();
  expect(
    screen.getByRole("button", { name: "Pokemon suchen" }),
  ).toBeInTheDocument();
});

test("zeigt Validierungsfehler bei leerem Submit", async () => {
  renderSearchWithProviders();
  fireEvent.click(screen.getByRole("button", { name: "Pokemon suchen" }));
  expect(
    await screen.findByText(/Das ist ein Pflichtfeld/i),
  ).toBeInTheDocument();
});

test("zeigt Validierungsfehler bei ungültigem Input", async () => {
  renderSearchWithProviders();

  const input = screen.getByTestId("search-input");
  await userEvent.type(input, "!!");
  expect(input).toHaveValue("!!");

  await userEvent.click(
    screen.getByRole("button", { name: /pokemon suchen/i }),
  );

  expect(
    await screen.findByText(
      /Nur Buchstaben, Zahlen und Bindestriche sind erlaubt!/i,
    ),
  ).toBeInTheDocument();
});

test("zeigt Autovervollständigung der Pokemonnamen an", async () => {
  renderSearchWithProviders();

  const input = screen.getByTestId("search-input");
  await userEvent.type(input, "bul");

  expect(await screen.findByText(/Bulbasaur/i)).toBeInTheDocument();
  screen.debug();
});

test("steuert Selektion mit Tastatur", async () => {
  renderSearchWithProviders();

  const input = screen.getByTestId("search-input");
  await userEvent.type(input, "bul");
  await userEvent.keyboard("{ArrowDown}");
  await userEvent.keyboard("{Enter}");

  expect(input).toHaveValue("Bulbasaur");
});
