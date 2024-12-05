import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import LoginPage from './LoginPage';
import RegisterPage from './RegisterPage';
import HomePage from './HomePage';
import AuthCallback from './AuthCallback';  // 카카오 로그인 후 리디렉션 처리 컴포넌트 추가
import MainPage from './MainPage';  // 로그인 후 메인 화면 컴포넌트 추가
import Jobs from './Jobs';  // Jobs 컴포넌트 임포트
import Companies from './Companies';  // Companies 컴포넌트 임포트
import Resumes from './Resumes';  // Resumes 컴포넌트 임포트
import Recommendations from './Recommendations';  // Recommendations 컴포넌트 임포트


function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<HomePage />} />
        <Route path="/login" element={<LoginPage />} />
        <Route path="/register" element={<RegisterPage />} />
        <Route path="/auth" element={<AuthCallback />} />  {/* 카카오 로그인 후 처리 */}
        <Route path="/main" element={<MainPage />} />  {/* 로그인 후 메인 화면 */}
        <Route path="/jobs" element={<Jobs />} />  {/* 채용 페이지 */}
        <Route path="/Companies" element={<Companies />} />  {/* 기업 페이지 */}
        <Route path="/resumes" element={<Resumes />} />  {/* 이력서 페이지 */}
        <Route path="/recommendations" element={<Recommendations />} />  {/* 직군 추천 페이지 */}
      </Routes>
    </Router>
  );
}

export default App;