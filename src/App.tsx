import { useCards } from "./hooks/useCards";

function nameToString(name: any) {
  if (typeof name === "string") return name;
  if (name?.pt) return name.pt;
  if (name?.en) return name.en;
  if (name?.name) return name.name;
  const first = name && typeof name === "object" ? Object.values(name)[0] : "";
  return String(first ?? "");
}

export default function App() {
  const { data, isLoading, error } = useCards();

  if (isLoading) return <main style={{ padding: 24 }}>Carregando cartas…</main>;
  if (error) return <main style={{ padding: 24, color: "crimson" }}>
    {(error as any)?.message || "Erro ao carregar cartas"}
  </main>;

  return (
    <main style={{ padding: 24, fontFamily: "system-ui" }}>
      <h1>/cards</h1>

      <section style={{ marginTop: 16 }}>
        <h2>Items</h2>
        <ul style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(220px, 1fr))", gap: 12, listStyle: "none", padding: 0 }}>
          {data?.items?.map(card => (
            <li key={`item-${card.id}`} style={{ border: "1px solid #eee", borderRadius: 12, padding: 12 }}>
              {card.iconUrls?.medium && (
                <img src={card.iconUrls.medium} alt={nameToString(card.name)} style={{ width: "100%", borderRadius: 8 }} />
              )}
              <div style={{ marginTop: 8, fontWeight: 600 }}>{nameToString(card.name)}</div>
              <div style={{ fontSize: 12, opacity: 0.8 }}>
                Raridade: {card.rarity} · MaxLvl: {card.maxLevel}
                {card.elixirCost != null && <> · Elixir: {card.elixirCost}</>}
                {card.maxEvolutionLevel != null && <> · EvoMax: {card.maxEvolutionLevel}</>}
              </div>
            </li>
          ))}
        </ul>
      </section>

      <section style={{ marginTop: 24 }}>
        <h2>Support Items</h2>
        <ul style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(220px, 1fr))", gap: 12, listStyle: "none", padding: 0 }}>
          {data?.supportItems?.map(card => (
            <li key={`support-${card.id}`} style={{ border: "1px solid #eee", borderRadius: 12, padding: 12 }}>
              {card.iconUrls?.medium && (
                <img src={card.iconUrls.medium} alt={nameToString(card.name)} style={{ width: "100%", borderRadius: 8 }} />
              )}
              <div style={{ marginTop: 8, fontWeight: 600 }}>{nameToString(card.name)}</div>
              <div style={{ fontSize: 12, opacity: 0.8 }}>
                Raridade: {card.rarity} · MaxLvl: {card.maxLevel}
                {card.elixirCost != null && <> · Elixir: {card.elixirCost}</>}
                {card.maxEvolutionLevel != null && <> · EvoMax: {card.maxEvolutionLevel}</>}
              </div>
            </li>
          ))}
        </ul>
      </section>
    </main>
  );
}
