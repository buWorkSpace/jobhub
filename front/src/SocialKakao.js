import React from 'react';

const SocialKakao = () => {
  const KAKAO_REST_API_KEY = 'ec96ef10095fbc88dedef9f54e2ddc78';  // REST API 키
  const KAKAO_REDIRECT_URI = 'http://localhost:3000/auth';  // 리디렉션 URI

  // 카카오 인증 URL 생성
  const kakaoAuthURL = `https://kauth.kakao.com/oauth/authorize?response_type=code&client_id=${KAKAO_REST_API_KEY}&redirect_uri=${encodeURIComponent(KAKAO_REDIRECT_URI)}`;

  // 로그인 처리 함수
  const handleLogin = () => {
    window.location.href = kakaoAuthURL;  // 카카오 인증 페이지로 리디렉션
  };

  return (
    <button onClick={handleLogin}>카카오 로그인</button>
  );
};

export default SocialKakao;