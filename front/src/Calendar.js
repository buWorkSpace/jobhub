import React, { useState, useEffect } from 'react';
import Calendar from 'react-calendar';
import 'react-calendar/dist/Calendar.css'; // 스타일링을 위한 기본 CSS
import axios from 'axios';

const InterviewCalendar = () => {
  const [date, setDate] = useState(new Date());
  const [appointments, setAppointments] = useState([]);
  const [newAppointment, setNewAppointment] = useState('');

  useEffect(() => {
    // 기존 면접 일정을 서버에서 가져오기
    axios.get('/api/interview-schedules')
      .then(response => setAppointments(response.data))
      .catch(error => console.error('일정 가져오기 실패:', error));
  }, []);

  // 날짜 선택 처리
  const handleDateChange = (newDate) => {
    setDate(newDate);
  };

  // 일정 추가 처리
  const handleAddAppointment = () => {
    if (!newAppointment) return;

    const appointmentData = {
      date: date.toISOString().split('T')[0], // YYYY-MM-DD 형식
      description: newAppointment,
    };

    // 서버에 일정 추가 요청
    axios.post('/api/interview-schedules', appointmentData)
      .then(response => {
        setAppointments([...appointments, response.data]); // 새 일정을 상태에 추가
        setNewAppointment(''); // 입력란 초기화
      })
      .catch(error => console.error('일정 추가 실패:', error));
  };

  // 선택된 날짜의 면접 일정 필터링
  const selectedDateAppointments = appointments.filter(
    (appointment) => appointment.date === date.toISOString().split('T')[0]
  );

  return (
    <div className="calendar-container">
      <h3>면접 일정 관리</h3>
      <Calendar
        onChange={handleDateChange}
        value={date}
      />

      <div className="appointments">
        <h4>선택된 날짜: {date.toISOString().split('T')[0]}</h4>
        <ul>
          {selectedDateAppointments.length > 0 ? (
            selectedDateAppointments.map((appointment, index) => (
              <li key={index}>{appointment.description}</li>
            ))
          ) : (
            <p>이 날짜에는 면접 일정이 없습니다.</p>
          )}
        </ul>
      </div>

      <div className="add-appointment">
        <input
          type="text"
          value={newAppointment}
          onChange={(e) => setNewAppointment(e.target.value)}
          placeholder="면접 일정 추가"
        />
        <button onClick={handleAddAppointment}>추가</button>
      </div>
    </div>
  );
};

export default InterviewCalendar;