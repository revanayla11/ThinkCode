import { useEffect, useState } from "react";
import { useParams, useNavigate, Link } from "react-router-dom";
import styled from "styled-components"; // Tambahkan import ini
import api from "../api/axiosClient";
import Layout from "../components/Layout";

export default function DiscussionRooms() {
  const { id } = useParams(); // materiId
  const navigate = useNavigate();
  const [rooms, setRooms] = useState([]);
  const [userProgress, setUserProgress] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!id) return;

    // Fetch rooms
    api.get(`/discussion/rooms/${id}`)
      .then((res) => {
        setRooms(res.data?.data || []);
      })
      .catch((err) => console.error(err));

    // Fetch progress user untuk cek roomId
    api
      .get(`/materi/${id}`)
      .then((res) => {
        setUserProgress(res.data?.data?.progress || null);
        setLoading(false);
      })
      .catch((err) => {
        console.error(err);
        setLoading(false);
      });
  }, [id]);

  // Fungsi untuk join room
  const handleJoinRoom = async (roomId) => {
    try {
      console.log('Joining room, attempting to complete "join_discussion"');
      await api.post(`/discussion/room/${roomId}/join`);
      api.post(`/materi/${id}/complete-step`, { step: "join_discussion" })
        .then(() => console.log('Step "join_discussion" completed'))
        .catch(err => console.error('Error completing "join_discussion":', err));
      window.location.href = `/materi/${id}/room/${roomId}`;
    } catch (err) {
      alert(err.response?.data?.message || "Gagal join room");
    }
  };

  if (loading) return <p style={{ padding: 30 }}>Memuat...</p>;

  return (
    <Layout>
      <Wrapper>
        {/* HEADER */}
        <Header>
          <HeaderLeft>
            <Title>Ruang Diskusi</Title>
            <Breadcrumb>
              Orientasi Masalah &gt; Ruang Diskusi
            </Breadcrumb>
            <Breadcrumb>
              Pilih ruang diskusi yang tersedia
            </Breadcrumb>
          </HeaderLeft>
          <BackButton onClick={() => navigate(-1)}>
            Kembali
          </BackButton>
        </Header>

        {/* LIST ROOM */}
        <RoomList>
          {rooms.map((room) => {
            const isJoined = userProgress?.roomId === room.id; 
            const hasJoinedOther =
              userProgress?.roomId && userProgress.roomId !== room.id; 

            return (
              <RoomCard key={room.id}>
                <h3>{room.name || room.title}</h3>

                <p>Kapasitas: {room.current || 0}/{room.capacity}</p>

                {isJoined ? (
                  <Link to={`/materi/${id}/room/${room.id}`}>
                    <EnterButton>Masuk Kembali</EnterButton>
                  </Link>
                ) : hasJoinedOther ? (
                  <DisabledButton disabled>
                    Sudah Join Room Lain
                  </DisabledButton>
                ) : (
                  <JoinButton
                    onClick={() => handleJoinRoom(room.id)}
                    disabled={room.current >= room.capacity}
                  >
                    {room.current >= room.capacity ? "Penuh" : "Masuk Room"}
                  </JoinButton>
                )}
              </RoomCard>
            );
          })}

          {rooms.length === 0 && (
            <NoRooms>Belum ada ruang diskusi tersedia.</NoRooms>
          )}
        </RoomList>
      </Wrapper>
    </Layout>
  );
}

// Styled Components
const Wrapper = styled.div`
  padding: 20px 40px;
  font-family: 'Roboto', sans-serif;
`;

const Header = styled.div`
  margin-bottom: 30px;
  display: flex;
  justify-content: space-between;
  align-items: center;
  position: sticky;
  top: 0;
  background: rgba(255, 255, 255, 0.95);
  backdrop-filter: blur(15px);
  z-index: 10;
  padding: 20px 25px;
  border-radius: 15px;
  box-shadow: 0 8px 32px rgba(0, 0, 0, 0.1);
  border: 1px solid rgba(255, 255, 255, 0.2);
`;

const HeaderLeft = styled.div`
  display: flex;
  flex-direction: column;
`;

const Title = styled.h2`
  margin: 0;
  color: #2c3e50;
  font-weight: 700;
  font-size: 32px;
  text-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
`;

const Breadcrumb = styled.div`
  font-size: 16px;
  color: #7f8c8d;
  margin-top: 8px;
  font-weight: 500;
`;

const BackButton = styled.button`
  background: #3759c7;
  color: white;
  border: none;
  border-radius: 12px;
  padding: 14px 28px;
  cursor: pointer;
  font-weight: 600;
  font-size: 16px;
  transition: all 0.3s ease;

  &:hover {
    background: #3759c7;
    transform: translateY(-2px);
  }
`;

const RoomList = styled.div`
  display: flex;
  gap: 20px;
  flex-wrap: wrap;
`;

const RoomCard = styled.div`
  width: 254px;
  background: rgba(255, 255, 255, 0.95);
  padding: 20px;
  border-radius: 14px;
  box-shadow: 0 8px 32px rgba(0, 0, 0, 0.1);
  border: 1px solid rgba(255, 255, 255, 0.2);
  backdrop-filter: blur(10px);
  transition: transform 0.3s ease;

  &:hover {
    transform: translateY(-5px);
  }

  h3 {
    margin-top: 0;
    color: #2c3e50;
    font-weight: 600;
  }

  p {
    font-size: 14px;
    color: #555;
    margin: 10px 0;
  }
`;

const EnterButton = styled.button`
  margin-top: 10px;
  width: 100%;
  background: #3759c7;
  border: none;
  border-radius: 12px;
  padding: 10px 0;
  cursor: pointer;
  color: white;
  font-weight: 600;
  transition: all 0.3s ease;

  &:hover {
    background: #3759c7;
    transform: translateY(-2px);
  }
`;

const DisabledButton = styled.button`
  margin-top: 10px;
  width: 100%;
  background: #ddd;
  border: none;
  border-radius: 12px;
  padding: 10px 0;
  cursor: not-allowed;
  color: #999;
  font-weight: 600;
`;

const JoinButton = styled.button`
  margin-top: 10px;
  width: 100%;
  background: ${({ disabled }) =>
    disabled ? "#ddd" : "#a7eeb5"};
  border: none;
  border-radius: 12px;
  padding: 10px 0;
  cursor: ${({ disabled }) => (disabled ? "not-allowed" : "pointer")};
  color: ${({ disabled }) => (disabled ? "#999" : "#2a8b46")};
  font-weight: 600;
  transition: all 0.3s ease;

  &:hover:not(:disabled) {
    background: #6ab678;
    transform: translateY(-2px);
  }
`;

const NoRooms = styled.p`
  color: #777;
  font-size: 16px;
  text-align: center;
  width: 100%;
`;