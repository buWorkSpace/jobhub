import React, { useState, useEffect } from 'react';
import axios from 'axios';

const JobList = () => {
  // 직무 목록을 저장할 상태 변수
  const [jobList, setJobList] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    // 컴포넌트가 마운트될 때 API 호출
    axios.get('http://localhost:5000/api/jobs')
      .then(response => {
        if (response.data.success) {
          setJobList(response.data.jobs);  // 직무 목록 데이터를 상태에 저장
        } else {
          setError('직무 목록을 불러오는 데 실패했습니다.');
        }
      })
      .catch(error => {
        console.error('API 호출 오류:', error);
        setError('서버 오류가 발생했습니다.');
      })
      .finally(() => {
        setLoading(false);  // 로딩 상태 종료
      });
  }, []);  // 빈 배열을 넣어 한 번만 호출되도록 설정

  if (loading) {
    return <div>로딩 중...</div>;
  }

  if (error) {
    return <div>{error}</div>;
  }

  return (
    <div>
      <h1>직무 목록</h1>
      <ul>
        {jobList.map((job, index) => (
          <li key={index}>
            <a href={job.url}>{job.title}</a> - {job.company} - {job.location}
          </li>
        ))}
      </ul>
    </div>
  );
};

export default JobList;