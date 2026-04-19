import { useEffect, useState } from "react";
import api from "../api/axiosClient";
import Layout from "../components/Layout";
import styled from "styled-components";
import { FaStar, FaRocket, FaChartLine, FaUser, FaTrophy, FaMedal } from "react-icons/fa";

export default function Dashboard() {
  const [user, setUser] = useState(null);
  const [materi, setMateri] = useState([]);
  const [achievement, setAchievement] = useState([]);
  const [leaderboardIndividu, setLeaderboardIndividu] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Circle Badge Component for Achievements
const CircleBadge = ({ title, image }) => {
  const baseURL = import.meta.env.VITE_API_URL.replace("/api", "");

  return (
    <CircleBox>
      {image ? (
        <BadgeImage
          src={`${baseURL}${image}`}
          alt={title}
          onError={(e) => {
            console.log("Badge error:", e.target.src);
            e.target.style.display = "none";
          }}
        />
      ) : (
        <BadgeFallback>🏆</BadgeFallback>
      )}
      <BadgeTitle>{title}</BadgeTitle>
    </CircleBox>
  );
};


  // Action Link Component
  const ActionLink = ({ href, children }) => (
    <ButtonLink href={href}>
      {children} <FaRocket style={{ marginLeft: 5 }} />
    </ButtonLink>
  );

  useEffect(() => {
    const token = localStorage.getItem("token");

    if (!token) {
      alert("Silakan login dahulu!");
      window.location.href = "/login";
      return;
    }

    const headers = { Authorization: `Bearer ${token}` };

    api
      .get("/dashboard", { headers })
      .then((res) => {
        setUser(res.data.user);
        setMateri(res.data.materi || []);
        setAchievement(res.data.achievements || []);
        setLeaderboardIndividu(res.data.leaderboard_individu || []);
        setLoading(false);
      })
      .catch((err) => {
        console.error("Error loading dashboard:", err);
        setError("Gagal memuat data dashboard. Cek koneksi atau login ulang.");
        setLoading(false);
        if (err.response?.status === 401) {
          alert("Sesi habis, login ulang.");
          localStorage.clear();
          window.location.href = "/login";
        }
      });
  }, []);

  if (loading) {
    return (
      <Layout>
        <LoadingWrapper>
          <FaRocket size={50} />
          <p>Memuat dashboard...</p>
        </LoadingWrapper>
      </Layout>
    );
  }

  if (error) {
    return (
      <Layout>
        <ErrorWrapper>
          <p>{error}</p>
        </ErrorWrapper>
      </Layout>
    );
  }

  return (
    <Layout>
      <PageWrapper>
        {/* Left Content */}
        <LeftContent>
          <GreetingCard>
            <GreetingIcon>
              <FaRocket size={40} />
            </GreetingIcon>
            <GreetingText>
              <h2>Hello, {user?.name}!</h2>
              <p>How was your day? Are you ready to learn? Let's goooo 🚀</p>
            </GreetingText>
          </GreetingCard>

          <TopCards>
            <ProgressCardContainer>
              <CardHeader>
                <FaChartLine size={20} />
                <h4>Learning Progress</h4>
              </CardHeader>
              <ProgressRow>
                {(materi || []).slice(0, 2).map((m) => (
                  <ProgressCard
                    key={m.id}
                    title={m.title}
                    progress={m.progress || 0}
                    color="#615bb0"
                    
                  />
                ))}
              </ProgressRow>
              <ActionLink href="/materi">View More</ActionLink>
            </ProgressCardContainer>

            <AchievementCard>
              <CardHeader>
                <FaTrophy size={20} />
                <h4>Achievements</h4>
              </CardHeader>
              <AchievementRow>
                {(achievement || []).slice(0, 3).map((a, i) => (
                  <CircleBadge key={i} image={a.image} />
                ))}
              </AchievementRow>
              <ActionLink href="/achievement">View More</ActionLink>
            </AchievementCard>
          </TopCards>
        </LeftContent>

        {/* Right Content */}
        <RightContent>
          <XPCard>
            <IconWrapper>
              <FaStar  size={28} color="#ffd700" />
            </IconWrapper>
            <h4>Your XP</h4>
            <XPValue>{user?.xp || 0}</XPValue>
          </XPCard>

        <LeaderboardCard>
          <CardHeader>
            <FaMedal size={20} />
            <h4>Leaderboard Individu</h4>
          </CardHeader>
          <LeaderboardList>
            {(leaderboardIndividu || []).slice(0, 5).map((lb, i) => (
              <LeaderboardItem key={i}>
                <RankIcon>
                  {i === 0 ? "🥇" : i === 1 ? "🥈" : i === 2 ? "🥉" : <FaMedal size={16} />}
                </RankIcon>
                <UserInfo>{lb.name}</UserInfo>
                <XPText>{lb.xp} XP</XPText>
              </LeaderboardItem>
            ))}
          </LeaderboardList>
          <ActionLink href="/leaderboard">View More</ActionLink>
        </LeaderboardCard>

        </RightContent>
      </PageWrapper>
    </Layout>
  );
}

/* ================= STYLING ================= */

const PageWrapper = styled.div`
  font-family: 'Roboto', sans-serif;
  display: grid;
  grid-template-columns: 2fr 1fr;
  gap: 20px;
  padding: 30px;
  @media (max-width: 768px) {
    grid-template-columns: 1fr;
    gap: 20px;
    padding: 20px;
  }
`;

const LeftContent = styled.div`
  display: flex;
  flex-direction: column;
  gap: 25px;
`;

const RightContent = styled.div`
  display: flex;
  flex-direction: column;
  gap: 25px;
`;

const LoadingWrapper = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  height: 100vh;
  svg {
    animation: spin 1s linear infinite;
    color: #667eea;
  }
  p {
    margin-top: 15px;
    font-size: 16px;
    color: #555;
  }
  @keyframes spin {
    0% { transform: rotate(0deg); }
    100% { transform: rotate(360deg); }
  }
`;

const ErrorWrapper = styled.div`
  display: flex;
  justify-content: center;
  align-items: center;
  height: 100vh;
  p {
    color: red;
    font-size: 16px;
  }
`;

const GreetingCard = styled.div`
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  padding: 30px 25px;
  border-radius: 20px;
  color: #fff;
  display: flex;
  align-items: center;
  gap: 20px;
  box-shadow: 0 12px 30px rgba(0,0,0,0.08);
  transition: transform 0.3s ease;
  &:hover {
    transform: translateY(-5px);
  }
`;

const GreetingIcon = styled.div`
  background: rgba(255,255,255,0.2);
  padding: 15px;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
`;

const GreetingText = styled.div`
  h2 {
    margin: 0 0 8px;
    font-size: 28px;
    font-weight: 700;
  }
  p {
    margin: 0;
    font-size: 15px;
    opacity: 0.85;
  }
`;

const TopCards = styled.div`
  display: flex;
  gap: 20px;
  @media (max-width: 768px) {
    flex-direction: column;
  }
`;

const Card = styled.div`
  background: #fff;
  padding: 20px;
  border-radius: 15px;
  box-shadow: 0 6px 20px rgba(0,0,0,0.05);
  transition: all 0.3s ease;
  &:hover {
    box-shadow: 0 10px 30px rgba(0,0,0,0.1);
  }
`;

const ProgressCardContainer = styled(Card)`
  flex: 1;
`;

const AchievementCard = styled(Card)`
  flex: 1;
`;

const CardHeader = styled.div`
  display: flex;
  align-items: center;
  margin-bottom: 15px;
  h4 {
    margin-left: 10px;
    font-size: 17px;
    font-weight: 600;
    color: #333;
  }
`;

const ProgressRow = styled.div`
  display: flex;
  gap: 15px;
  margin-bottom: 15px;
  @media (max-width: 768px) {
    flex-direction: column;
  }
`;

const ProgressCardWrapper = styled.div`
  flex: 1;
  background: #fff; /* Putih bersih agar kontras dengan background */
  padding: 20px;
  border-radius: 15px;
  text-align: center;
  box-shadow: 0 8px 25px rgba(0,0,0,0.15); /* Shadow lebih tegas */
  transition: all 0.3s ease;
  &:hover {
    transform: translateY(-5px); /* Efek hover */
    box-shadow: 0 12px 35px rgba(0,0,0,0.2);
  }
`;


const ProgressBar = styled.div`
  background: #e4e4f1;
  height: 14px;
  border-radius: 10px;
  overflow: hidden;
  margin-top: 12px;
`;

const ProgressFill = styled.div`
  width: ${({ progress }) => `${progress}%`};
  height: 100%;
  background: ${({ color }) => color};
  border-radius: 10px;
  transition: width 0.5s ease;
`;

function ProgressCard({ title, progress, color }) {
  return (
    <ProgressCardWrapper>
      <p style={{ fontWeight: 600, fontSize: 16 }}>{title}</p>
      <ProgressBar>
        <ProgressFill progress={progress} color={color} />
      </ProgressBar>
      <p style={{ fontSize: 14, marginTop: 10, color: "#666" }}>{progress}% Complete</p>
    </ProgressCardWrapper>
  );
}

const AchievementRow = styled.div`
  display: flex;
  gap: 20px;
  flex-wrap: wrap;
`;

const CircleBox = styled.div`
  width: 80px;
  height: 80px;
  border-radius: 50%;
  background: #fff;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  box-shadow: 0 4px 15px rgba(0,0,0,0.08);
  transition: transform 0.3s ease;
  &:hover {
    transform: scale(1.1);
  }
`;

const BadgeImage = styled.img`
  width: 120px;
  height: 120px;
  object-fit: cover;
  border-radius: 50%;
  align-items: center;
`;

const BadgeFallback = styled.div`
  font-size: 40px;
`;

const BadgeTitle = styled.span`
  margin-top: 6px;
  font-size: 12px;
  font-weight: 600;
  text-align: center;
  color: #333;
`;

const XPCard = styled(Card)`
  text-align: center;
  padding: 3px 5px;
  margin: 0;
  font-size: 16px;
  font-weight: 600;
`;

const IconWrapper = styled.div`
  margin-bottom: 8px;
`;

const XPValue = styled.p`
  font-size: 28px;
  font-weight: 700;
  color: #615bb0;
  margin: 5px 0 0 0;
`;

const LeaderboardCard = styled(Card)`
  max-height: 360px;
  overflow-y: auto;
`;

const LeaderboardList = styled.ul`
  list-style: none;
  padding: 0;
  margin: 15px 0;
`;


const LeaderboardItem = styled.li`
  display: grid;
  grid-template-columns: 40px 1fr 80px; /* rank | name | XP */
  align-items: center;
  padding: 10px 0;
  border-bottom: 1px solid #eee;
  gap: 10px;
  &:last-child {
    border-bottom: none;
  }
`;

const RankIcon = styled.div`
  text-align: center;
  font-size: 18px;
`;

const UserInfo = styled.div`
  font-weight: 600;
  font-size: 15px;
`;

const XPText = styled.div`
  text-align: right;
  font-weight: 500;
  color: #615bb0;
  font-size: 12px;
`;

const ButtonLink = styled.a`
  display: inline-block;
  margin-top: 15px;
  background: linear-gradient(135deg,#667eea 0%,#764ba2 100%);
  color: #fff;
  padding: 8px 16px;
  border-radius: 12px;
  text-decoration: none;
  font-weight: 600;
  font-size: 14px;
  transition: all 0.3s ease;
  &:hover {
    background: linear-gradient(135deg,#764ba2 0%,#667eea 100%);
  }
`;
