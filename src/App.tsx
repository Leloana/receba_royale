import { useCards } from "./hooks/useCards";
import ClanWarLogTest from "./components/ClanWarLogTest";
import { useState } from "react";
import "./App.css";

function nameToString(name: any) {
  if (typeof name === "string") return name;
  if (name?.pt) return name.pt;
  if (name?.en) return name.en;
  if (name?.name) return name.name;
  const first = name && typeof name === "object" ? Object.values(name)[0] : "";
  return String(first ?? "");
}

export default function App() {
  const [currentView, setCurrentView] = useState<'cards' | 'warlog'>('cards');
  const { data, isLoading, error } = useCards();

  return (
    <main style={{ 
      fontFamily: "system-ui", 
      minHeight: "100vh",
      background: "var(--bg-primary)"
    }}>
      {/* Header with navigation */}
      <header style={{ 
        background: "var(--bg-secondary)", 
        borderBottom: "1px solid var(--border-color)",
        padding: "1rem 2rem",
        marginBottom: "2rem",
        boxShadow: "0 2px 8px rgba(0, 0, 0, 0.1)"
      }}>
        <div style={{ maxWidth: "1400px", margin: "0 auto", display: "flex", alignItems: "center", gap: "2rem" }}>
          <h1 style={{ 
            margin: 0, 
            fontSize: "1.8rem",
            background: "linear-gradient(45deg, var(--accent-blue), var(--accent-purple))",
            WebkitBackgroundClip: "text",
            WebkitTextFillColor: "transparent",
            backgroundClip: "text"
          }}>
            🏰 Clash Royale API
          </h1>
          
          <nav style={{ display: "flex", gap: "1rem" }}>
            <button 
              onClick={() => setCurrentView('cards')}
              style={{ 
                fontWeight: currentView === 'cards' ? 'bold' : 'normal',
                background: currentView === 'cards' 
                  ? 'linear-gradient(135deg, var(--accent-blue), var(--accent-purple))' 
                  : 'var(--bg-tertiary)',
                border: currentView === 'cards' ? 'none' : '1px solid var(--border-color)',
                color: 'var(--text-primary)',
                padding: '0.5rem 1rem',
                borderRadius: '6px',
                transition: 'all 0.2s ease'
              }}
            >
              🃏 Cards
            </button>
            <button 
              onClick={() => setCurrentView('warlog')}
              style={{ 
                fontWeight: currentView === 'warlog' ? 'bold' : 'normal',
                background: currentView === 'warlog' 
                  ? 'linear-gradient(135deg, var(--accent-blue), var(--accent-purple))' 
                  : 'var(--bg-tertiary)',
                border: currentView === 'warlog' ? 'none' : '1px solid var(--border-color)',
                color: 'var(--text-primary)',
                padding: '0.5rem 1rem',
                borderRadius: '6px',
                transition: 'all 0.2s ease'
              }}
            >
              🏰 Clan Information
            </button>
          </nav>
        </div>
      </header>

      <div style={{ padding: "0 2rem 2rem" }}>
        {currentView === 'warlog' ? (
          <ClanWarLogTest />
        ) : (
          <div className="animate-fade-in">
            <div style={{ marginBottom: "2rem" }}>
              <h2 style={{ color: "var(--text-primary)", fontSize: "2rem", marginBottom: "0.5rem" }}>
                📦 Clash Royale Cards
              </h2>
              <p style={{ color: "var(--text-secondary)", fontSize: "1.1rem" }}>
                See all available cards in the game!
              </p>
            </div>

            {isLoading && (
              <div style={{ 
                padding: 48, 
                textAlign: "center", 
                color: "var(--text-secondary)",
                background: "var(--bg-secondary)",
                borderRadius: "12px",
                border: "1px solid var(--border-color)"
              }}>
                <div style={{ fontSize: "2rem", marginBottom: "1rem" }}>⏳</div>
                Loading cards...
              </div>
            )}
            
            {error && (
              <div style={{ 
                padding: 24, 
                color: "var(--error-color)",
                background: "rgba(239, 68, 68, 0.1)",
                border: "1px solid var(--error-color)",
                borderRadius: "8px",
                marginBottom: "2rem"
              }}>
                <strong>❌ Error:</strong> {(error as any)?.message || "Error loading cards"}
              </div>
            )}

            {data && (
              <>
                <section style={{ marginBottom: "3rem" }}>
                  <h3 style={{ 
                    color: "var(--text-primary)", 
                    fontSize: "1.5rem", 
                    marginBottom: "1.5rem",
                    display: "flex",
                    alignItems: "center",
                    gap: "0.5rem"
                  }}>
                    ⚔️ Combat Cards ({data?.items?.length || 0})
                  </h3>
                  <div style={{ 
                    display: "grid", 
                    gridTemplateColumns: "repeat(auto-fill, minmax(280px, 1fr))", 
                    gap: 20, 
                    listStyle: "none", 
                    padding: 0 
                  }}>
                    {data?.items?.map(card => (
                      <div key={`item-${card.id}`} className="card animate-slide-in" style={{ 
                        background: "var(--bg-tertiary)",
                        border: "1px solid var(--border-color)",
                        borderRadius: 16, 
                        padding: 16,
                        transition: "all 0.2s ease"
                      }}>
                        {card.iconUrls?.medium && (
                          <img 
                            src={card.iconUrls.medium} 
                            alt={nameToString(card.name)} 
                            style={{ 
                              width: "100%", 
                              borderRadius: 12, 
                              marginBottom: "12px",
                              background: "var(--bg-secondary)"
                            }} 
                          />
                        )}
                        <div style={{ 
                          marginBottom: 8, 
                          fontWeight: 600, 
                          fontSize: "1.1rem",
                          color: "var(--text-primary)"
                        }}>
                          {nameToString(card.name)}
                        </div>
                        <div style={{ 
                          fontSize: 14, 
                          color: "var(--text-secondary)",
                          lineHeight: 1.4
                        }}>
                          <span style={{ color: "var(--accent-gold)" }}>Rarity:</span> {card.rarity} • 
                          <span style={{ color: "var(--accent-blue)" }}> MaxLvl:</span> {card.maxLevel}
                          {card.elixirCost != null && (
                            <> • <span style={{ color: "var(--accent-purple)" }}>Elixir:</span> {card.elixirCost}</>
                          )}
                          {card.maxEvolutionLevel != null && (
                            <> • <span style={{ color: "var(--success-color)" }}>EvoMax:</span> {card.maxEvolutionLevel}</>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                </section>

                <section>
                  <h3 style={{ 
                    color: "var(--text-primary)", 
                    fontSize: "1.5rem", 
                    marginBottom: "1.5rem",
                    display: "flex",
                    alignItems: "center",
                    gap: "0.5rem"
                  }}>
                    🛡️ Support Itens({data?.supportItems?.length || 0})
                  </h3>
                  <div style={{ 
                    display: "grid", 
                    gridTemplateColumns: "repeat(auto-fill, minmax(280px, 1fr))", 
                    gap: 20, 
                    listStyle: "none", 
                    padding: 0 
                  }}>
                    {data?.supportItems?.map(card => (
                      <div key={`support-${card.id}`} className="card animate-slide-in" style={{ 
                        background: "var(--bg-tertiary)",
                        border: "1px solid var(--border-color)",
                        borderRadius: 16, 
                        padding: 16,
                        transition: "all 0.2s ease"
                      }}>
                        {card.iconUrls?.medium && (
                          <img 
                            src={card.iconUrls.medium} 
                            alt={nameToString(card.name)} 
                            style={{ 
                              width: "100%", 
                              borderRadius: 12, 
                              marginBottom: "12px",
                              background: "var(--bg-secondary)"
                            }} 
                          />
                        )}
                        <div style={{ 
                          marginBottom: 8, 
                          fontWeight: 600, 
                          fontSize: "1.1rem",
                          color: "var(--text-primary)"
                        }}>
                          {nameToString(card.name)}
                        </div>
                        <div style={{ 
                          fontSize: 14, 
                          color: "var(--text-secondary)",
                          lineHeight: 1.4
                        }}>
                          <span style={{ color: "var(--accent-gold)" }}>Rarity:</span> {card.rarity} • 
                          <span style={{ color: "var(--accent-blue)" }}> MaxLvl:</span> {card.maxLevel}
                          {card.elixirCost != null && (
                            <> • <span style={{ color: "var(--accent-purple)" }}>Elixir:</span> {card.elixirCost}</>
                          )}
                          {card.maxEvolutionLevel != null && (
                            <> • <span style={{ color: "var(--success-color)" }}>EvoMax:</span> {card.maxEvolutionLevel}</>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                </section>
              </>
            )}
          </div>
        )}
      </div>
    </main>
  );
}
