import React, { useState, useEffect } from 'react';
import { getDatabase, ref, onValue } from 'https://www.gstatic.com/firebasejs/11.0.2/firebase-database.js';
import { initializeApp } from 'https://www.gstatic.com/firebasejs/11.0.2/firebase-app.js';
import { CourseCard } from './CourseCard';
import imageGotcha from '../../assets/gotcha.png';

const firebaseConfig = {
  apiKey: "AIzaSyC94X37bt_vhaq5sFVOB_ANhZPuE6219Vo",
  authDomain: "project-pro-7f7ef.firebaseapp.com",
  databaseURL: "https://project-pro-7f7ef-default-rtdb.firebaseio.com",
  projectId: "project-pro-7f7ef",
  storageBucket: "project-pro-7f7ef.firebasestorage.app",
  messagingSenderId: "782106516432",
  appId: "1:782106516432:web:d4cd4fb8dec8572d2bb7d5",
  measurementId: "G-WV8HFBFPND",
};

const app = initializeApp(firebaseConfig);
const database = getDatabase(app);

const CourseGrid = ({ student }) => {
  const [courses, setCourses] = useState([]);
  const [groupsData, setGroupsData] = useState(null); // Default qiymatni `null` qilib qo'ydik
  const [courseAbout, setCourseAbout] = useState([]);

  const oddDays = ["Dushanba", "Chorshanba", "Juma"];
  const evenDays = ["Seshanba", "Payshanba", "Shanba"];

  useEffect(() => {
    if (!student?.group) return;

    const groupsRef = ref(database, `Groups/${student.group}`);
    const unsubscribe = onValue(groupsRef, (snapshot) => {
      const data = snapshot.val();
      setGroupsData(data);
    });

    return () => unsubscribe();
  }, [student.group]);

  useEffect(() => {
    if (!groupsData?.courses) return;

    const coursesRef = ref(database, `Courses/${groupsData.courses}`);
    const unsubscribe = onValue(coursesRef, (snapshot) => {
      const data = snapshot.val();
      setCourseAbout(data);
    });

    return () => unsubscribe();
  }, [groupsData]);

  useEffect(() => {
    if (!groupsData || !courseAbout) return;

    const newStudent = {
      studentName: student.studentName,
      name: student.group,
      balance: "307,692.31",
      dateRange: "2025-01-25/2025-09-25",
      teacher: groupsData.teachers || "Hali kiritilmagan",
      time: courseAbout.duration || "Hali kiritilmagan",
      days: student.days === "Juft kunlar" ? evenDays
           : student.days === "Toq kunlar" ? oddDays
           : ["Hali kiritilmagan"],
      startDate: "2025-01-25",
      endDate: "2025-01-25",
      nextPayment: "2025-02-01",
      paymentAmount: student.balance || 0,
    };

    setCourses([newStudent]);
  }, [groupsData, courseAbout, student]);

  return (
    <div className={`grid ${groupsData ? "md:grid-cols-2" : "grid-cols-1"} gap-6 p-4`}>
      {Array.isArray(courses) && courses.some(course => course.name) ? (
        courses.map((course, index) => (
          <CourseCard key={index} course={course} />
        ))
      ) : (
        <div className="flex flex-col items-center justify-center w-full h-full">
          <img src={imageGotcha} alt="No groups available" className="w-40 h-40" />
          <p className="text-gray-500 mt-4">Guruhlar mavjud emas</p>
        </div>
      )}
    </div>
  );
};

export default CourseGrid;