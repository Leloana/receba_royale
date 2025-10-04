# 🌍 Coleta Global de Decks — Clash Royale Analytics

Este módulo realiza a **coleta e análise global de decks competitivos** no *Clash Royale*, utilizando a API RoyaleAPI.  
Ele coleta dados de todos os top jogadores por região, calcula taxas de vitória e organiza os decks mais fortes do momento.

---

## 🧠 Visão Geral

O sistema executa automaticamente o seguinte fluxo:

1. Coleta os **top 1000 jogadores por região** (`/locations/{locationId}/pathoflegend/players`)
2. Coleta o **histórico de batalhas** de cada jogador (`/players/{playerTag}/battlelog`)
3. Filtra apenas batalhas dos modos:
   - `Ladder`
   - `Ranked1v1_NewArena2`
4. Agrupa decks por composição de cartas
5. Calcula métricas como:
   - **Winrate (%)**
   - **Intervalo de confiança Wilson**
   - **Taxa bayesiana ajustada**
6. Salva progresso incremental no arquivo `globalCache.json`
7. Expõe resultados via endpoints REST

---

## ⚙️ Endpoints do Backend

### 🔹 **1. Iniciar coleta global**

**POST**
```bash
http://localhost:8080/global/topdecks/start
```
Inicia a coleta de dados globais ou retoma de onde parou (com base no `globalCache.json`).

**Exemplo de resposta:**
```json
{
  "message": "Coleta global iniciada!",
  "startedAt": "2025-10-04T12:00:00Z"
}
```
**Apenas uma coleta pode rodar por vez — se tentar iniciar outra, o backend retornará:**
```json
{ "error": "Já existe uma coleta em andamento!" }
```
### 🔹 **2. Ver status da coleta**
```bash
http://localhost:8080/global/topdecks/status
```
Retorna o progresso atual da coleta.
Exemplo:
```json
{
  "running": true,
  "progressPercent": 63.8,
  "regionsProcessed": 162,
  "totalRegions": 254,
  "totalGames": 305482,
  "totalWins": 152721,
  "elapsedSeconds": 8456
}
```
### 🔹 **3. Obter resultados agregados**
```bash
http://localhost:8080/global/topdecks/aggregate
```
Retorna os decks consolidados com base nas partidas processadas até o momento.

Exemplo:
```json
{
  "summary": {
    "globalMeanWinrate": 54.2,
    "totalGames": 312500
  },
  "stable": [
    {
      "winrate": 67.3,
      "games": 820,
      "wins": 552,
      "cards": [
        { "name": "Knight", "elixirCost": 3, "iconUrl": "..." },
        { "name": "Goblin Barrel", "elixirCost": 3, "iconUrl": "..." }
      ]
    }
  ],
  "trending": [
    { "winrate": 61.8, "games": 120, "cards": [...] }
  ]
}
```
### 🔹 **Configurações Principais**
| Parâmetro                                           | Descrição                                         | Valor padrão         |
| --------------------------------------------------- | ------------------------------------------------- | -------------------- |
| `playerExecutor = Executors.newFixedThreadPool(20)` | Threads simultâneas para processar jogadores      | `20`                 |
| `Thread.sleep(1500)`                                | Delay entre regiões (ms) para evitar rate limit   | `1500`               |
| `Thread.sleep(100)`                                 | Delay entre jogadores (ms)                        | `100`                |
| `MIN_TRENDING`                                      | Partidas mínimas para considerar deck promissor   | `50`                 |
| `MIN_STABLE`                                        | Partidas mínimas para considerar deck consolidado | `200`                |
| `W_PRIOR`                                           | Peso para o cálculo bayesiano                     | `200`                |
| `Z95`                                               | Z-score (95% de confiança) para Wilson            | `1.96`               |
| `globalCache.json`                                  | Caminho do arquivo de cache incremental           | `./globalCache.json` |


### 🎮 **Filtro de modos de jogo**
A coleta filtra apenas os modos de jogo mais competitivos:
```java
String mode = battle.get("gameMode").get("name").asText();
if (!mode.equals("Ladder") && !mode.equals("Ranked1v1_NewArena2")) continue;
```
### 🧱 **Estrutura do Front-End**
```csharp
src/
├── api/
│   └── api.ts              ← Conecta com o backend
├── hooks/
│   ├── usePlayerStats.ts
│   └── useGlobalTopDecks.ts ← Hook que consulta os endpoints acima
├── components/
│   ├── Card.tsx             ← Renderiza carta individual
│   ├── PlayerDecks.tsx      ← Mostra decks do jogador
│   ├── GlobalTopDecks.tsx   ← Mostra ranking global + progresso
│   ├── ProgressBar.tsx
│   └── ...
```

### 🖥️ ** Página Global (GlobalTopDecks.tsx)**
A página contém:

1 - Um botão “Iniciar Coleta Global” que chama o endpoint /start
2 - Uma barra de progresso que usa /status
3 - A lista de decks com melhor desempenho (via /aggregate)

### 🧭 **Atualização automática do progresso**
Dentro do hook useGlobalTopDecks.ts:
```tsx
useEffect(() => {
  const interval = setInterval(refetchStatus, 10000);
  return () => clearInterval(interval);
}, []);

```


