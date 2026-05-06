export interface PokemonOverview {
  id: number;
  name: string;
  base_experience?: number;
  height?: number;
  weight?: number;
  sprites?: {
    front_default?: string;
  };
}

export interface Pokemon extends PokemonOverview {
  stats?: PokemonStats;
  abilities?: string[];
  types?: string[];
  habitat?: string;
  description?: string;
  heldItems?: PokemonHeldItem[];
}

export interface PokemonAbility {
  name: string;
  effect: string;
}

export interface PokemonStats {
  hp?: number;
  attack?: number;
  defense: number;
  specialAttack?: number;
  specialDefense?: number;
  speed?: number;
}

export interface PokemonHeldItem {
  name: string;
  description: string;
  img: string;
}
