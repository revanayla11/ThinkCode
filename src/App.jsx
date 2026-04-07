import { Routes, Route } from "react-router-dom";

import Login from "./pages/Login";
import Register from "./pages/Register";
import Home from "./pages/Home";
import Tutorial from "./pages/Tutorial";
import About from "./pages/About";
import Help from "./pages/Help";
import Dashboard from "./pages/Dashboard";
import Leaderboard from "./pages/Leaderboard";
import Achievement from "./pages/Achievement";
import Profile from "./pages/Profile";
import GamePlay from "./pages/GamePlay";
import MateriList from "./pages/MateriList";
import MateriDetail from "./pages/MateriDetail";
import DiscussionRooms from "./pages/DiscussionRooms";
import DiscussionRoom from "./pages/DiscussionRoom";
import UploadAnswer from "./pages/UploadAnswer";
import MiniGame from "./pages/MiniGame";

// ADMIN
import AdminLayout from "./admin/layouts/AdminLayout";
import AdminDashboard from "./admin/pages/AdminDashboard";
import AdminMateri from "./admin/pages/AdminMateri";
import AdminRoomMateri from "./admin/pages/AdminRoomMateri";
import AdminRooms from "./admin/pages/AdminRooms";
import AdminRoomDetail from "./admin/pages/AdminRoomDetail";
import AdminUsers from "./admin/pages/AdminUsers";
import AdminSubmission from "./admin/pages/AdminSubmission";
import LeaderboardAdmin from "./admin/pages/LeaderboardAdmin";
import AdminMateriEditor from "./admin/pages/AdminMateriEditor";
import AdminMiniGame from "./admin/pages/AdminMiniGame";
import BadgesAdmin from "./admin/pages/BadgesAdmin";
import AdminProfile from "./admin/pages/AdminProfile";
import Logout from "./admin/pages/Logout";
import AdminUserAdd from "./admin/pages/AdminUserAdd";
import AdminUserImport from "./admin/pages/AdminUserImport";
import AdminUserProfilePage from "./admin/pages/AdminUserProfilePage";

function App() {
  return (
    <Routes>
      {/* ================= USER ================= */}
      <Route path="/" element={<Home />} />
      <Route path="/tutorial" element={<Tutorial />} />
      <Route path="/about" element={<About />} />
      <Route path="/help" element={<Help />} />
      <Route path="/login" element={<Login />} />
      <Route path="/register" element={<Register />} />
      <Route path="/dashboard" element={<Dashboard />} />
      <Route path="/materi" element={<MateriList />} />
      <Route path="/materi/:id" element={<MateriDetail />} />
      <Route path="/materi/:id/discussion" element={<DiscussionRooms />} />
      <Route path="/materi/:materiId/room/:roomId" element={<DiscussionRoom />} />
      <Route
        path="/materi/:materiId/room/:roomId/upload-jawaban"
        element={<UploadAnswer />}
      />
      <Route path="/leaderboard" element={<Leaderboard />} />
      <Route path="/achievement" element={<Achievement />} />
      <Route path="/profile" element={<Profile />} />
      <Route path="/game" element={<MiniGame />} />
      <Route path="/game/play/:id" element={<GamePlay />} />

      {/* ================= ADMIN ================= */}
      <Route path="/admin" element={<AdminLayout />}>
        <Route index element={<AdminDashboard />} />
        <Route path="materi" element={<AdminMateri />} />
        <Route path="materi/:id/edit" element={<AdminMateriEditor />} />
        <Route path="roommateri" element={<AdminRoomMateri />} />
        <Route path="rooms/:materiId" element={<AdminRooms />} />
        <Route path="rooms/detail/:roomId" element={<AdminRoomDetail />} />
        <Route path="users" element={<AdminUsers />} />
        <Route path="users/add" element={<AdminUserAdd />} />
        <Route path="users/import" element={<AdminUserImport />} />
        <Route path="users/:id" element={<AdminUserProfilePage />} />
        <Route path="submission" element={<AdminSubmission />} />
        <Route path="leaderboard" element={<LeaderboardAdmin />} />
        <Route path="minigame" element={<AdminMiniGame />} />
        <Route path="badges" element={<BadgesAdmin />} />
        <Route path="profile" element={<AdminProfile />} />
      </Route>

      <Route path="/logout" element={<Logout />} />
    </Routes>
  );
}

export default App;
