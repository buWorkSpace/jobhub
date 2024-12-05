import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { Clock, MapPin, Briefcase, Calendar } from 'lucide-react';
import './JobListing.css';

const JobCard = ({ job }) => {
  const extractDeadline = (deadlineText) => {
    const regex = /(\d{2})\/(\d{2})\((.)\)/;
    const match = deadlineText.match(regex);
    if (match) {
      const month = parseInt(match[1], 10);
      const day = parseInt(match[2], 10);
      const year = new Date().getFullYear();
      return new Date(year, month - 1, day);
    }
    return null;
  };

  const deadlineDate = extractDeadline(job.deadline);
  const currentDate = new Date();

  let remainingDays = null;
  if (deadlineDate) {
    const timeDifference = deadlineDate - currentDate;
    remainingDays = Math.floor(timeDifference / (1000 * 60 * 60 * 24));
  }

  return (
    <div className="job-card">
      <div className="job-card-content">
        <div className="job-card-header">
          <h2 className="job-title">{job.title}</h2>
          <span className="job-deadline">
            D-{remainingDays >= 0 ? remainingDays : 0}
          </span>
        </div>
        <div className="job-card-details">
          <div className="job-detail">
            <Briefcase className="job-icon blue" />
            <span>{job.company}</span>
          </div>
          <div className="job-detail">
            <MapPin className="job-icon green" />
            <span>{job.location}</span>
          </div>
          <div className="job-detail">
            <Clock className="job-icon purple" />
            <span>{job.experience}</span>
          </div>
          <div className="job-detail">
            <Calendar className="job-icon red" />
            <span>마감일: {job.deadline}</span>
          </div>
          <div className="job-detail">
            <span>구인 유형: {job.jobType}</span>
          </div>
        </div>
      </div>
      <div className="job-card-actions">
        <a 
          href={job.jobUrl} 
          target="_blank" 
          rel="noopener noreferrer"
          className="job-details-link"
        >
          상세 정보
        </a>
      </div>
    </div>
  );
};

const Jobs = () => {
  const [jobs, setJobs] = useState([]);
  const [filteredJobs, setFilteredJobs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [currentPage, setCurrentPage] = useState(1);
  const [searchQuery, setSearchQuery] = useState(''); // 검색어 상태 추가
  const jobsPerPage = 10;

  useEffect(() => {
    axios.get('http://localhost:5000/api/crawl')
      .then(response => {
        if (response.data.success) {
          setJobs(response.data.jobs);
          setFilteredJobs(response.data.jobs); // 초기 데이터로 필터링된 구인 공고 설정
          setLoading(false);
        } else {
          console.log('크롤링된 데이터가 없습니다.');
          setLoading(false);
        }
      })
      .catch(error => {
        console.error('데이터 로딩 오류:', error);
        setLoading(false);
      });
  }, []);

  // 검색 필터링 함수
  const handleSearch = (e) => {
    const query = e.target.value;
    setSearchQuery(query);

    // 검색어로 구인 공고 필터링
    if (query) {
      const filtered = jobs.filter((job) =>
        job.title.toLowerCase().includes(query.toLowerCase()) ||
        job.company.toLowerCase().includes(query.toLowerCase()) ||
        job.location.toLowerCase().includes(query.toLowerCase())
      );
      setFilteredJobs(filtered);
    } else {
      setFilteredJobs(jobs); // 검색어가 없으면 원래 목록으로 돌아옴
    }
  };

  const indexOfLastJob = currentPage * jobsPerPage;
  const indexOfFirstJob = indexOfLastJob - jobsPerPage;
  const currentJobs = filteredJobs.slice(indexOfFirstJob, indexOfLastJob);

  const paginate = (pageNumber) => setCurrentPage(pageNumber);

  const pageNumbers = [];
  const totalPages = Math.ceil(filteredJobs.length / jobsPerPage);
  
  const range = 2;
  const startPage = Math.max(1, currentPage - range);
  const endPage = Math.min(totalPages, currentPage + range);

  for (let i = startPage; i <= endPage; i++) {
    pageNumbers.push(i);
  }

  const prevPage = currentPage > 1 ? currentPage - 1 : null;
  const nextPage = currentPage < totalPages ? currentPage + 1 : null;

  if (loading) {
    return (
      <div className="loading-container">
        <div className="loading-spinner"></div>
      </div>
    );
  }

  return (
    <div className="jobs-container">
      <h1 className="jobs-title">구인 공고</h1>

      {/* 검색 입력 필드 */}
      <div className="search-container">
        <input
          type="text"
          placeholder="구인 공고 검색"
          value={searchQuery}
          onChange={handleSearch}
          className="search-input"
        />
      </div>

      {filteredJobs.length > 0 ? (
        <div className="job-grid">
          {currentJobs.map((job, index) => (
            <JobCard key={index} job={job} />
          ))}
        </div>
      ) : (
        <div className="no-jobs">
          <p>현재 구인 공고가 없습니다.</p>
        </div>
      )}

      <div className="pagination">
        {prevPage && (
          <button 
            onClick={() => paginate(prevPage)} 
            className="page-button"
          >
            이전
          </button>
        )}
        {pageNumbers.map((number) => (
          <button 
            key={number} 
            onClick={() => paginate(number)} 
            className={`page-button ${currentPage === number ? 'active' : ''}`}
          >
            {number}
          </button>
        ))}
        {nextPage && (
          <button 
            onClick={() => paginate(nextPage)} 
            className="page-button"
          >
            다음
          </button>
        )}
      </div>

      <div className="total-pages">
        <p>{`전체 페이지: ${totalPages}`}</p>
      </div>
    </div>
  );
};

export default Jobs;
