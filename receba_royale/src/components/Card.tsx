interface CardData {
  name: string;
  iconUrl: string;
  elixirCost: number;
}

export function Card({ card }: { card: CardData }) {
  return (
    <div className="relative transform cursor-pointer rounded-lg border-4 border-yellow-900 bg-yellow-950 shadow-xl transition-transform duration-200 hover:-translate-y-2 hover:scale-105">
      {/* Imagem da Carta (já é responsiva) */}
      <img
        src={card.iconUrl}
        alt={card.name}
        className="block h-auto w-full rounded-md"
      />

      {/* Custo de Elixir (Círculo Responsivo) */}
      <div 
        // O círculo ocupa 30% da largura da carta.
        // O padding-bottom de 30% força a altura a ser igual à largura, criando um quadrado perfeito.
        className="absolute left-1 top-1 w-[30%] pb-[30%] rounded-full bg-purple-600 shadow-lg ring-2 ring-purple-300"
      >
        <div className="absolute inset-0 flex items-center justify-center">
          <span 
            // O tamanho da fonte se adapta aos breakpoints da tela
            className="font-bold text-white text-xs sm:text-sm md:text-base"
          >
            {card.elixirCost}
          </span>
        </div>
      </div>

      {/* Nome da Carta */}
      <div className="absolute bottom-0 left-0 right-0 bg-black/60 p-1 text-center">
        <p className="truncate text-xs font-semibold text-white sm:text-sm">
          {card.name}
        </p>
      </div>
    </div>
  );
}