import { fireEvent, render, screen } from "@testing-library/react";
import { Provider } from "react-redux";
import { configureStore } from "@reduxjs/toolkit";
import { MemoryRouter } from "react-router-dom";
import { expect, test, vi } from "vitest";
import PokemonBall from "./PokemonBall";
import pokedexReducer, { type PokemonState } from "../../store/pokemon-slice";
import { I18nextProvider } from "react-i18next";
import i18n from "../../i18n";

vi.mock("react-i18next", async () => {
  const actual =
    await vi.importActual<typeof import("react-i18next")>("react-i18next");
  return {
    ...actual,
    useTranslation: () => ({ t: (key: string) => key }),
  };
});

const mockClosePokeball = vi.fn();

const preloadedState = {
  pokedex: {
    pokeballList: [
      {
        id: 25,
        name: "Pikachu",
        sprites: { front_default: "/pikachu.png" },
      },
    ],
  } as PokemonState,
};

function renderWithProviders(ui: React.ReactNode) {
  const store = configureStore({
    reducer: { pokedex: pokedexReducer },
    preloadedState,
  });

  return render(
    <Provider store={store}>
      <I18nextProvider i18n={i18n}>
        <MemoryRouter>{ui}</MemoryRouter>
      </I18nextProvider>
    </Provider>,
  );
}

test("show catched Pokémon", () => {
  renderWithProviders(<PokemonBall closePokeball={mockClosePokeball} />);
  expect(screen.getByText("#25")).toBeInTheDocument();
  expect(screen.getByText("Pikachu")).toBeInTheDocument();
  expect(screen.getByAltText("pokemon")).toHaveAttribute("src", "/pikachu.png");
});

test("remove Pokémon when release icon is clicked", () => {
  renderWithProviders(<PokemonBall closePokeball={mockClosePokeball} />);
  const releaseIcon = screen.getByAltText("release pokemon");
  const iconParent = releaseIcon.parentElement;

  if (iconParent) {
    fireEvent.click(iconParent);
  }

  expect(screen.queryByText("Pikachu")).not.toBeInTheDocument();
});
