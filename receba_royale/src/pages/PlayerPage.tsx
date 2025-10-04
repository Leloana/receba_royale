// src/pages/PlayerPage.tsx
import { useParams } from "react-router-dom";
import { PlayerDecks } from "../components/PlayerDecks";

export function PlayerPage() {
  const { tag } = useParams<{ tag: string }>();

  if (!tag) return <p>Tag não informada.</p>;

  // decodifica %23 para # caso venha via URL codificada
  const playerTag = decodeURIComponent(tag);

  return (
    <div className="min-h-screen bg-gray-100 p-6">
      <PlayerDecks playerTag={playerTag} />
    </div>
  );
}
