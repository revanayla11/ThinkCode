import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import styled from "styled-components";

// Styled Components
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
  margin-bottom: 20px;
`;

const Title = styled.h2`
  color: #333;
  margin: 0 0 10px 0;
`;

const Description = styled.p`
  color: #666;
  margin: 0;
`;

const LoadingText = styled.p`
  text-align: center;
  font-size: 18px;
  color: #666;
`;

const MateriGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(300px, 1fr));
  gap: 20px;
`;

const MateriCard = styled.div`
  background-color: #fff;
  border-radius: 10px;
  padding: 20px;
  box-shadow: 0 4px 8px rgba(0, 0, 0, 0.1);
  cursor: pointer;
  transition: transform 0.3s, box-shadow 0.3s;

  &:hover {
    transform: translateY(-5px);
    box-shadow: 0 8px 16px rgba(0, 0, 0, 0.2);
  }
`;

const MateriTitle = styled.h3`
  color: #333;
  margin: 0 0 10px 0;
`;

const MateriDescription = styled.p`
  color: #666;
  margin: 0;
`;

export default function AdminRoomMateri() {
  const navigate = useNavigate();
  const [materi, setMateri] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchMateri();
  }, []);

  const fetchMateri = async () => {
    setLoading(true);
    try {
      const res = await fetch(
        `${import.meta.env.VITE_API_URL || "http://localhost:5000/api"}/materi`,
        {
          headers: {
            "Content-Type": "application/json",
            Authorization: "Bearer " + localStorage.getItem("token"),
          },
        }
      );

      const json = await res.json();
      if (json.status && Array.isArray(json.data)) {
        setMateri(json.data);
      }
    } catch (err) {
      console.error("Gagal fetch materi:", err);
    } finally {
      setLoading(false);
    }
  };

  const handleCardClick = (materiId) => {
    navigate(`/admin/rooms/${materiId}`);
  };

  return (
    <Container>
      <Header>
        <Title>Manajemen Materi untuk Rooms</Title>
        <Description>
          Pilih materi untuk melihat breakout rooms diskusi.
        </Description>
      </Header>

      {loading ? (
        <LoadingText>Loading...</LoadingText>
      ) : (
        <MateriGrid>
          {materi.map((m) => (
            <MateriCard key={m.id} onClick={() => handleCardClick(m.id)}>
              <MateriTitle>{m.title || `Materi ${m.id}`}</MateriTitle>
              <MateriDescription>{m.description || "Deskripsi materi"}</MateriDescription>
            </MateriCard>
          ))}
        </MateriGrid>
      )}
    </Container>
  );
}