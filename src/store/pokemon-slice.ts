import { createSlice, type PayloadAction } from "@reduxjs/toolkit";

import type { Pokemon, PokemonOverview } from "../models";

export interface PokemonState {
  pokeballList: Pokemon[];
  pokemonsToCompare: PokemonOverview[];
  compareSelectionToggle: boolean;
}

const initialState: PokemonState = {
  pokeballList: [],
  pokemonsToCompare: [],
  compareSelectionToggle: false,
};

export const pokemonSlice = createSlice({
  name: "pokedex",
  initialState,
  reducers: {
    setPokeballList: (state, action: PayloadAction<Pokemon[]>) => ({
      ...state,
      pokeballList: action.payload,
    }),
    catchPokemon: (state, action: PayloadAction<Pokemon>) => {
      const storedPokemons = JSON.parse(
        localStorage.getItem("catchedPokemons") ?? "[]",
      );
      localStorage.setItem(
        "catchedPokemons",
        JSON.stringify([...storedPokemons, action.payload.id]),
      );
      return {
        ...state,
        pokeballList: [...state.pokeballList, action.payload],
      };
    },
    removeCatchedPokemon: (state, action: PayloadAction<number>) => {
      const storedPokemons = JSON.parse(
        localStorage.getItem("catchedPokemons") ?? "[]",
      );
      localStorage.setItem(
        "catchedPokemons",
        JSON.stringify(
          storedPokemons.filter((pokeId: number) => pokeId !== action.payload),
        ),
      );

      return {
        ...state,
        pokeballList: state.pokeballList.filter(
          (pokemon) => pokemon.id !== action.payload,
        ),
      };
    },
    setPokemonsToCompare: (state, action: PayloadAction<Pokemon[]>) => ({
      ...state,
      pokemonsToCompare: action.payload,
    }),
    updatePokemonsToCompare: (
      state,
      action: PayloadAction<{ pokemon: Pokemon; add: boolean }>,
    ) => {
      let newPokemonsToCompare = [...state.pokemonsToCompare];

      if (action.payload.add) {
        newPokemonsToCompare = [
          ...newPokemonsToCompare,
          action.payload.pokemon,
        ];
      } else {
        newPokemonsToCompare = newPokemonsToCompare.filter(
          (pokemon) => pokemon.id !== action.payload.pokemon.id,
        );
      }
      return { ...state, pokemonsToCompare: newPokemonsToCompare };
    },
    toggleCompareSelection: (state, action: PayloadAction<boolean>) => ({
      ...state,
      compareSelectionToggle: action.payload,
    }),
    resetPokemonsToCompare: (state) => ({ ...state, pokemonsToCompare: [] }),
  },
});

export const {
  catchPokemon,
  setPokeballList,
  removeCatchedPokemon,
  updatePokemonsToCompare,
  setPokemonsToCompare,
  toggleCompareSelection,
  resetPokemonsToCompare,
} = pokemonSlice.actions;
export default pokemonSlice.reducer;
