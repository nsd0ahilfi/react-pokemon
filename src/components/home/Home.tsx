import { Helmet } from "react-helmet-async";
import Search from "../search/Search.tsx";
import PokemonList from "../pokemon-list/PokemonList.tsx";

export default function Home() {
  return (
    <>
      <Helmet>
        <title>Pokédex – Alle Pokémon entdecken</title>
        <meta
          name="description"
          content="Durchsuche den Pokédex, vergleiche Werte und sammle deine Lieblings-Pokémon."
        />
        <link rel="canonical" href="/" />
      </Helmet>
      <Search />
      <PokemonList />
    </>
  );
}
