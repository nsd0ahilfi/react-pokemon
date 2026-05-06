import { BrowserRouter, Route, Routes } from "react-router-dom";

import "./App.css";
import Home from "./components/home/Home.tsx";
import PokemonDetail from "./components/pokemon-detail/PokemonDetail.tsx";
import "./i18n.ts";
import Header from "./components/header/Header.tsx";
import PokemonComparison from "./components/compare/PokemonComparison.tsx";
import { CompareRouteGuard } from "./guards";
import PokemonChatbot from "./components/chatbot/PokemonChatbot";

function App() {
  return (
    <>
      <BrowserRouter>
        <Header />
        <div className="h-[calc(100vh-64px)] flex flex-col max-w-6xl m-auto">
          <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/pokemon/:id" element={<PokemonDetail />} />
            <Route
              path="/compare"
              element={
                <CompareRouteGuard>
                  <PokemonComparison />
                </CompareRouteGuard>
              }
            />
          </Routes>
        </div>
        <PokemonChatbot />
      </BrowserRouter>
    </>
  );
}

export default App;
