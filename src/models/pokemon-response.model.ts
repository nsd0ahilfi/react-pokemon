export interface PokemonApiRequest {
  name?: string;
  url: string;
}

export interface FlavorTextEntry {
  language: { name: string };
  text: string;
}

export interface Sprite {
  default?: string;
  front_default?: string;
}

export interface PokemonLocalizedName {
  language: { name: string };
  name: string;
}

export interface PokemonListResponse {
  results: PokemonApiRequest[];
}

export interface PokemonResponse {
  data: PokemonResponseData;
}

export interface PokemonResponseData {
  id: number;
  name: string;
  height: number;
  weight: number;
  base_experience: number;
  sprites: Sprite;
  stats: { stat: PokemonApiRequest; base_stat: number }[];
  abilities: { ability: PokemonApiRequest }[];
  types: { type: PokemonApiRequest }[];
  species: PokemonApiRequest;
  held_items: { item: PokemonApiRequest }[];
}

export interface PokemonTypesResponse {
  data: { names: PokemonLocalizedName[] };
}

export interface PokemonHeldItemsResponse {
  data: {
    names: PokemonLocalizedName[];
    sprites: Sprite;
    flavor_text_entries: FlavorTextEntry[];
  };
}

export interface PokemonAbilityResponse {
  names: PokemonLocalizedName[];
  effect_entries: {
    effect: string;
    language: { name: string };
  }[];
}
