import { useGlobalTopDecks } from "../hooks/useGlobalTopDecks";
import { Card } from "./Card";
import type { DeckData } from "../types/global"
import { ProgressBar } from "./Progressbar";
import { useGlobalDeckData } from "../hooks/useGlobalDeckData";

export function GlobalTopDecks() {
  const { status, loading: statusLoading, startCollection } = useGlobalTopDecks();
  const { data, loading: dataLoading } = useGlobalDeckData();

  const loading = statusLoading || dataLoading;

  if (loading) return <p className="mt-10 text-center text-gray-500">Carregando dados...</p>;
  if (!status && !data)
    return <p className="mt-10 text-center text-red-500">Nenhum dado encontrado</p>;

  const { progressPercent = 0, running = false, regionsProcessed, totalRegions, totalGames } = status || {};
  const stable = data?.stable || [];
  const trending = data?.trending || [];

  return (
    <div className="mx-auto max-w-5xl p-6 space-y-8">
      {/* Header */}
      <div className="text-center">
        <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
          🌍 Ranking Global de Decks
        </h1>
        <p className="text-gray-500">
          Regiões processadas: {regionsProcessed}/{totalRegions} •{" "}
          {totalGames?.toLocaleString() || 0} partidas
        </p>
      </div>

      {/* Botão iniciar e progresso */}
      <div className="flex flex-col items-center space-y-4">
        <button
          onClick={startCollection}
          disabled={running}
          className={`rounded-lg px-6 py-2 font-semibold text-white shadow-lg transition ${
            running
              ? "bg-gray-400 cursor-not-allowed"
              : "bg-purple-600 hover:bg-purple-700"
          }`}
        >
          {running ? "Coleta em andamento..." : "Iniciar Coleta Global"}
        </button>

        <div className="w-full max-w-lg">
          <ProgressBar progress={progressPercent} />
          <p className="mt-1 text-center text-sm text-gray-600">
            {progressPercent.toFixed(1)}% concluído
          </p>
        </div>
      </div>

      {/* Ranking de Decks Estáveis */}
      {stable.length > 0 && (
        <div>
          <h2 className="mb-4 text-2xl font-bold text-green-600">🏆 Decks Consolidados</h2>
          {stable.slice(0, 10).map((deck: DeckData, i: number) => (
            <div
              key={i}
              className="mb-6 rounded-xl border border-gray-200 bg-white p-4 shadow-lg dark:bg-gray-900"
            >
              <div className="mb-2 flex items-center justify-between">
                <h3 className="text-lg font-bold text-gray-800 dark:text-gray-100">
                  #{i + 1} — {deck.winrate.toFixed(1)}%
                </h3>
                <p className="text-sm text-gray-500">
                  {deck.wins}/{deck.games} vitórias
                </p>
              </div>
              <div className="grid grid-cols-4 gap-2 sm:gap-3">
                {deck.cards.map((card: any, idx: number) => (
                  <Card key={idx} card={card} />
                ))}
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Decks Promissores */}
      {trending.length > 0 && (
        <div>
          <h2 className="mb-4 text-2xl font-bold text-yellow-600">🔥 Decks Promissores</h2>
          {trending.slice(0, 10).map((deck: DeckData, i: number) => (
            <div
              key={i}
              className="mb-6 rounded-xl border border-gray-200 bg-white p-4 shadow-lg dark:bg-gray-900"
            >
              <div className="mb-2 flex items-center justify-between">
                <h3 className="text-lg font-bold text-gray-800 dark:text-gray-100">
                  #{i + 1} — {deck.winrate.toFixed(1)}%
                </h3>
                <p className="text-sm text-gray-500">
                  {deck.wins}/{deck.games} vitórias
                </p>
              </div>
              <div className="grid grid-cols-4 gap-2 sm:gap-3">
                {deck.cards.map((card: any, idx: number) => (
                  <Card key={idx} card={card} />
                ))}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
