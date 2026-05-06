import {
  createApi,
  fetchBaseQuery,
  type FetchBaseQueryError,
} from "@reduxjs/toolkit/query/react";

import type {
  Pokemon,
  PokemonAbility,
  PokemonAbilityResponse,
  PokemonApiRequest,
  PokemonHeldItem,
  PokemonHeldItemsResponse,
  PokemonListResponse,
  PokemonLocalizedName,
  PokemonOverview,
  PokemonResponse,
  PokemonResponseData,
  PokemonTypesResponse,
} from "../../models";

export const pokemonApi = createApi({
  reducerPath: "pokemonApi",
  baseQuery: fetchBaseQuery({ baseUrl: "https://pokeapi.co/api/v2/" }),
  endpoints: (builder) => ({
    getPokemonPage: builder.query({
      query: ({ offset, limit }) => `pokemon?offset=${offset}&limit=${limit}`,
      async transformResponse(basicResults: PokemonListResponse) {
        const detailedInfos = await Promise.all(
          basicResults.results.map((p: { url: string }) =>
            fetch(p.url).then((res) => res.json()),
          ),
        );
        return mapPokemonOverviewRequestData(detailedInfos);
      },
    }),
    getPokemon: builder.query<Pokemon, [string, boolean]>({
      async queryFn(
        [searchTerm, onlyOverview],
        _api,
        _extraOptions,
        baseQuery,
      ) {
        try {
          const request = (await baseQuery(
            `pokemon/${searchTerm}`,
          )) as PokemonResponse;
          const response: PokemonResponseData = request?.data;

          if (!response) {
            return {
              error: {
                status: 404,
                error: "Pokemon not found",
                data: {},
              } as FetchBaseQueryError,
            };
          }

          if (onlyOverview) {
            return {
              data: {
                id: response.id,
                name: response.name,
                sprites: response.sprites,
              },
            };
          }

          // Fetch Types
          const typeUrls = response.types?.map((t) => baseQuery(t.type.url));
          let types: string[] = [];
          if (typeUrls?.length > 0) {
            const typesResponses = await Promise.all(typeUrls);

            types = typesResponses
              .filter((res): res is PokemonTypesResponse => "data" in res)
              .map(
                (res) =>
                  res.data.names?.find((name) => name.language.name === "de")
                    ?.name ?? "",
              );
          }
          // Fetch Habitat and Description
          let habitat = "---";
          let description = "";
          if (response.species?.url) {
            const speciesRes = await fetch(response.species?.url);
            const speciesData = await speciesRes.json();

            if (speciesData.habitat?.url) {
              const habitatRes = await fetch(speciesData.habitat?.url);
              const habitatData: { names: PokemonLocalizedName[] } =
                await habitatRes.json();

              habitat =
                habitatData.names?.find(
                  (name) =>
                    name.language.name === "de" || name.language.name === "en",
                )?.name ?? "-";
            }

            description =
              speciesData.flavor_text_entries?.find(
                (name: { language: { name: string } }) =>
                  name.language.name === "de" || name.language.name === "en",
              )?.flavor_text ?? "";
          }

          // Fetch Held Items
          const heldItemsUrls = response.held_items?.map(
            (h: { item: PokemonApiRequest }) => h.item.url,
          );
          let heldItems: PokemonHeldItem[] = [];

          if (heldItemsUrls?.length > 0) {
            const heldItemsRes = await Promise.all(
              response.held_items.map((h: { item: PokemonApiRequest }) =>
                baseQuery(h.item.url),
              ),
            );
            heldItems = heldItemsRes
              .filter((res): res is PokemonHeldItemsResponse => "data" in res)
              .map((res) => ({
                name:
                  res.data.names?.find((name) => name.language.name === "de")
                    ?.name ?? "",
                img: res.data.sprites?.default ?? "",
                description:
                  res.data.flavor_text_entries?.find(
                    (entry) => entry.language.name === "de",
                  )?.text ?? "",
              }));
          }

          return {
            data: {
              ...mapPokemonRequestData(response),
              types,
              habitat,
              description,
              heldItems,
            },
          };
        } catch (error) {
          return { error: error as FetchBaseQueryError };
        }
      },
    }),
    getPokemonAbility: builder.query<PokemonAbility, string>({
      query: (id) => `ability/${id}`,
      transformResponse: (response: PokemonAbilityResponse): PokemonAbility => {
        const name =
          response.names?.find((name) => name.language.name === "de")?.name ??
          "";
        const effect =
          response.effect_entries?.find((e) => e.language.name === "de")
            ?.effect ?? "";

        return { name, effect };
      },
    }),
    getAllPokemonNames: builder.query<string[], void>({
      query: () => "pokemon?limit=1300&offset=0",
      transformResponse: (response: PokemonListResponse): string[] => {
        return response.results
          ?.map((p) => p.name)
          .filter((name) => name != undefined);
      },
    }),
  }),
});

export const {
  useGetPokemonPageQuery,
  useGetPokemonQuery,
  useLazyGetPokemonAbilityQuery,
  useLazyGetPokemonQuery,
  useGetAllPokemonNamesQuery,
} = pokemonApi;

function mapPokemonOverviewRequestData(
  pokemonResponse: PokemonResponseData[],
): PokemonOverview[] {
  console.log(pokemonResponse);
  return pokemonResponse.map((pokemon) => ({
    id: pokemon.id,
    name: pokemon.name,
    height: pokemon.height,
    weight: pokemon.weight,
    base_experience: pokemon.base_experience,
    sprites: pokemon.sprites,
    types: pokemon.types.map((t) => t.type.name),
    abilities: pokemon.abilities,
  })) as PokemonOverview[];
}

function mapPokemonRequestData(pokemonResponse: PokemonResponseData): Pokemon {
  return {
    id: pokemonResponse.id,
    name: pokemonResponse.name,
    base_experience: pokemonResponse.base_experience,
    height: pokemonResponse.height,
    weight: pokemonResponse.weight,
    sprites: pokemonResponse.sprites,
    stats: {
      hp:
        pokemonResponse.stats.find((stat) => stat.stat.name === "hp")
          ?.base_stat ?? 0,
      attack:
        pokemonResponse.stats.find((stat) => stat.stat.name === "attack")
          ?.base_stat ?? 0,
      defense:
        pokemonResponse.stats.find((stat) => stat.stat.name === "defense")
          ?.base_stat ?? 0,
      specialAttack:
        pokemonResponse.stats.find(
          (stat) => stat.stat.name === "special-attack",
        )?.base_stat ?? 0,
      specialDefense:
        pokemonResponse.stats.find(
          (stat) => stat.stat.name === "special-defense",
        )?.base_stat ?? 0,
      speed:
        pokemonResponse.stats.find((stat) => stat.stat.name === "speed")
          ?.base_stat ?? 0,
    },
    abilities: pokemonResponse.abilities.map(
      (a) => a.ability.url.split("/").filter(Boolean).pop() ?? "",
    ),
  };
}
