import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import LoginPage from './LoginPage';
import RegisterPage from './RegisterPage';
import AuthCallback from './AuthCallback';  // 카카오 로그인 후 리디렉션 처리 컴포넌트 추가
import MainPage from './MainPage';  // 로그인 후 메인 화면 컴포넌트 추가
import Jobs from './Jobs';  // Jobs 컴포넌트 임포트
import Companies from './Companies';  // Companies 컴포넌트 임포트
import Resumes from './Resumes';  // Resumes 컴포넌트 임포트
import ChatUI from './ChatUI';  // ChatUI 컴포넌트 임포트
import MyPage from './MyPage';  // MyPage 컴포넌트 임포트

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<MainPage />} />
        <Route path="/login" element={<LoginPage />} />
        <Route path="/register" element={<RegisterPage />} />
        <Route path="/auth" element={<AuthCallback />} />  {/* 카카오 로그인 후 처리 */}
        <Route path="/main" element={<MainPage />} />  {/* 로그인 후 메인 화면 */}
        <Route path="/jobs" element={<Jobs />} />  {/* 채용 페이지 */}
        <Route path="/companies" element={<Companies />} />  {/* 기업 페이지 */}
        <Route path="/resumes" element={<Resumes />} />  {/* 이력서 페이지 */}
        <Route path="/chatui" element={<ChatUI />} />  {/* 직군 추천 페이지 */}
        <Route path="/mypage" element={<MyPage />} />  {/* 마이페이지 */}
      </Routes>
    </Router>
  );
}

export default App;
