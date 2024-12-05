import React, { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';

const AuthPage = () => {
  const navigate = useNavigate();

  useEffect(() => {
    const getToken = async () => {
      const params = new URLSearchParams(window.location.search);
      const code = params.get('code');
      if (code) {
        try {
          const response = await axios.post('http://localhost:5000/api/kakao-token', { code });
          if (response.data.success) {
            alert('카카오 로그인 성공!');
            navigate('/'); // 메인 페이지로 이동
          } else {
            alert('카카오 로그인 실패');
          }
        } catch (error) {
          alert('카카오 로그인 중 오류 발생');
        }
      }
    };
    getToken();
  }, [navigate]);

  return <div>카카오 로그인 처리 중...</div>;
};

export default AuthPage;
