import { configureStore } from "@reduxjs/toolkit";
import pokemonReducer from "./pokemon-slice.ts";

import { pokemonApi } from "../services/api/pokemonApi.ts";

export const store = configureStore({
  reducer: {
    pokedex: pokemonReducer,
    [pokemonApi.reducerPath]: pokemonApi.reducer,
  },
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware().concat(pokemonApi.middleware),
});

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;
