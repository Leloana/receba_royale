// src/pages/Home.tsx
import { useState } from "react";
import { useNavigate } from "react-router-dom";

export default function Home() {
  const [tag, setTag] = useState("");
  const navigate = useNavigate();

  const handleSearch = () => {
    if (tag) navigate(`/player/${encodeURIComponent(tag)}`);
  };

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-gray-100 p-6">
      <h1 className="text-3xl font-bold text-blue-600 mb-4">
        Clash Royale Deck Tracker ⚔️
      </h1>

      <div className="flex space-x-2 mb-4">
        <input
          type="text"
          placeholder="Digite sua PlayerTag (ex: #PQ02VR90V)"
          className="border rounded-lg px-4 py-2 w-72"
          value={tag}
          onChange={(e) => setTag(e.target.value)}
        />
        <button
          onClick={handleSearch}
          className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700"
        >
          Buscar
        </button>
      </div>

      {/* Botão para acessar o ranking global */}
      <button
        onClick={() => navigate("/global")}
        className="mt-4 bg-purple-600 text-white px-4 py-2 rounded-lg hover:bg-purple-700 shadow-lg"
      >
        🌍 Ver Ranking Global
      </button>
    </div>
  );
}
