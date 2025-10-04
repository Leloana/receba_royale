import { usePlayerStats } from "../hooks/usePlayerStats";
import { Card } from "./Card"; 

export function PlayerDecks({ playerTag }: { playerTag: string }) {
  const { data, loading, error } = usePlayerStats(playerTag);

  if (loading) return <p className="mt-10 text-center text-gray-500">Carregando...</p>;
  if (error) return <p className="mt-10 text-center text-red-500">Erro: {error}</p>;
  if (!data) return <p className="mt-10 text-center text-gray-500">Nenhum dado encontrado</p>;

  return (
    <div className="mx-auto max-w-4xl space-y-8 p-4">
      {/* Cabeçalho do jogador */}
      <div className="text-center">
        <h2 className="text-3xl font-bold">{data.playerTag}</h2>
        <p className="text-gray-600">
          Winrate geral:{" "}
          <span className="font-semibold text-green-600">
            {data.overallWinrate.toFixed(1)}%
          </span>{" "}
          ({data.wins}/{data.totalBattles} vitórias)
        </p>
      </div>

      {/* Decks */}
      {data.decks.map((deck, i) => (
        <div
          key={i}
          className="rounded-2xl border border-gray-200 bg-white p-5 shadow-lg"
        >
          <div className="mb-4 flex flex-col items-center justify-between sm:flex-row">
            <h3 className="text-xl font-bold text-gray-800">Deck #{i + 1}</h3>
            <p className="text-md text-gray-600">
              {deck.wins}/{deck.games} vitórias —{" "}
              <span className="font-semibold text-green-600">
                {deck.winrate.toFixed(1)}%
              </span>
            </p>
          </div>

          <div className="grid grid-cols-4 gap-2 sm:gap-4">
            {deck.cards.map((card, index) => (
              <Card key={index} card={card} />
            ))}
          </div>
        </div>
      ))}
    </div>
  );
}