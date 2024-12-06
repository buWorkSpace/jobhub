import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom'; // useNavigate로 변경
import Calendar from './Calendar'; // 달력 컴포넌트

const MyPage = () => {
  const [userInfo, setUserInfo] = useState(null);
  const [editing, setEditing] = useState(false);
  const [formData, setFormData] = useState({ username: '', email: '' });
  const navigate = useNavigate(); // useHistory -> useNavigate로 변경

  // 사용자 정보 가져오기
  useEffect(() => {
    axios.get('/api/user-info')
      .then(response => setUserInfo(response.data))
      .catch(error => console.error('사용자 정보 가져오기 실패:', error));
  }, []);

  // 수정 상태 전환
  const handleEditClick = () => {
    setEditing(true);
    setFormData({ username: userInfo.username, email: userInfo.email });
  };

  const handleCancelClick = () => {
    setEditing(false);
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    axios.put('/api/update-user-info', formData)
      .then(response => {
        setUserInfo(formData);
        setEditing(false);
      })
      .catch(error => console.error('회원정보 수정 실패:', error));
  };

  if (!userInfo) return <div>Loading...</div>;

  return (
    <div className="my-page">
      <h2>마이페이지</h2>
      
      <div className="user-info">
        {!editing ? (
          <>
            <p>사용자 이름: {userInfo.username}</p>
            <p>이메일: {userInfo.email}</p>
            <button onClick={handleEditClick}>수정</button>
          </>
        ) : (
          <form onSubmit={handleSubmit}>
            <input
              type="text"
              value={formData.username}
              onChange={(e) => setFormData({ ...formData, username: e.target.value })}
              placeholder="이름"
            />
            <input
              type="email"
              value={formData.email}
              onChange={(e) => setFormData({ ...formData, email: e.target.value })}
              placeholder="이메일"
            />
            <button type="submit">저장</button>
            <button type="button" onClick={handleCancelClick}>취소</button>
          </form>
        )}
      </div>

      <div className="resume-management">
        <h3>이력서 관리</h3>
        <button onClick={() => navigate('/upload-resume')}>이력서 업로드</button> {/* history.push -> navigate로 변경 */}
      </div>

      <div className="interview-schedule">
        <h3>면접 일정 관리</h3>
        <Calendar /> {/* 달력 컴포넌트 */}
      </div>

      <div className="account-settings">
        <h3>회원탈퇴</h3>
        <button onClick={() => axios.delete('/api/delete-account').then(() => navigate('/login'))}>
          회원탈퇴
        </button> {/* history.push -> navigate로 변경 */}
      </div>
    </div>
  );
};

export default MyPage;
