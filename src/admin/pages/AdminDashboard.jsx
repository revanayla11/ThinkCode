import { useEffect, useState } from "react";
import styled from "styled-components"; 
import AdminCard from "../components/AdminCard";
import { apiGet } from "../../services/api";
import { 
  Users, 
  BookOpen, 
  MessageCircle, 
  Clock, 
  TrendingUp, 
  Star, 
  Activity 
} from "lucide-react"; // Install: npm i lucide-react

export default function AdminDashboard() {
  const [stats, setStats] = useState({
    totalSiswa: 0,
    totalMateri: 0,
    totalRoom: 0,
    pendingSubmission: 0,
    avgProgress: 0,
    topXP: [],
  });
  const [recentActivity, setRecentActivity] = useState([]);

  useEffect(() => {
    async function load() {
      try {
        const s = await apiGet("/admin/summary");
        setStats(s);
        const act = await apiGet("/admin/recent-activity?limit=10");
        setRecentActivity(act);
      } catch (e) {
        console.error("Load dashboard", e);
      }
    }
    load();
  }, []);

  return (
    <DashboardContainer>
      {/* HERO HEADER */}
      <HeroHeader>
        <HeroContent>
          <HeroTitle>Dashboard Admin</HeroTitle>
          <HeroSubtitle>Selamat datang! Kelola pembelajaran coding siswa dengan mudah</HeroSubtitle>
        </HeroContent>
        <HeroStats>
          <StatItem>
            <StatNumber>{stats.totalSiswa}</StatNumber>
            <StatLabel>Siswa Aktif</StatLabel>
          </StatItem>
          <StatItem>
            <StatNumber>{stats.totalMateri}</StatNumber>
            <StatLabel>Materi</StatLabel>
          </StatItem>
        </HeroStats>
      </HeroHeader>

      {/* STATS CARDS */}
      <StatsSection>
        <SectionTitle>
          <TrendingUp size={24} />
          Statistik Utama
        </SectionTitle>
        <StatsGrid>
          <AdminCard 
            title="Total Siswa" 
            value={stats.totalSiswa}
            icon={<Users size={32} />}
            trend="+12%"
            color="#10b981"
          />
          <AdminCard 
            title="Total Materi" 
            value={stats.totalMateri}
            icon={<BookOpen size={32} />}
            trend="+3"
            color="#3b82f6"
          />
          <AdminCard 
            title="Ruang Diskusi" 
            value={stats.totalRoom}
            icon={<MessageCircle size={32} />}
            trend="+5"
            color="#f59e0b"
          />
          <AdminCard 
            title="Pending Submission" 
            value={stats.pendingSubmission}
            icon={<Clock size={32} />}
            trend="+8"
            color="#ef4444"
            warning
          />
          <AdminCard 
            title="Progress Rata-rata" 
            value={`${stats.avgProgress}%`}
            icon={<TrendingUp size={32} />}
            trend={`+${stats.avgProgress - 65}%`}
            color="#8b5cf6"
          />
        </StatsGrid>
      </StatsSection>

      {/* MAIN CONTENT */}
      <ContentGrid>
        {/* TOP XP */}
        <SectionCard>
          <SectionHeader>
            <div>
              <SectionTitle>
                <Star size={24} />
                Top XP Siswa
              </SectionTitle>
              <SectionSubtitle>Leaderboard minggu ini</SectionSubtitle>
            </div>
          </SectionHeader>
          
          <TopXPList>
            {stats.topXP?.slice(0, 5).map((t, i) => (
              <XPItem key={i}>
                <Rank $rank={i}>
                  <span>{i + 1}</span>
                </Rank>
                <XPInfo>
                  <XPName>{t.name}</XPName>
                  <XPValue>{t.xp.toLocaleString()} XP</XPValue>
                </XPInfo>
                <XPBar $progress={Math.min((t.xp / 5000) * 100, 100)} />
              </XPItem>
            ))}
          </TopXPList>
        </SectionCard>

        {/* RECENT ACTIVITY */}
        <SectionCard>
          <SectionHeader>
            <div>
              <SectionTitle>
                <Activity size={24} />
                Aktivitas Terbaru
              </SectionTitle>
              <SectionSubtitle>10 aktivitas terakhir</SectionSubtitle>
            </div>
          </SectionHeader>
          
          <ActivityList>
            {recentActivity.slice(0, 8).map((r) => (
              <ActivityItem key={r.id}>
                <ActivityIcon>
                  <Clock size={16} />
                </ActivityIcon>
                <ActivityContent>
                  <ActivityUser>{r.user}</ActivityUser>
                  <ActivityAction>{r.action}</ActivityAction>
                </ActivityContent>
                <ActivityTime>{r.time}</ActivityTime>
              </ActivityItem>
            ))}
          </ActivityList>
        </SectionCard>
      </ContentGrid>

      {/* QUICK ACTIONS */}
      <QuickActions>
        <ActionButton color="#10b981">
          ➕ Buat Materi Baru
        </ActionButton>
        <ActionButton color="#3b82f6">
          📊 Lihat Analitik
        </ActionButton>
        <ActionButton color="#f59e0b">
          👥 Kelola Siswa
        </ActionButton>
        <ActionButton color="#ef4444">
          ⚠️ Review Submission
        </ActionButton>
      </QuickActions>
    </DashboardContainer>
  );
}

// Styled Components - MODERN DESIGN
const DashboardContainer = styled.div`
  padding: 24px;
  max-width: 1400px;
  margin: 0 auto;
  font-family: 'Inter', -apple-system, BlinkMacSystemFont, sans-serif;
`;

const HeroHeader = styled.div`
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  border-radius: 24px;
  padding: 40px;
  margin-bottom: 32px;
  color: white;
  position: relative;
  overflow: hidden;

  &::before {
    content: '';
    position: absolute;
    top: 0;
    left: 0;
    right: 0;
    bottom: 0;
    background: url('data:image/svg+xml,<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100"><defs><pattern id="grain" width="100" height="100" patternUnits="userSpaceOnUse"><circle cx="25" cy="25" r="1" fill="rgba(255,255,255,0.1)"/><circle cx="75" cy="75" r="1.5" fill="rgba(255,255,255,0.05)"/></pattern></defs><rect width="100" height="100" fill="url(%23grain)"/></svg>');
    opacity: 0.3;
  }
`;

const HeroContent = styled.div`
  display: flex;
  flex-direction: column;
  gap: 8px;
  z-index: 1;
  position: relative;
`;

const HeroTitle = styled.h1`
  font-size: clamp(2rem, 5vw, 3.5rem);
  font-weight: 800;
  margin: 0;
  letter-spacing: -0.02em;
  line-height: 1.1;
`;

const HeroSubtitle = styled.p`
  font-size: 1.2rem;
  opacity: 0.95;
  margin: 0;
  max-width: 500px;
`;

const HeroStats = styled.div`
  display: flex;
  gap: 32px;
  margin-top: 32px;
  z-index: 1;
  position: relative;
`;

const StatItem = styled.div`
  text-align: center;
`;

const StatNumber = styled.div`
  font-size: 2.5rem;
  font-weight: 800;
  background: rgba(255,255,255,0.2);
  padding: 12px 24px;
  border-radius: 16px;
  backdrop-filter: blur(10px);
  margin-bottom: 4px;
`;

const StatLabel = styled.div`
  font-size: 0.95rem;
  opacity: 0.9;
  font-weight: 500;
`;

const StatsSection = styled.section`
  margin-bottom: 40px;
`;

const SectionTitle = styled.div`
  display: flex;
  align-items: center;
  gap: 12px;
  font-size: 1.75rem;
  font-weight: 700;
  color: #1f2937;
  margin-bottom: 24px;
`;

const StatsGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(280px, 1fr));
  gap: 24px;
`;

const ContentGrid = styled.div`
  display: grid;
  grid-template-columns: 2fr 1fr;
  gap: 32px;
  margin-bottom: 40px;

  @media (max-width: 1024px) {
    grid-template-columns: 1fr;
  }
`;

const SectionCard = styled.div`
  background: white;
  border-radius: 20px;
  padding: 32px;
  box-shadow: 0 10px 40px rgba(0,0,0,0.08);
  border: 1px solid rgba(0,0,0,0.05);
  transition: all 0.3s ease;

  &:hover {
    box-shadow: 0 20px 60px rgba(0,0,0,0.12);
    transform: translateY(-4px);
  }
`;

const SectionHeader = styled.div`
  margin-bottom: 28px;
  padding-bottom: 20px;
  border-bottom: 2px solid #f3f4f6;
`;

const SectionSubtitle = styled.p`
  color: #6b7280;
  font-size: 0.95rem;
  margin: 4px 0 0 0;
`;

const TopXPList = styled.div`
  display: flex;
  flex-direction: column;
  gap: 12px;
`;

const XPItem = styled.div`
  display: flex;
  align-items: center;
  gap: 16px;
  padding: 20px;
  background: #f8fafc;
  border-radius: 16px;
  border: 2px solid transparent;
  transition: all 0.2s ease;

  &:hover {
    background: white;
    border-color: #e5e7eb;
    transform: translateX(4px);
  }
`;

const Rank = styled.div`
  width: 48px;
  height: 48px;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  font-weight: 800;
  font-size: 1.1rem;
  color: white;

  ${({ $rank }) => {
    if ($rank === 0) return `background: linear-gradient(135deg, #f59e0b, #fbbf24);`;
    if ($rank === 1) return `background: linear-gradient(135deg, #f97316, #fb923c);`;
    if ($rank === 2) return `background: linear-gradient(135deg, #10b981, #059669);`;
    return `background: #d1d5db; color: #6b7280;`;
  }}
`;

const XPInfo = styled.div`
  flex: 1;
`;

const XPName = styled.div`
  font-weight: 600;
  color: #1f2937;
  font-size: 1rem;
`;

const XPValue = styled.div`
  color: #6b7280;
  font-size: 0.9rem;
  margin-top: 2px;
`;

const XPBar = styled.div`
  height: 8px;
  width: 120px;
  background: #e5e7eb;
  border-radius: 4px;
  overflow: hidden;

  &::after {
    content: '';
    height: 100%;
    background: linear-gradient(90deg, #10b981, #059669);
    border-radius: 4px;
    width: ${({ $progress }) => $progress}%;
    transition: width 0.3s ease;
  }
`;

const ActivityList = styled.div`
  display: flex;
  flex-direction: column;
  gap: 12px;
`;

const ActivityItem = styled.div`
  display: flex;
  align-items: center;
  gap: 16px;
  padding: 16px 20px;
  background: #f8fafc;
  border-radius: 12px;
  border-left: 4px solid #e5e7eb;
  transition: all 0.2s ease;

  &:hover {
    background: white;
    border-left-color: #10b981;
    transform: translateX(4px);
  }
`;

const ActivityIcon = styled.div`
  width: 40px;
  height: 40px;
  border-radius: 12px;
  background: #10b981;
  display: flex;
  align-items: center;
  justify-content: center;
  color: white;
  flex-shrink: 0;
`;

const ActivityContent = styled.div`
  flex: 1;
`;

const ActivityUser = styled.div`
  font-weight: 600;
  color: #1f2937;
  font-size: 0.95rem;
`;

const ActivityAction = styled.div`
  color: #6b7280;
  font-size: 0.9rem;
  margin-top: 2px;
`;

const ActivityTime = styled.div`
  color: #9ca3af;
  font-size: 0.85rem;
  font-weight: 500;
  white-space: nowrap;
`;

const QuickActions = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(220px, 1fr));
  gap: 20px;
  margin-top: 40px;
`;

const ActionButton = styled.button`
  padding: 20px 24px;
  border: none;
  border-radius: 16px;
  font-weight: 700;
  font-size: 15px;
  cursor: pointer;
  transition: all 0.3s ease;
  box-shadow: 0 8px 25px rgba(0,0,0,0.12);
  color: white;
  position: relative;
  overflow: hidden;

  ${({ color }) => `
    background: linear-gradient(135deg, ${color}22 0%, ${color}44 100%);
    border: 2px solid ${color}55;
  `}

  &:hover {
    transform: translateY(-4px);
    box-shadow: 0 16px 40px rgba(0,0,0,0.2);
  }

  &::before {
    content: '';
    position: absolute;
    top: 0;
    left: -100%;
    width: 100%;
    height: 100%;
    background: linear-gradient(90deg, transparent, rgba(255,255,255,0.3), transparent);
    transition: left 0.5s;
  }

  &:hover::before {
    left: 100%;
  }
`;