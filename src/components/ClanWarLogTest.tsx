import { useState } from 'react';
import { getClanInfo, getCurrentWar, getRiverRaceLog, getClanWarLog, type ClanInfo, type CurrentWar, type RiverRaceLog } from '../api/endpoints/clan';

interface TestResults {
  clanInfo: { success: boolean; data?: ClanInfo; error?: string };
  currentWar: { success: boolean; data?: CurrentWar; error?: string };
  riverRaceLog: { success: boolean; data?: RiverRaceLog; error?: string };
  warLog: { success: boolean; data?: any; error?: string };
}

export default function ClanWarLogTest() {
  const [clanTag, setClanTag] = useState('#9VUPUQJP');
  const [inputTag, setInputTag] = useState(clanTag);
  const [testResult, setTestResult] = useState<string>('');
  const [results, setResults] = useState<TestResults | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setClanTag(inputTag);
    testAllEndpoints();
  }

  // Test all endpoints
  async function testAllEndpoints() {
    try {
      setIsLoading(true);
      setTestResult('Testing all available endpoints...\n');
      setResults(null);
      
      const testResults: TestResults = {
        clanInfo: { success: false },
        currentWar: { success: false },
        riverRaceLog: { success: false },
        warLog: { success: false }
      };

      // 1. Test basic clan info
      try {
        const clanInfoResult = await getClanInfo(clanTag);
        testResults.clanInfo = { success: true, data: clanInfoResult.data };
        setTestResult(prev => prev + `✅ Clan info: ${clanInfoResult.data.name}\n`);
      } catch (error: any) {
        testResults.clanInfo = { success: false, error: `${error.response?.status} - ${error.response?.statusText}` };
        setTestResult(prev => prev + `❌ Clan info: ${error.response?.status}\n`);
      }

      // 2. Test current war
      try {
        const currentWarResult = await getCurrentWar(clanTag);
        testResults.currentWar = { success: true, data: currentWarResult.data };
        setTestResult(prev => prev + `✅ Current war: State ${currentWarResult.data.state}\n`);
      } catch (error: any) {
        const errorData = error.response?.data;
        if (errorData?.reason === 'notFound' && errorData?.message?.includes('temporarily disabled')) {
          testResults.currentWar = { success: false, error: 'Endpoint temporarily disabled' };
          setTestResult(prev => prev + `⚠️ Current war: Temporarily disabled\n`);
        } else {
          testResults.currentWar = { success: false, error: `${error.response?.status} - ${error.response?.statusText}` };
          setTestResult(prev => prev + `❌ Current war: ${error.response?.status}\n`);
        }
      }

      // 3. Test river race log
      try {
        const riverRaceResult = await getRiverRaceLog(clanTag);
        testResults.riverRaceLog = { success: true, data: riverRaceResult.data };
        setTestResult(prev => prev + `✅ River Race Log: ${riverRaceResult.data.items?.length || 0} seasons\n`);
      } catch (error: any) {
        testResults.riverRaceLog = { success: false, error: `${error.response?.status} - ${error.response?.statusText}` };
        setTestResult(prev => prev + `❌ River Race Log: ${error.response?.status}\n`);
      }

      // 4. Testar war log
      try {
        const warLogResult = await getClanWarLog(clanTag);
        testResults.warLog = { success: true, data: warLogResult.data };
        setTestResult(prev => prev + `✅ War Log: ${warLogResult.data?.length || 'N/A'} entradas\n`);
      } catch (error: any) {
        const errorData = error.response?.data;
        if (errorData?.reason === 'notFound' && errorData?.message?.includes('temporarily disabled')) {
          testResults.warLog = { success: false, error: 'Endpoint temporarily disabled by Supercell' };
          setTestResult(prev => prev + `⚠️ War Log: Temporarily disabled\n`);
        } else {
          testResults.warLog = { success: false, error: `${error.response?.status} - ${error.response?.statusText}` };
          setTestResult(prev => prev + `❌ War Log: ${error.response?.status}\n`);
        }
      }

      setResults(testResults);
      setTestResult(prev => prev + '\n✅ Test completed!');
      
    } catch (error: any) {
      console.error('General test error:', error);
      setTestResult(`❌ General error: ${error.message}`);
    } finally {
      setIsLoading(false);
    }
  }

  // Format date for display
  function formatDate(dateStr?: string) {
    if (!dateStr) return '';
    return new Date(dateStr).toLocaleString('en-US');
  }

  // Format role to Portuguese
  function formatRole(role: string) {
    const roles: { [key: string]: string } = {
      'member': 'Member',
      'elder': 'Elder',
      'coLeader': 'Co-Leader',
      'leader': 'Leader'
    };
    return roles[role] || role;
  }

  return (
    <div className="animate-fade-in">
      <div style={{ marginBottom: "2rem" }}>
        <h2 style={{ 
          color: "var(--text-primary)", 
          fontSize: "2rem", 
          marginBottom: "0.5rem",
          display: "flex",
          alignItems: "center",
          gap: "0.5rem"
        }}>
          Complete Clan Information
        </h2>
        <p style={{ color: "var(--text-secondary)", fontSize: "1.1rem" }}>
          Explore detailed data from any Clash Royale clan
        </p>
      </div>
      
      <div style={{ 
        marginBottom: 24, 
        padding: 20, 
        background: "rgba(245, 158, 11, 0.1)", 
        border: "1px solid var(--warning-color)", 
        borderRadius: 12,
        boxShadow: "0 2px 8px rgba(0, 0, 0, 0.1)"
      }}>
        <h3 style={{ 
          margin: '0 0 12px 0', 
          color: "var(--warning-color)",
          display: "flex",
          alignItems: "center",
          gap: "0.5rem"
        }}>
          Endpoints Status
        </h3>
        <div style={{ 
          display: "grid", 
          gridTemplateColumns: "repeat(auto-fit, minmax(250px, 1fr))", 
          gap: "12px",
          color: "var(--text-secondary)" 
        }}>
          <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
            <span style={{ color: "var(--success-color)" }}>✅</span>
            <strong>Clan Information:</strong> Working
          </div>
          <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
            <span style={{ color: "var(--success-color)" }}>✅</span>
            <strong>River Race Log:</strong> Working
          </div>
          <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
            <span style={{ color: "var(--warning-color)" }}>⚠️</span>
            <strong>War Log:</strong> Temporarily disabled
          </div>
          <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
            <span style={{ color: "var(--warning-color)" }}>⚠️</span>
            <strong>Current War:</strong> May be disabled
          </div>
        </div>
      </div>
      
      <form onSubmit={handleSubmit} style={{ 
        marginBottom: 32,
        padding: 20,
        background: "var(--bg-secondary)",
        border: "1px solid var(--border-color)",
        borderRadius: 12,
        boxShadow: "0 2px 8px rgba(0, 0, 0, 0.1)"
      }}>
        <div style={{ display: "flex", flexWrap: "wrap", gap: "12px", alignItems: "center" }}>
          <input 
            type="text" 
            value={inputTag} 
            onChange={e => setInputTag(e.target.value)} 
            placeholder="Enter clan tag (e.g.: #9VUPUQJP)"
            style={{ 
              flex: "1",
              minWidth: "250px",
              padding: "12px 16px",
              background: "var(--bg-tertiary)",
              border: "1px solid var(--border-color)",
              borderRadius: 8,
              color: "var(--text-primary)",
              fontSize: "1rem"
            }}
          />
          <button 
            type="submit" 
            disabled={isLoading}
            style={{ 
              padding: '12px 24px', 
              background: isLoading 
                ? 'var(--bg-tertiary)' 
                : 'linear-gradient(135deg, var(--accent-blue), var(--accent-purple))',
              color: 'white',
              border: 'none',
              borderRadius: 8,
              cursor: isLoading ? 'not-allowed' : 'pointer',
              fontSize: "1rem",
              fontWeight: "600",
              minWidth: "200px",
              transition: "all 0.2s ease"
            }}
          >
            {isLoading ? 'Loading...' : 'Search All Information'}
          </button>
        </div>
      </form>

      {testResult && (
        <div style={{ 
          marginBottom: 24, 
          padding: 16, 
          background: "var(--bg-tertiary)", 
          borderRadius: 8,
          whiteSpace: 'pre-wrap',
          fontFamily: 'monospace',
          fontSize: 14,
          border: "1px solid var(--border-color)",
          color: "var(--text-primary)"
        }}>
          <strong style={{ color: "var(--accent-blue)" }}>📋 Test Log:</strong><br />
          {testResult}
        </div>
      )}

      {/* Clan Information */}
      {results?.clanInfo.success && results.clanInfo.data && (
        <div className="card animate-slide-in" style={{ 
          marginBottom: 24, 
          padding: 20, 
          background: "var(--bg-secondary)",
          border: "1px solid var(--border-color)", 
          borderRadius: 12,
          boxShadow: "0 4px 12px rgba(0, 0, 0, 0.1)"
        }}>
          <h3 style={{ 
            color: "var(--text-primary)",
            marginBottom: "20px",
            display: "flex",
            alignItems: "center",
            gap: "0.5rem",
            fontSize: "1.4rem"
          }}>
            Clan Information
          </h3>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: 20 }}>
            <div style={{ 
              padding: 16,
              background: "var(--bg-tertiary)",
              borderRadius: 8,
              border: "1px solid var(--border-color)"
            }}>
              <p style={{ color: "var(--text-primary)", margin: "8px 0" }}>
                <strong style={{ color: "var(--accent-gold)" }}>Name:</strong> {results.clanInfo.data.name}
              </p>
              <p style={{ color: "var(--text-primary)", margin: "8px 0" }}>
                <strong style={{ color: "var(--accent-gold)" }}>Tag:</strong> {results.clanInfo.data.tag}
              </p>
              <p style={{ color: "var(--text-primary)", margin: "8px 0" }}>
                <strong style={{ color: "var(--accent-gold)" }}>Type:</strong> {results.clanInfo.data.type}
              </p>
              <p style={{ color: "var(--text-primary)", margin: "8px 0" }}>
                <strong style={{ color: "var(--accent-blue)" }}>Clan Trophies:</strong> {results.clanInfo.data.clanScore?.toLocaleString()}
              </p>
              <p style={{ color: "var(--text-primary)", margin: "8px 0" }}>
                <strong style={{ color: "var(--accent-purple)" }}>War Trophies:</strong> {results.clanInfo.data.clanWarTrophies?.toLocaleString()}
              </p>
            </div>
            <div style={{ 
              padding: 16,
              background: "var(--bg-tertiary)",
              borderRadius: 8,
              border: "1px solid var(--border-color)"
            }}>
              <p style={{ color: "var(--text-primary)", margin: "8px 0" }}>
                <strong style={{ color: "var(--success-color)" }}>Members:</strong> {results.clanInfo.data.memberCount}/50
              </p>
              <p style={{ color: "var(--text-primary)", margin: "8px 0" }}>
                <strong style={{ color: "var(--accent-blue)" }}>Required Trophies:</strong> {results.clanInfo.data.requiredTrophies?.toLocaleString()}
              </p>
              <p style={{ color: "var(--text-primary)", margin: "8px 0" }}>
                <strong style={{ color: "var(--accent-purple)" }}>Donations/Week:</strong> {results.clanInfo.data.donationsPerWeek?.toLocaleString()}
              </p>
              {results.clanInfo.data.location && (
                <p style={{ color: "var(--text-primary)", margin: "8px 0" }}>
                  <strong style={{ color: "var(--accent-gold)" }}>Location:</strong> {results.clanInfo.data.location.name}
                </p>
              )}
            </div>
          </div>
          
          {results.clanInfo.data.description && (
            <div style={{ marginTop: 20 }}>
              <p style={{ color: "var(--text-primary)", margin: "8px 0" }}>
                <strong style={{ color: "var(--accent-gold)" }}>Description:</strong>
              </p>
              <p style={{ 
                fontStyle: 'italic', 
                background: "var(--bg-tertiary)", 
                padding: 16, 
                borderRadius: 8,
                color: "var(--text-secondary)",
                border: "1px solid var(--border-color)",
                margin: 0
              }}>
                {results.clanInfo.data.description}
              </p>
            </div>
          )}

          {/* Members List */}
          {results.clanInfo.data.members && results.clanInfo.data.members.length > 0 && (
            <div style={{ marginTop: 24 }}>
              <h4 style={{ 
                color: "var(--text-primary)",
                marginBottom: "16px",
                display: "flex",
                alignItems: "center",
                gap: "0.5rem"
              }}>
                👥 Members ({results.clanInfo.data.members.length})
              </h4>
              <div style={{ 
                maxHeight: 400, 
                overflow: 'auto',
                background: "var(--bg-tertiary)",
                borderRadius: 8,
                border: "1px solid var(--border-color)"
              }}>
                <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 14 }}>
                  <thead>
                    <tr style={{ background: "var(--bg-secondary)", position: 'sticky', top: 0 }}>
                      <th style={{ padding: 12, textAlign: 'left', color: "var(--text-primary)", borderBottom: "1px solid var(--border-color)" }}>Name</th>
                      <th style={{ padding: 12, textAlign: 'center', color: "var(--text-primary)", borderBottom: "1px solid var(--border-color)" }}>Role</th>
                      <th style={{ padding: 12, textAlign: 'center', color: "var(--text-primary)", borderBottom: "1px solid var(--border-color)" }}>Trophies</th>
                      <th style={{ padding: 12, textAlign: 'center', color: "var(--text-primary)", borderBottom: "1px solid var(--border-color)" }}>Level</th>
                      <th style={{ padding: 12, textAlign: 'center', color: "var(--text-primary)", borderBottom: "1px solid var(--border-color)" }}>Donations</th>
                      <th style={{ padding: 12, textAlign: 'center', color: "var(--text-primary)", borderBottom: "1px solid var(--border-color)" }}>Received</th>
                      <th style={{ padding: 12, textAlign: 'center', color: "var(--text-primary)", borderBottom: "1px solid var(--border-color)" }}>Rank</th>
                    </tr>
                  </thead>
                  <tbody>
                    {results.clanInfo.data.members
                      .sort((a, b) => a.clanRank - b.clanRank)
                      .map((member) => (
                      <tr key={member.tag} style={{ borderBottom: "1px solid var(--border-color)" }}>
                        <td style={{ padding: 12, color: "var(--text-primary)" }}>{member.name}</td>
                        <td style={{ padding: 12, textAlign: 'center' }}>
                          <span style={{ 
                            backgroundColor: member.role === 'leader' ? 'var(--accent-gold)' : 
                                           member.role === 'coLeader' ? '#ff6b35' :
                                           member.role === 'elder' ? 'var(--accent-blue)' : 'var(--bg-secondary)',
                            color: member.role === 'leader' || member.role === 'coLeader' ? '#000' : 'var(--text-primary)',
                            padding: '4px 12px',
                            borderRadius: 12,
                            fontSize: 12,
                            fontWeight: 'bold'
                          }}>
                            {formatRole(member.role)}
                          </span>
                        </td>
                        <td style={{ padding: 12, textAlign: 'center', color: "var(--accent-purple)" }}>{member.trophies?.toLocaleString()}</td>
                        <td style={{ padding: 12, textAlign: 'center', color: "var(--text-secondary)" }}>{member.expLevel}</td>
                        <td style={{ padding: 12, textAlign: 'center', color: "var(--success-color)" }}>{member.donations?.toLocaleString()}</td>
                        <td style={{ padding: 12, textAlign: 'center', color: "var(--accent-blue)" }}>{member.donationsReceived?.toLocaleString()}</td>
                        <td style={{ padding: 12, textAlign: 'center', color: "var(--accent-gold)" }}>#{member.clanRank}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}
        </div>
      )}

      {/* Current War */}
      {results?.currentWar.success && results.currentWar.data && (
        <div className="card animate-slide-in" style={{ 
          marginBottom: 24, 
          padding: 20, 
          background: "var(--bg-secondary)",
          border: "1px solid var(--border-color)", 
          borderRadius: 12,
          boxShadow: "0 4px 12px rgba(0, 0, 0, 0.1)"
        }}>
          <h3 style={{ 
            color: "var(--text-primary)",
            marginBottom: "20px",
            display: "flex",
            alignItems: "center",
            gap: "0.5rem",
            fontSize: "1.4rem"
          }}>
            ⚔️ Current War
          </h3>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', gap: 20 }}>
            <div style={{ 
              padding: 16,
              background: "var(--bg-tertiary)",
              borderRadius: 8,
              border: "1px solid var(--border-color)"
            }}>
              <p style={{ color: "var(--text-primary)", margin: "8px 0" }}>
                <strong style={{ color: "var(--accent-gold)" }}>State:</strong> 
                <span style={{ 
                  backgroundColor: results.currentWar.data.state === 'warDay' ? 'var(--success-color)' : 
                                 results.currentWar.data.state === 'collectionDay' ? 'var(--warning-color)' : 'var(--bg-secondary)',
                  padding: '4px 12px',
                  borderRadius: 6,
                  marginLeft: 8,
                  color: results.currentWar.data.state === 'warDay' || results.currentWar.data.state === 'collectionDay' ? '#000' : 'var(--text-primary)'
                }}>
                  {results.currentWar.data.state}
                </span>
              </p>
              <p style={{ color: "var(--text-primary)", margin: "8px 0" }}>
                <strong style={{ color: "var(--accent-blue)" }}>War End:</strong> {formatDate(results.currentWar.data.warEndTime)}
              </p>
            </div>
            <div style={{ 
              padding: 16,
              background: "var(--bg-tertiary)",
              borderRadius: 8,
              border: "1px solid var(--border-color)"
            }}>
              <p style={{ color: "var(--text-primary)", margin: "8px 0" }}>
                <strong style={{ color: "var(--success-color)" }}>Participants:</strong> {results.currentWar.data.clan.participants}
              </p>
              <p style={{ color: "var(--text-primary)", margin: "8px 0" }}>
                <strong style={{ color: "var(--accent-blue)" }}>Battles:</strong> {results.currentWar.data.clan.battlesPlayed}
              </p>
              <p style={{ color: "var(--text-primary)", margin: "8px 0" }}>
                <strong style={{ color: "var(--accent-purple)" }}>Wins:</strong> {results.currentWar.data.clan.wins}
              </p>
              <p style={{ color: "var(--text-primary)", margin: "8px 0" }}>
                <strong style={{ color: "var(--accent-gold)" }}>Crowns:</strong> {results.currentWar.data.clan.crowns}
              </p>
            </div>
          </div>

          {results.currentWar.data.participants && results.currentWar.data.participants.length > 0 && (
            <div style={{ marginTop: 20 }}>
              <h4 style={{ 
                color: "var(--text-primary)",
                marginBottom: "16px",
                display: "flex",
                alignItems: "center",
                gap: "0.5rem"
              }}>
                👥 War Participants
              </h4>
              <div style={{ 
                maxHeight: 300, 
                overflow: 'auto',
                background: "var(--bg-tertiary)",
                borderRadius: 8,
                border: "1px solid var(--border-color)"
              }}>
                <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 14 }}>
                  <thead>
                    <tr style={{ background: "var(--bg-secondary)", position: 'sticky', top: 0 }}>
                      <th style={{ padding: 12, textAlign: 'left', color: "var(--text-primary)", borderBottom: "1px solid var(--border-color)" }}>Name</th>
                      <th style={{ padding: 12, textAlign: 'center', color: "var(--text-primary)", borderBottom: "1px solid var(--border-color)" }}>Cards Earned</th>
                      <th style={{ padding: 12, textAlign: 'center', color: "var(--text-primary)", borderBottom: "1px solid var(--border-color)" }}>Battles</th>
                      <th style={{ padding: 12, textAlign: 'center', color: "var(--text-primary)", borderBottom: "1px solid var(--border-color)" }}>Wins</th>
                      <th style={{ padding: 12, textAlign: 'center', color: "var(--text-primary)", borderBottom: "1px solid var(--border-color)" }}>Collection</th>
                    </tr>
                  </thead>
                  <tbody>
                    {results.currentWar.data.participants
                      .sort((a, b) => b.cardsEarned - a.cardsEarned)
                      .map((participant) => (
                      <tr key={participant.tag} style={{ borderBottom: "1px solid var(--border-color)" }}>
                        <td style={{ padding: 12, color: "var(--text-primary)" }}>{participant.name}</td>
                        <td style={{ padding: 12, textAlign: 'center', color: "var(--accent-gold)" }}>{participant.cardsEarned}</td>
                        <td style={{ padding: 12, textAlign: 'center', color: "var(--accent-blue)" }}>{participant.battlesPlayed}</td>
                        <td style={{ padding: 12, textAlign: 'center', color: "var(--success-color)" }}>{participant.wins}</td>
                        <td style={{ padding: 12, textAlign: 'center', color: "var(--text-secondary)" }}>{participant.collectionDayBattlesPlayed}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}
        </div>
      )}

      {/* River Race Log */}
      {results?.riverRaceLog.success && results.riverRaceLog.data && (
        <div className="card animate-slide-in" style={{ 
          marginBottom: 24, 
          padding: 20, 
          background: "var(--bg-secondary)",
          border: "1px solid var(--border-color)", 
          borderRadius: 12,
          boxShadow: "0 4px 12px rgba(0, 0, 0, 0.1)"
        }}>
          <h3 style={{ 
            color: "var(--text-primary)",
            marginBottom: "20px",
            display: "flex",
            alignItems: "center",
            gap: "0.5rem",
            fontSize: "1.4rem"
          }}>
            🏆 River Race History
          </h3>
          {results.riverRaceLog.data.items && results.riverRaceLog.data.items.length > 0 ? (
            <div style={{ display: 'grid', gap: 20 }}>
              {results.riverRaceLog.data.items.slice(0, 5).map((race, index) => (
                <div key={index} style={{ 
                  background: "var(--bg-tertiary)",
                  border: "1px solid var(--border-color)", 
                  borderRadius: 12, 
                  padding: 20
                }}>
                  <div style={{ marginBottom: 16 }}>
                    <strong style={{ color: "var(--accent-gold)", fontSize: "1.1rem" }}>
                      Season {race.seasonId}
                    </strong>
                    <span style={{ color: "var(--text-secondary)" }}> - Section {race.sectionIndex}</span>
                    <br />
                    <small style={{ color: "var(--text-secondary)" }}>{formatDate(race.createdDate)}</small>
                  </div>
                  
                  {race.standings && race.standings.length > 0 && (
                    <div>
                      <h5 style={{ 
                        margin: '0 0 12px 0', 
                        color: "var(--text-primary)",
                        display: "flex",
                        alignItems: "center",
                        gap: "0.5rem"
                      }}>
                        🥇 Final Standings
                      </h5>
                      <div style={{ 
                        background: "var(--bg-primary)",
                        borderRadius: 8,
                        overflow: "hidden",
                        border: "1px solid var(--border-color)"
                      }}>
                        <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 14 }}>
                          <thead>
                            <tr style={{ background: "var(--bg-secondary)" }}>
                              <th style={{ padding: 10, textAlign: 'left', color: "var(--text-primary)" }}>Pos</th>
                              <th style={{ padding: 10, textAlign: 'left', color: "var(--text-primary)" }}>Clan</th>
                              <th style={{ padding: 10, textAlign: 'center', color: "var(--text-primary)" }}>Trophies</th>
                            </tr>
                          </thead>
                          <tbody>
                            {race.standings.slice(0, 4).map((standing, idx) => (
                              <tr key={idx} style={{ borderBottom: "1px solid var(--border-color)" }}>
                                <td style={{ padding: 10 }}>
                                  <span style={{
                                    backgroundColor: standing.rank === 1 ? 'var(--accent-gold)' :
                                                   standing.rank === 2 ? '#c0c0c0' :
                                                   standing.rank === 3 ? '#cd7f32' : 'transparent',
                                    color: standing.rank <= 3 ? '#000' : 'var(--text-primary)',
                                    padding: '4px 8px',
                                    borderRadius: 12,
                                    fontSize: 12,
                                    fontWeight: 'bold',
                                    minWidth: '24px',
                                    display: 'inline-block',
                                    textAlign: 'center'
                                  }}>
                                    #{standing.rank}
                                  </span>
                                </td>
                                <td style={{ padding: 10, color: "var(--text-primary)" }}>{standing.clan.name}</td>
                                <td style={{ padding: 10, textAlign: 'center' }}>
                                  <span style={{ 
                                    color: standing.trophyChange > 0 ? 'var(--success-color)' : 
                                           standing.trophyChange < 0 ? 'var(--error-color)' : 'var(--text-secondary)',
                                    fontWeight: 'bold'
                                  }}>
                                    {standing.trophyChange > 0 ? '+' : ''}{standing.trophyChange}
                                  </span>
                                </td>
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      </div>
                    </div>
                  )}
                </div>
              ))}
            </div>
          ) : (
            <p style={{ color: "var(--text-secondary)" }}>No River Race data found.</p>
          )}
        </div>
      )}

      {/* Error Messages */}
      {results && (
        <div style={{ marginTop: 24 }}>
          {!results.clanInfo.success && (
            <div style={{ 
              marginBottom: 12, 
              padding: 16, 
              background: "rgba(239, 68, 68, 0.1)", 
              border: "1px solid var(--error-color)", 
              borderRadius: 8,
              color: "var(--error-color)"
            }}>
              <strong>❌ Error in clan information:</strong> {results.clanInfo.error}
            </div>
          )}
          
          {!results.currentWar.success && (
            <div style={{ 
              marginBottom: 12, 
              padding: 16, 
              background: "rgba(245, 158, 11, 0.1)", 
              border: "1px solid var(--warning-color)", 
              borderRadius: 8,
              color: "var(--warning-color)"
            }}>
              <strong>⚠️ Current war not available:</strong> {results.currentWar.error}
            </div>
          )}
          
          {!results.riverRaceLog.success && (
            <div style={{ 
              marginBottom: 12, 
              padding: 16, 
              background: "rgba(239, 68, 68, 0.1)", 
              border: "1px solid var(--error-color)", 
              borderRadius: 8,
              color: "var(--error-color)"
            }}>
              <strong>❌ Error in River Race log:</strong> {results.riverRaceLog.error}
            </div>
          )}
          
          {!results.warLog.success && (
            <div style={{ 
              marginBottom: 12, 
              padding: 16, 
              background: "rgba(245, 158, 11, 0.1)", 
              border: "1px solid var(--warning-color)", 
              borderRadius: 8,
              color: "var(--warning-color)"
            }}>
              <strong>⚠️ War Log not available:</strong> {results.warLog.error}
            </div>
          )}
        </div>
      )}

      {!results && !isLoading && (
        <div style={{ 
          padding: 60, 
          textAlign: 'center', 
          color: "var(--text-secondary)",
          background: "var(--bg-secondary)",
          borderRadius: 12,
          border: "1px solid var(--border-color)"
        }}>
          <div style={{ fontSize: "3rem", marginBottom: "1rem" }}>🏰</div>
          <p style={{ fontSize: "1.2rem", margin: 0 }}>
            Enter a clan tag and click "Search All Information" to see the complete data.
          </p>
        </div>
      )}
    </div>
  );
}
