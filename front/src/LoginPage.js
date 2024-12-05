import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useNavigate, useLocation } from 'react-router-dom';
import './login-page.css';

const LoginPage = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const navigate = useNavigate();
  const location = useLocation();

  // 카카오 로그인 인증 코드 처리
  useEffect(() => {
    const params = new URLSearchParams(location.search);
    const code = params.get('code'); // 리다이렉트 URL에서 인증 코드 추출

    if (code) {
      handleKakaoAuth(code);
    }
  }, [location]);

  // 카카오 인증 후 토큰 받아오기
  const handleKakaoAuth = async (code) => {
    try {
      const response = await axios.post('http://localhost:5000/api/kakao-login', { code });
      if (response.data.success) {
        alert('로그인 성공!');
        navigate('/main'); // 메인 페이지로 이동
      } else {
        setError(response.data.message);
      }
    } catch (err) {
      setError('카카오 로그인 중 오류 발생');
    }
  };

  const handleLogin = async (e) => {
    e.preventDefault();
    setError('');
    setIsLoading(true);

    try {
      const response = await axios.post('http://localhost:5000/api/login', { email, password });
      if (response.data.success) {
        alert('로그인 성공!');
        navigate('/main');
      } else {
        setError(response.data.message);
      }
    } catch (err) {
      setError('로그인 중 오류 발생');
    } finally {
      setIsLoading(false);
    }
  };

  const handleKakaoLogin = () => {
    const REST_API_KEY = 'ec96ef10095fbc88dedef9f54e2ddc78';
    const REDIRECT_URI = 'http://localhost:3000/auth';
    const KAKAO_AUTH_URL = `https://kauth.kakao.com/oauth/authorize?client_id=${REST_API_KEY}&redirect_uri=${REDIRECT_URI}&response_type=code`;
    window.location.href = KAKAO_AUTH_URL;
  };

  return (
    <div className="login-page">
      <div className="login-form">
        <h2>로그인</h2>
        <form onSubmit={handleLogin}>
          <input
            type="email"
            placeholder="이메일"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
          />
          <input
            type="password"
            placeholder="비밀번호"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
          />
          <button type="submit" disabled={isLoading}>로그인</button>
          {isLoading && <p>로딩 중...</p>}
        </form>

        {error && <p className="error-message">{error}</p>}

        <button onClick={handleKakaoLogin} className="kakao-login-button">
          카카오 로그인
        </button>
        <p className="register-link">
          아직 계정이 없으신가요? <a href="/register">회원가입</a>
        </p>
      </div>
    </div>
  );
};

export default LoginPage;
