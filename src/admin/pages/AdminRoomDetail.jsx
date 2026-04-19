import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import styled from "styled-components";
import { apiGet } from "../../services/api";

const Container = styled.div`
  max-width: 1400px;
  margin: 0 auto;
  padding: 20px;
  font-family: 'Inter', sans-serif;
`;

const Header = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 30px;
  padding-bottom: 20px;
  border-bottom: 2px solid #eee;
`;

const Title = styled.h2`
  color: #1f2937;
  margin: 0;
  font-size: 28px;
  font-weight: 700;
`;

const Status = styled.span`
  padding: 8px 16px;
  border-radius: 20px;
  font-weight: 600;
  font-size: 14px;
  background: ${props => props.isclosed ? '#fee2e2' : '#d1fae5'};
  color: ${props => props.isclosed ? '#dc2626' : '#059669'};
`;

const BackButton = styled.button`
  background: #3b82f6;
  color: white;
  border: none;
  padding: 12px 24px;
  border-radius: 12px;
  cursor: pointer;
  font-weight: 600;
  transition: all 0.2s;
  &:hover { background: #2563eb; transform: translateY(-1px); }
`;

const Grid = styled.div`
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 24px;
  margin-bottom: 24px;
`;

const Card = styled.div`
  background: white;
  padding: 24px;
  border-radius: 16px;
  box-shadow: 0 4px 20px rgba(0,0,0,0.08);
  border: 1px solid #f1f5f9;
`;

const CardTitle = styled.h3`
  margin: 0 0 20px 0;
  color: #1e293b;
  font-size: 18px;
  font-weight: 600;
  display: flex;
  align-items: center;
  gap: 8px;
`;

const WorkspaceCompare = styled.div`
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 20px;
`;

const WorkspaceSection = styled.div`
  background: ${props => props.isOfficial ? '#f0f9ff' : '#fef3c7'};
  border: 2px solid ${props => props.isOfficial ? '#0ea5e9' : '#f59e0b'};
  border-radius: 12px;
  padding: 20px;
`;

const SectionLabel = styled.div`
  font-size: 14px;
  font-weight: 600;
  margin-bottom: 12px;
  color: ${props => props.isOfficial ? '#0369a1' : '#b45309'};
`;

const PseudocodeBox = styled.pre`
  background: white;
  padding: 16px;
  border-radius: 8px;
  font-family: 'Monaco', monospace;
  font-size: 13px;
  line-height: 1.5;
  white-space: pre-wrap;
  border-left: 4px solid ${props => props.isOfficial ? '#0ea5e9' : '#f59e0b'};
  margin: 0;
  max-height: 200px;
  overflow-y: auto;
`;

const FlowchartBox = styled.div`
  background: white;
  padding: 16px;
  border-radius: 8px;
  margin-top: 12px;
  border-left: 4px solid ${props => props.isOfficial ? '#0ea5e9' : '#f59e0b'};
`;

const MembersList = styled.div`
  max-height: 300px;
  overflow-y: auto;
`;

const MemberItem = styled.div`
  padding: 12px;
  background: #f8fafc;
  margin-bottom: 8px;
  border-radius: 8px;
  font-weight: 500;
  &:last-child { margin-bottom: 0; }
`;

const Loading = styled.div`
  text-align: center;
  padding: 60px;
  color: #6b7280;
  font-size: 18px;
`;

export default function AdminRoomDetail() {
  const { roomId } = useParams();
  const navigate = useNavigate();

  const [roomMeta, setRoomMeta] = useState(null);
  const [members, setMembers] = useState([]);
  const [workspace, setWorkspace] = useState(null); // Workspace siswa
  const [materiAnswer, setMateriAnswer] = useState(null); // Jawaban resmi admin
  const [attempts, setAttempts] = useState([]);
  const [clueInfo, setClueInfo] = useState({ used: 0, max: 3 });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchData();
  }, [roomId]);

  const fetchData = async () => {
    setLoading(true);
    try {
      // Room info + materiAnswer
      const roomRes = await apiGet(`/admin/discussion/room/${roomId}`);
      if (roomRes.status && roomRes.data) {
        setRoomMeta(roomRes.data.room);
        setClueInfo(roomRes.data.clue || { used: 0, max: 3 });
        setMateriAnswer(roomRes.data.materiAnswer); // Jawaban resmi
      }

      // Members
      const membersRes = await apiGet(`/admin/discussion/room/${roomId}/members`);
      setMembers(membersRes.data || []);

      // Workspace siswa TERBARU
      const workspaceRes = await apiGet(`/admin/discussion/workspace/latest/${roomId}`);
      if (workspaceRes.status && workspaceRes.data) {
        setWorkspace(workspaceRes.data);
      }

      // Attempts
      const attemptsRes = await apiGet(`/admin/discussion/workspace/attempts/${roomId}`);
      if (attemptsRes.status) setAttempts(attemptsRes.data || []);

    } catch (error) {
      console.error("Fetch error:", error);
    } finally {
      setLoading(false);
    }
  };

const renderFlowchartPreview = (flowchartData, isEditable = false) => {
  if (!flowchartData?.conditions?.length && !flowchartData?.elseInstruction) {
    return <div style={{ color: '#9ca3af', fontStyle: 'italic', padding: '20px', textAlign: 'center' }}>Belum ada flowchart</div>;
  }

  const conditions = Array.isArray(flowchartData.conditions) ? flowchartData.conditions : [];
  const height = 160 + conditions.length * 180 + (flowchartData.elseInstruction ? 120 : 0);

  return (
    <div style={{ height: '300px', border: '2px solid #e5e7eb', borderRadius: '12px', overflow: 'auto' }}>
      <svg
        width="100%"
        height={height}
        viewBox={`160 0 640 ${height}`}
        preserveAspectRatio="xMidYMid meet"
      >
        <defs>
          <marker id="arrow" markerWidth="6" markerHeight="6" refX="5" refY="3" orient="auto">
            <path d="M0,0 L0,6 L6,3 z" fill="#666" />
          </marker>
        </defs>

        {/* START */}
        <ellipse cx="300" cy="80" rx="70" ry="30" fill="#fff" stroke="#666" strokeWidth="2"/>
        <text x="300" y="85" textAnchor="middle" fontSize="12" fontWeight="bold" fill="#666">Mulai</text>

        {conditions.map((item, index) => {
          const y = 180 + index * 180;
          return (
            <g key={index}>
              <line x1="300" y1={index === 0 ? 110 : y - 100} x2="300" y2={y - 40} stroke="#666" strokeWidth="2" markerEnd="url(#arrow)"/>
              
              <polygon points={`300,${y - 40} 380,${y} 300,${y + 40} 220,${y}`} fill="#fff" stroke="#666" strokeWidth="2"/>
              
              <text x="300" y={y + 5} textAnchor="middle" fontSize="11" fill="#333" fontWeight="500">
                {item.condition || 'Kondisi kosong'}
              </text>

              <text x="395" y={y - 10} fontSize="11" fill="#666">Ya</text>
              <line x1="380" y1={y} x2="580" y2={y} stroke="#666" strokeWidth="2" markerEnd="url(#arrow)"/>
              
              <rect x="580" y={y - 30} width="200" height="60" fill="#f3f4f6" stroke="#666" strokeWidth="2" rx="6"/>
              <text x="680" y={y + 5} textAnchor="middle" fontSize="11" fill="#333" fontWeight="500">
                {item.yes || 'Instruksi kosong'}
              </text>

              <line x1="680" y1={y + 30} x2="680" y2={height - 60} stroke="#666" strokeWidth="2"/>
              <text x="245" y={y + 60} fontSize="11" fill="#666">Tidak</text>

              {index < conditions.length - 1 && (
                <line x1="300" y1={y + 40} x2="300" y2={y + 100} stroke="#666" strokeWidth="2" markerEnd="url(#arrow)"/>
              )}

              {index === conditions.length - 1 && flowchartData.elseInstruction && (
                <>
                  <line x1="300" y1={y + 40} x2="300" y2={y + 100} stroke="#666" strokeWidth="2" markerEnd="url(#arrow)"/>
                  <rect x="200" y={y + 100} width="200" height="60" fill="#fef3c7" stroke="#666" strokeWidth="2" rx="6"/>
                  <text x="300" y={y + 125} textAnchor="middle" fontSize="11" fill="#92400e" fontWeight="500">
                    {flowchartData.elseInstruction}
                  </text>
                </>
              )}
            </g>
          );
        })}

        <ellipse cx="680" cy={height - 30} rx="70" ry="30" fill="#fff" stroke="#666" strokeWidth="2"/>
        <text x="680" y={height - 25} textAnchor="middle" fontSize="12" fontWeight="bold" fill="#666">Selesai</text>
      </svg>
    </div>
  );
};

  if (loading) return <Loading>🔄 Memuat detail room...</Loading>;
  if (!roomMeta) return <Loading>❌ Room tidak ditemukan</Loading>;
return (
  <Container>
    <Header>
      <div>
        <Title>{roomMeta.room_name}</Title>
        <Status isclosed={roomMeta.is_closed}>
          {roomMeta.is_closed ? '🔒 Ditutup' : '🟢 Terbuka'}
        </Status>
      </div>
      <BackButton onClick={() => navigate(-1)}>
        ← Kembali
      </BackButton>
    </Header>

    {/* ROW 1: CLUE + MEMBERS */}
    <div style={{ 
      display: 'grid', 
      gridTemplateColumns: '1fr 380px', 
      gap: '24px', 
      marginBottom: '24px' 
    }}>
      
      {/* CLUE CARD */}
      <Card>
        <CardTitle>🧩 Clue Usage</CardTitle>
        <div style={{ 
          fontSize: '48px', 
          textAlign: 'center', 
          color: clueInfo.used >= clueInfo.max ? '#ef4444' : '#10b981',
          fontWeight: '800',
          marginBottom: '16px',
          lineHeight: '1'
        }}>
          {clueInfo.used}/{clueInfo.max}
        </div>
        <div style={{ 
          textAlign: 'center',
          fontSize: '16px',
          color: '#6b7280',
          fontWeight: '500'
        }}>
          {clueInfo.used >= clueInfo.max ? 'Clue sudah maksimal' : `${clueInfo.max - clueInfo.used} tersisa`}
        </div>
        <div style={{ 
          width: '100%', 
          height: '12px', 
          background: '#e5e7eb', 
          borderRadius: '6px',
          marginTop: '20px',
          overflow: 'hidden'
        }}>
          <div style={{ 
            width: `${(clueInfo.used / clueInfo.max) * 100}%`, 
            height: '100%', 
            background: clueInfo.used >= clueInfo.max ? '#ef4444' : '#10b981',
            transition: 'width 0.3s ease'
          }} />
        </div>
      </Card>

      {/* MEMBERS CARD */}
      <Card>
        <CardTitle>👥 Anggota ({members.length})</CardTitle>
        <MembersList style={{ maxHeight: '520px', overflowY: 'auto' }}>
          {members.length === 0 ? (
            <div style={{ 
              padding: '60px 20px', 
              textAlign: 'center', 
              color: '#9ca3af',
              fontStyle: 'italic',
              fontSize: '15px'
            }}>
              📭 Belum ada anggota bergabung
            </div>
          ) : (
            members.map((m) => (
              <MemberItem 
                key={m.id} 
                style={{ 
                  padding: '16px', 
                  display: 'flex', 
                  alignItems: 'center', 
                  gap: '14px',
                  borderRadius: '10px',
                  marginBottom: '10px',
                  transition: 'all 0.2s',
                  cursor: 'pointer',
                  '&:hover': { background: '#e0e7ff' }
                }}
                onClick={() => console.log('User:', m.user_id)} 
              >
                <div style={{ 
                  width: '44px', 
                  height: '44px', 
                  borderRadius: '50%',
                  background: `hsl(${m.user_id % 360}, 70%, 55%)`,
                  color: 'white',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  fontWeight: '700',
                  fontSize: '16px',
                  flexShrink: 0,
                  boxShadow: '0 2px 8px rgba(0,0,0,0.15)'
                }}>
                  {m.name?.charAt(0)?.toUpperCase() || 'U'}
                </div>
                <div>
                  <div style={{ 
                    fontWeight: '600', 
                    color: '#1f2937',
                    fontSize: '15px',
                    marginBottom: '2px'
                  }}>
                    {m.name || `User ${m.user_id}`}
                  </div>
                  <div style={{ 
                    fontSize: '12px', 
                    color: '#6b7280'
                  }}>
                    ID: {m.user_id}
                  </div>
                </div>
              </MemberItem>
            ))
          )}
        </MembersList>
      </Card>
    </div>

    {/* ROW 2: WORKSPACE COMPARISON */}
    <Card style={{ marginBottom: '24px' }}>
      <CardTitle>⚖️ Perbandingan Workspace Siswa vs Kunci Jawaban</CardTitle>
      <WorkspaceCompare>
        {/* SISWA - TERBARU */}
        <WorkspaceSection>
          <SectionLabel>Siswa (Workspace Terbaru)</SectionLabel>
          {workspace ? (
            <>
              <PseudocodeBox>{workspace.pseudocode || "Belum ada"}</PseudocodeBox>
              <FlowchartBox>
                {renderFlowchartPreview(
                  typeof workspace.flowchart === 'string' 
                    ? JSON.parse(workspace.flowchart)
                    : workspace.flowchart
                )}
              </FlowchartBox>
            </>
          ) : (
            <div style={{ 
              padding: '60px 20px', 
              textAlign: 'center', 
              color: '#9ca3af',
              fontStyle: 'italic'
            }}>
              📭 Siswa belum submit workspace
            </div>
          )}
        </WorkspaceSection>

        {/* ADMIN RESMI */}
<WorkspaceSection isOfficial>
  <SectionLabel isOfficial>✅ Kunci Jawaban</SectionLabel>
  {materiAnswer ? (
    <>
      <PseudocodeBox isOfficial>{materiAnswer.pseudocode || "Belum diset"}</PseudocodeBox>
      <FlowchartBox isOfficial>
        {/* 🔥 SAFETY PARSE */}
        {(() => {
          try {
            const flowchartData = materiAnswer.flowchart;
            if (typeof flowchartData === 'string') {
              return renderFlowchartPreview(JSON.parse(flowchartData));
            }
            return renderFlowchartPreview(flowchartData);
          } catch (e) {
            return <div style={{padding:'20px', color:'#ef4444'}}>Parse error: {e.message}</div>;
          }
        })()}
      </FlowchartBox>
    </>
  ) : (
    <div>⚠️ Belum ada kunci jawaban</div>
  )}
</WorkspaceSection>
      </WorkspaceCompare>
    </Card>

    {/* ROW 3: ATTEMPTS FULL DETAIL */}
{/* ROW 3: PSEUDOCODE vs FLOWCHART TABS */}
<div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '24px' }}>
  
  {/* PSEUDOCODE ATTEMPTS */}
  <Card>
    <div style={{ 
      display: 'flex', 
      justifyContent: 'space-between', 
      alignItems: 'center',
      marginBottom: '20px'
    }}>
      <CardTitle>💻 Pseudocode Attempts</CardTitle>
      <div style={{ 
        fontSize: '24px', 
        fontWeight: '700',
        color: '#3b82f6'
      }}>
        {attempts.filter(a => a.type === 'pseudocode').length}
      </div>
    </div>
    
    {attempts.filter(a => a.type === 'pseudocode').length === 0 ? (
      <div style={{ padding: '60px', textAlign: 'center', color: '#9ca3af' }}>
        📭 Belum ada pseudocode attempt
      </div>
    ) : (
      <div style={{ maxHeight: '500px', overflowY: 'auto' }}>
        {attempts
          .filter(a => a.type === 'pseudocode')
          .map((attempt, index) => (
            <div key={attempt.id} style={{ 
              padding: '20px', 
              background: '#eff6ff', 
              borderRadius: '12px',
              marginBottom: '16px',
              borderLeft: `4px solid #3b82f6`
            }}>
              <div style={{ 
                display: 'flex', 
                justifyContent: 'space-between',
                alignItems: 'center',
                marginBottom: '12px'
              }}>
                <span style={{ fontWeight: '700', fontSize: '16px' }}>
                  Attempt #{attempt.attemptNumber}
                </span>
                <span style={{ 
                  padding: '4px 12px',
                  borderRadius: '20px',
                  background: attempt.success ? '#dcfce7' : '#fee2e2',
                  color: attempt.success ? '#166534' : '#dc2626',
                  fontWeight: '600',
                  fontSize: '13px'
                }}>
                  {attempt.success ? '✅' : '❌'}
                </span>
              </div>
              <PseudocodeBox style={{ 
                background: 'white', 
                color: '#1f2937',
                fontSize: '14px',
                padding: '16px',
                minHeight: '120px'
              }}>
                {attempt.pseudocode || attempt.content || 'Kode kosong'}
              </PseudocodeBox>
            </div>
          ))
        }
      </div>
    )}
  </Card>

  {/* FLOWCHART ATTEMPTS */}
  <Card>
    <div style={{ 
      display: 'flex', 
      justifyContent: 'space-between', 
      alignItems: 'center',
      marginBottom: '20px'
    }}>
      <CardTitle>📈 Flowchart Attempts</CardTitle>
      <div style={{ 
        fontSize: '24px', 
        fontWeight: '700',
        color: '#f59e0b'
      }}>
        {attempts.filter(a => a.type === 'flowchart').length}
      </div>
    </div>
    
    {attempts.filter(a => a.type === 'flowchart').length === 0 ? (
      <div style={{ padding: '60px', textAlign: 'center', color: '#9ca3af' }}>
        📭 Belum ada flowchart attempt
      </div>
    ) : (
      <div style={{ maxHeight: '500px', overflowY: 'auto' }}>
        {attempts
          .filter(a => a.type === 'flowchart')
          .map((attempt, index) => (
            <div key={attempt.id} style={{ 
              padding: '20px', 
              background: '#fffbeb', 
              borderRadius: '12px',
              marginBottom: '16px',
              borderLeft: `4px solid #f59e0b`
            }}>
              <div style={{ 
                display: 'flex', 
                justifyContent: 'space-between',
                alignItems: 'center',
                marginBottom: '12px'
              }}>
                <span style={{ fontWeight: '700', fontSize: '16px' }}>
                  Attempt #{attempt.attemptNumber}
                </span>
                <span style={{ 
                  padding: '4px 12px',
                  borderRadius: '20px',
                  background: attempt.success ? '#dcfce7' : '#fee2e2',
                  color: attempt.success ? '#166534' : '#dc2626',
                  fontWeight: '600',
                  fontSize: '13px'
                }}>
                  {attempt.success ? '✅' : '❌'}
                </span>
              </div>
              <div style={{ 
                height: '280px', 
                border: '2px solid #f59e0b', 
                borderRadius: '12px',
                overflow: 'hidden',
                background: 'white'
              }}>
                {renderFlowchartPreview(attempt.flowchart || {})}
              </div>
            </div>
          ))
        }
      </div>
    )}
  </Card>
</div>
  </Container>
);
}