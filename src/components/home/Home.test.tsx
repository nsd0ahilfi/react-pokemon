import { render, screen } from "@testing-library/react";
import { expect, test, vi } from "vitest";
import { MemoryRouter } from "react-router-dom";
import { Provider } from "react-redux";

import Home from "./Home.tsx";
import { store } from "../../store/store.ts";

vi.mock("react-i18next", () => ({
  useTranslation: () => ({ t: (key: string) => key }),
}));

test("renders Search", () => {
  render(
    <Provider store={store}>
      <MemoryRouter>
        <Home />
      </MemoryRouter>
    </Provider>,
  );

  expect(screen.getByText("findPokemon")).toBeInTheDocument();
});
