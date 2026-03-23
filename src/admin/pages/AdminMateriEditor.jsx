import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import styled from "styled-components";
import { apiGet } from "../../services/api";

// Tabs
import TabOverview from "../pages/tabs/TabOverview";
import TabOrientasi from "../pages/tabs/TabOrientasi";
import TabSections from "../pages/tabs/TabSections";
import TabAnswer from "../pages/tabs/TabAnswer";
import TabClues from "../pages/tabs/TabClues";
import TabDiscussion from "../pages/tabs/TabDiscussion";


const Page = styled.div`
  padding: 28px;
  font-family: Inter, system-ui, Arial;
`;
const Header = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 18px;
`;
const Title = styled.h1`
  margin: 0;
  font-size: 20px;
`;

const TabsWrap = styled.div`
  display: flex;
  gap: 8px;
  margin-bottom: 18px;
`;

const TabBtn = styled.button`
  padding: 8px 12px;
  border-radius: 8px;
  border: none;
  cursor: pointer;
  background: ${(p) => (p.$active ? "#4f46e5" : "transparent")};
  color: ${(p) => (p.$active ? "white" : "#374151")};
  font-weight: 600;
  transition: 0.15s;
`;

export default function AdminMateriEditor() {
  const { id } = useParams(); 
  const navigate = useNavigate();

  const [materi, setMateri] = useState(null);
  const [loading, setLoading] = useState(true);
  const [tab, setTab] = useState("overview");

  // LOAD MATERI

  useEffect(() => {
    if (!id) return;

    setLoading(true);

    apiGet(`/admin/materi/${id}`)
      .then((res) => setMateri(res.data || res))
      .catch((err) => {
        console.error(err);
        alert("Gagal memuat materi");
        navigate("/admin/materi");
      })
      .finally(() => setLoading(false));
  }, [id, navigate]);

  const tabs = [
    { key: "overview", label: "Overview" },
    { key: "orientasi", label: "Orientasi Masalah" },
    { key: "sections", label: "Mini Lesson / Sections" },
    { key: "answer", label: "Jawaban Workspace" },
    { key: "clues", label: "Clues" },
    { key: "discussion", label: "Diskusi / Room" },
  ];

  if (loading)
    return (
      <Page>
        <p>Loading...</p>
      </Page>
    );

  return (
    <Page>
      <Header>
        <Title>Editor Materi — {materi?.title || "(tanpa judul)"}</Title>

        <button
          onClick={() => navigate("/admin/materi")}
          style={{
            marginRight: 12,
            padding: "10px 16px",
            background: "#007bff",
            color: "#fff",
            borderRadius: 8,
            border: "none",
            cursor: "pointer",
          }}
        >
          Kembali
        </button>
      </Header>

      {/* ===================== TABS ===================== */}
      <TabsWrap>
        {tabs.map((t) => (
          <TabBtn
            key={t.key}
            $active={tab === t.key}
            onClick={() => setTab(t.key)}
          >
            {t.label}
          </TabBtn>
        ))}
      </TabsWrap>

      {/* ===================== TAB CONTENT ===================== */}
      <div>
        {tab === "overview" && (
          <TabOverview materiId={id} materi={materi} onUpdated={(m) => setMateri(m)} />
        )}

        {tab === "orientasi" && (
          <TabOrientasi materiId={id} materi={materi} />
        )}

        {tab === "sections" && (
          <TabSections materiId={id} materi={materi} />
        )}
        {tab === "answer" && (
          <TabAnswer materiId={id} materi={materi} />
        )}

        {tab === "clues" && (
          <TabClues materiId={id} materi={materi} />
        )}

        {tab === "discussion" && (
          <TabDiscussion materiId={id} materi={materi} />
        )}
      </div>
    </Page>
  );
}
