import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import Table from "../components/Table";
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

const BackButton = styled.button`
  background-color: #007bff;
  color: white;
  border: none;
  padding: 10px 15px;
  border-radius: 5px;
  cursor: pointer;
  font-size: 14px;
  margin-bottom: 20px;
  transition: background-color 0.3s;

  &:hover {
    background-color: #0056b3;
  }
`;

export default function AdminRooms() {
  const { materiId } = useParams();
  const navigate = useNavigate();

  const [rooms, setRooms] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchRooms();
  }, []);

  const fetchRooms = async () => {
    setLoading(true);

    try {
      const res = await fetch(
        `${import.meta.env.VITE_API_URL || "http://localhost:5000/api"}/admin/discussion/rooms/by-materi/${materiId}`,
        {
          headers: {
            "Content-Type": "application/json",
            Authorization: "Bearer " + localStorage.getItem("token"),
          },
        }
      );

      const raw = await res.text();
      console.log("RAW:", raw);

      let json;
      try {
        json = JSON.parse(raw);
        console.log(" JSON PARSED:", json);
      } catch (e) {
        console.error(" Response bukan JSON!");
        return;
      }

      let roomsData = [];

      if (Array.isArray(json.data)) {
        roomsData = json.data;
      } else if (json.data && typeof json.data === "object") {
        roomsData = [json.data];
      }

      const formatted = roomsData.map((r, i) => ({
        No: i + 1,
        Room: r.room_name,
        MateriID: r.materi_id,
        Kapasitas: r.max_members,
        Aksi: (
          <div style={{ display: "flex", gap: 10 }}>
            <button onClick={() => navigate(`/admin/rooms/detail/${r.id}`)}>
              Detail
            </button>

          </div>
        ),
      }));

      setRooms(formatted);
    } catch (err) {
      console.error("Gagal fetch rooms:", err);
    } finally {
      setLoading(false);
    }
  };

  const toggleRoom = async (id) => {
    try {
      const res = await fetch(
        `${import.meta.env.VITE_API_URL || "http://localhost:5000/api"}/admin/discussion/rooms/${id}/toggle`,
        {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
            Authorization: "Bearer " + localStorage.getItem("token"),
          },
        }
      );

      const raw = await res.text();
      console.log("TOGGLE RAW:", raw);

      fetchRooms();
    } catch (err) {
      console.error("Gagal toggle:", err);
    }
  };

  return (
    <Container>
      <Header>
        <BackButton onClick={() => navigate(-1)}>Kembali</BackButton>
        <Title>Manajemen Breakout Rooms</Title>
        <Description>
          Halaman ini digunakan admin/guru untuk melihat seluruh room diskusi.
        </Description>
      </Header>

      {loading ? (
        <LoadingText>Loading...</LoadingText>
      ) : (
        <Table
          columns={["No", "Room", "MateriID", "Kapasitas",  "Aksi"]}
          data={rooms}
        />
      )}
    </Container>
  );
}