import { BrowserRouter, Routes, Route } from "react-router";
import { AuthProvider } from "./contexts/AuthContext";
import ProtectedRoute from "./components/ProtectedRoute";
import Layout from "./components/Layout";
import LandingPage from "./pages/LandingPage";
import SignupPage from "./pages/SignupPage";
import LoginPage from "./pages/LoginPage";
import DashboardPage from "./pages/DashboardPage";
import NewAbstinencePage from "./pages/NewAbstinencePage";
import TimelinePage from "./pages/TimelinePage";
import TimelineDetailPage from "./pages/TimelineDetailPage";
import MyPage from "./pages/MyPage";
import CheckinPage from "./pages/CheckinPage";

function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <Routes>
          {/* 탭 바 없는 화면 (비로그인) */}
          <Route path="/" element={<LandingPage />} />
          <Route path="/signup" element={<SignupPage />} />
          <Route path="/login" element={<LoginPage />} />

          {/* 탭 바 있는 화면 (로그인 필수) */}
          <Route element={<ProtectedRoute />}>
            <Route element={<Layout />}>
              <Route path="/dashboard" element={<DashboardPage />} />
              <Route path="/timeline" element={<TimelinePage />} />
              <Route path="/mypage" element={<MyPage />} />
            </Route>

            {/* 탭 바 없는 화면 (로그인 필수) */}
            <Route path="/abstinence/new" element={<NewAbstinencePage />} />
            <Route path="/timeline/:id" element={<TimelineDetailPage />} />
            <Route path="/abstinence/:id/checkin" element={<CheckinPage />} />
          </Route>
        </Routes>
      </BrowserRouter>
    </AuthProvider>
  );
}

export default App;
