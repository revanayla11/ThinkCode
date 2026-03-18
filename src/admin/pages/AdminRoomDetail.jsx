import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import styled from "styled-components";
import { apiGet } from "../../services/api";

const Container = styled.div`
  max-width: 1200px;
  margin: 0 auto;
  padding: 20px;
  font-family: 'Arial', sans-serif;
  background-color: #f9f9f9;
  border-radius: 10px;
  box-shadow: 0 4px 8px rgba(0, 0, 0, 0.1);
`;

const Header = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 20px;
`;

const Title = styled.h2`
  color: #333;
  margin: 0;
`;

const Status = styled.p`
  color: ${props => (props.isclosed ? '#d9534f' : '#5cb85c')};
  font-weight: bold;
  margin: 0;
`;

const BackButton = styled.button`
  background-color: #007bff;
  color: white;
  border: none;
  padding: 10px 15px;
  border-radius: 5px;
  cursor: pointer;
  font-size: 14px;
  transition: background-color 0.3s;

  &:hover {
    background-color: #0056b3;
  }
`;

const ClueSection = styled.section`
  background-color: #fff;
  padding: 15px;
  border-radius: 8px;
  margin-bottom: 20px;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
`;

const ClueTitle = styled.h3`
  color: #333;
  margin: 0 0 10px 0;
`;

const MainSection = styled.section`
  display: flex;
  gap: 20px;
  flex-wrap: wrap;
`;

const MembersContainer = styled.div`
  width: 300px;
  min-width: 250px;
`;

const MembersTitle = styled.h3`
  color: #333;
  margin-bottom: 10px;
`;

const MembersList = styled.ul`
  list-style: none;
  padding: 0;
  margin: 0;
  background-color: #fff;
  border-radius: 8px;
  padding: 15px;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
`;

const MemberItem = styled.li`
  padding: 8px 0;
  border-bottom: 1px solid #eee;

  &:last-child {
    border-bottom: none;
  }
`;

const WorkspaceContainer = styled.div`
  flex: 1;
  min-width: 300px;
  background-color: #fff;
  padding: 15px;
  border-radius: 8px;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
  margin-bottom: 20px;
`;

const WorkspaceTitle = styled.h3`
  color: #333;
  margin-bottom: 10px;
`;

const PseudocodeBox = styled.pre`
  background-color: #f4f4f4;
  padding: 10px;
  border-radius: 5px;
  overflow-x: auto;
  white-space: pre-wrap;
  font-family: monospace;
  margin-bottom: 15px;
`;

const FlowchartBox = styled.div`
  background-color: #f4f4f4;
  padding: 10px;
  border-radius: 5px;
  margin-bottom: 15px;
  font-family: monospace;
  display: flex;
  justify-content: center;
  overflow-x: auto;
`;

const AttemptsContainer = styled.div`
  flex: 1;
  min-width: 300px;
  background-color: #fff;
  padding: 15px;
  border-radius: 8px;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
`;

const AttemptsTitle = styled.h3`
  color: #333;
  margin-bottom: 10px;
`;

const AttemptItem = styled.div`
  margin-bottom: 15px;
  padding: 10px;
  border: 1px solid #ddd;
  border-radius: 5px;
  background-color: #fafafa;
`;

const AttemptType = styled.div`
  font-weight: bold;
  color: #007bff;
`;

const AttemptNumber = styled.div`
  font-size: 14px;
  color: #666;
`;

const AttemptContent = styled.div`
  background-color: #f9f9f9;
  padding: 8px;
  border-radius: 3px;
  overflow-x: auto;
  font-family: monospace;
  font-size: 12px;
  display: flex;
  justify-content: center;
`;

const Loading = styled.p`
  text-align: center;
  font-size: 18px;
  color: #666;
`;

export default function AdminRoomDetail() {
  const { roomId } = useParams();
  const [roomMeta, setRoomMeta] = useState(null);
  const [clueInfo, setClueInfo] = useState({ used: 0, max: 3 });
  const [members, setMembers] = useState([]);
  const [workspace, setWorkspace] = useState(null);
  const [attempts, setAttempts] = useState([]);

  // TAMBAHAN: jawaban materi
  const [materiAnswer, setMateriAnswer] = useState(null);

  const navigate = useNavigate();

  const [conditions, setConditions] = useState([]);
  const [elseInstruction, setElseInstruction] = useState("");

  useEffect(() => {
    fetchInitialData();
  }, [roomId]);

  const fetchInitialData = async () => {
    try {

      const jr = await apiGet(`/admin/discussion/room/${roomId}`);
      if (jr.status && jr.data) {
        setRoomMeta(jr.data.room);
        setClueInfo(jr.data.clue || { used: 0, max: 5 });
      }

      const jm = await apiGet(`/admin/discussion/room/${roomId}/members`);
      setMembers(jm.data || []);

      const jw = await apiGet(`/admin/discussion/workspace/latest/${roomId}`);
      if (jw.status && jw.data) {
        setWorkspace(jw.data);

        const flowchartRaw = jw.data.flowchart;
        let flowchartData = { conditions: [], elseInstruction: "" };

        if (flowchartRaw) {
          if (typeof flowchartRaw === 'string') {
            try {
              flowchartData = JSON.parse(flowchartRaw);
            } catch (e) {
              console.error("Error parsing flowchart string:", e);
            }
          } else if (typeof flowchartRaw === 'object') {
            flowchartData = flowchartRaw;
          }
        }

        setConditions(flowchartData.conditions || []);
        setElseInstruction(flowchartData.elseInstruction || "");
      }

      const ja = await apiGet(`/admin/discussion/workspace/attempts/${roomId}`);
      if (ja.status) setAttempts(ja.data || []);

      // TAMBAHAN: ambil jawaban materi
      const jmtr = await apiGet(`/admin/materi/answer/${roomId}`);
      if (jmtr.status && jmtr.data) {
        setMateriAnswer(jmtr.data);
      }

    } catch (e) {
      console.error("initial load error:", e);
    }
  };

  const renderFlowchart = (conds, elseInst) => {
    if (conds.length === 0 && !elseInst) {
      return <p>Belum ada flowchart.</p>;
    }

    const height = 160 + conds.length * 180 + (elseInst ? 120 : 0);

    return (
      <svg width="170%" height={height} viewBox={`160 0 640 ${height}`}>
        <ellipse cx="300" cy="80" rx="70" ry="30" fill="#fff" stroke="#000" />
        <text x="300" y="85" textAnchor="middle">Mulai</text>

        {conds.map((item, index) => {
          const y = 180 + index * 180;
          return (
            <g key={index}>
              <polygon
                points={`300,${y - 40} 380,${y} 300,${y + 40} 220,${y}`}
                fill="#fff"
                stroke="#000"
              />
              <text x="300" y={y + 5} textAnchor="middle">
                {item.condition}
              </text>
            </g>
          );
        })}

        <ellipse cx="680" cy={height - 30} rx="70" ry="30" fill="#fff" stroke="#000" />
        <text x="680" y={height - 25} textAnchor="middle">Selesai</text>
      </svg>
    );
  };

  if (!roomMeta) return <Loading>Memuat...</Loading>;

  return (
    <Container>

      <Header>
        <div>
          <Title>Observer — Room: {roomMeta.room_name}</Title>
          <Status isclosed={roomMeta.is_closed}>
            Status: {roomMeta.is_closed ? "Ditutup" : "Terbuka"}
          </Status>
        </div>
        <BackButton onClick={() => navigate(-1)}>Kembali</BackButton>
      </Header>

      <ClueSection>
        <ClueTitle>Clue usage: {clueInfo.used} / {clueInfo.max}</ClueTitle>
      </ClueSection>

      <MainSection>

        <MembersContainer>
          <MembersTitle>Anggota ({members.length})</MembersTitle>
          <MembersList>
            {members.map(m => (
              <MemberItem key={m.id}>{m.name || `User ${m.user_id}`}</MemberItem>
            ))}
          </MembersList>
        </MembersContainer>

        <WorkspaceContainer>
          <WorkspaceTitle>Workspace Terbaru</WorkspaceTitle>

          {workspace ? (
            <>
              <h4>Pseudocode:</h4>
              <PseudocodeBox>{workspace.pseudocode || "Belum ada"}</PseudocodeBox>

              <h4>Flowchart:</h4>
              <FlowchartBox>
                {renderFlowchart(conditions, elseInstruction)}
              </FlowchartBox>
            </>
          ) : (
            <p>Belum ada workspace.</p>
          )}
        </WorkspaceContainer>

        {/* TAMBAHAN: Jawaban Materi */}
        <WorkspaceContainer>
          <WorkspaceTitle>Jawaban Materi (Referensi)</WorkspaceTitle>

          {materiAnswer ? (
            <>
              <h4>Pseudocode Benar:</h4>
              <PseudocodeBox>
                {materiAnswer.pseudocode || "Belum ada"}
              </PseudocodeBox>

              <h4>Flowchart Benar:</h4>
              <FlowchartBox>
                {renderFlowchart(
                  materiAnswer.flowchart?.conditions || [],
                  materiAnswer.flowchart?.elseInstruction || ""
                )}
              </FlowchartBox>
            </>
          ) : (
            <p>Belum ada jawaban materi.</p>
          )}
        </WorkspaceContainer>

        <AttemptsContainer>
          <AttemptsTitle>History Attempts ({attempts.length})</AttemptsTitle>

          {attempts.length > 0 ? (
            attempts.map((att, idx) => (
              <AttemptItem key={idx}>
                <AttemptType>{att.type} - Attempt {att.attemptNumber}</AttemptType>
                <AttemptNumber>{new Date(att.createdAt).toLocaleString()}</AttemptNumber>

                <AttemptContent>
                  <pre style={{ whiteSpace: 'pre-wrap', margin: 0 }}>
                    {att.content || "Tidak ada isi"}
                  </pre>
                </AttemptContent>

              </AttemptItem>
            ))
          ) : (
            <p>Belum ada attempts.</p>
          )}
        </AttemptsContainer>

      </MainSection>

    </Container>
  );
}