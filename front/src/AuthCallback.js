import React, { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';

const AuthCallback = () => {
  const navigate = useNavigate();

  useEffect(() => {
    const code = new URLSearchParams(window.location.search).get('code'); // URL에서 'code' 값 가져오기

    if (code) {
      axios
        .get(`http://localhost:5000/auth?code=${code}`)  // 백엔드로 code 전달
        .then((response) => {
          if (response.data.success) {
            navigate('/main');  // 인증 성공 후 메인 화면으로 이동
          } else {
            alert('로그인 실패');
          }
        })
        .catch((error) => {
          console.error('카카오 로그인 에러:', error);
          alert('로그인 성공');
        });
    }
  }, [navigate]);

  return <div>로그인 중...</div>;
};

export default AuthCallback;
