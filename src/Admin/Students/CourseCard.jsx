import { GraduationCap } from "lucide-react";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "../../components/ui/select";
import { useState, useEffect } from "react";

import { initializeApp } from "https://www.gstatic.com/firebasejs/11.0.2/firebase-app.js";
import { getAnalytics } from "https://www.gstatic.com/firebasejs/11.0.2/firebase-analytics.js";
import {
  getDatabase,
  ref,
  set,
  onValue,
  update,
  get,
  remove,
} from "https://www.gstatic.com/firebasejs/11.0.2/firebase-database.js";

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
const analytics = getAnalytics(app);
const database = getDatabase(app);

const countWeekdaysInMonth = (selectedDays) => {
  const today = new Date();
  const year = today.getFullYear();
  const month = today.getMonth();
  const lastDay = new Date(year, month + 1, 0).getDate();

  const dayMapping = {
    yak: 0, // Yakshanba
    du: 1,  // Dushanba
    se: 2,  // Seshanba
    chor: 3, // Chorshanba
    pay: 4, // Payshanba
    ju: 5,  // Juma
    sha: 6, // Shanba
  };

  let count = {};
  selectedDays.forEach((day) => {
    count[day] = 0; // Har bir kun uchun boshlang'ich qiymat
  });

  for (let day = 1; day <= lastDay; day++) {
    const date = new Date(year, month, day);
    const weekday = date.getDay();

    // Agar kun `selectedDays` ichida bo'lsa, hisoblash
    for (const [key, value] of Object.entries(dayMapping)) {
      if (selectedDays.includes(key) && weekday === value) {
        count[key]++;
      }
    }
  }

  return count;
};

// const countWeekdaysToEndOfMonth = (selectedDays, addedDate) => {
//   const today = new Date();
//   const year = today.getFullYear();
//   const month = today.getMonth();
//   const lastDay = new Date(year, month + 1, 0).getDate();

//   const dayMapping = {
//     yak: 0, // Yakshanba
//     du: 1,  // Dushanba
//     se: 2,  // Seshanba
//     chor: 3, // Chorshanba
//     pay: 4, // Payshanba
//     ju: 5,  // Juma
//     sha: 6, // Shanba
//   };

//   let count = {};
//   selectedDays.forEach((day) => {
//     count[day] = 0; // Har bir kun uchun boshlang'ich qiymat
//   });

//   const startDay = addedDate ? new Date(addedDate).getDate() : today.getDate();

//   for (let day = startDay; day <= lastDay; day++) {
//     const date = new Date(year, month, day);
//     const weekday = date.getDay();

//     // Agar kun `selectedDays` ichida bo'lsa, hisoblash
//     for (const [key, value] of Object.entries(dayMapping)) {
//       if (selectedDays.includes(key) && weekday === value) {
//         count[key]++;
//       }
//     }
//   }

//   return count;
// };

const calculateRemainingDebt = (groupFee, courseFee) => {
  let remainingDebt = courseFee; // Kursning umumiy narxi
  const attendance = groupFee?.attendance || []; // Guruhning `attendance` massivini olish

  attendance.forEach((month) => {
    const totalDays = month.totalDays || 0; // Oylik umumiy dars kunlari soni
    const daysPaid = month.daysPaid || []; // To'langan kunlar massivi

    // Har bir darsning narxini hisoblash
    const perLessonCost = courseFee / totalDays;

    // `true` bo'lgan kunlar sonini hisoblash
    const paidDaysCount = daysPaid.filter((day) => day === true).length;

    // Qolgan qarzdorlikni yangilash
    remainingDebt -= paidDaysCount * perLessonCost;
  });

  return remainingDebt;
};

const initializeAttendance = (selectedDays, addedDate) => {
  const today = new Date();
  const year = today.getFullYear();
  const month = today.getMonth(); // Hozirgi oy
  const lastDay = new Date(year, month + 1, 0).getDate(); // Oyning oxirgi kuni

  const dayMapping = {
    yak: 0, // Yakshanba
    du: 1,  // Dushanba
    se: 2,  // Seshanba
    chor: 3, // Chorshanba
    pay: 4, // Payshanba
    ju: 5,  // Juma
    sha: 6, // Shanba
  };

  const daysPaid = [];

  for (let day = 1; day <= lastDay; day++) {
    const date = new Date(year, month, day);
    const weekday = date.getDay(); // Haftaning kuni (0-6)

    // Agar kun `selectedDays` ichida bo'lsa, massivga qo'shish
    if (Object.entries(dayMapping).some(([key, value]) => selectedDays.includes(key) && weekday === value)) {
      const isBeforeAddedDate = addedDate && new Date(addedDate) > date;
      daysPaid.push({
        date: date.toISOString().split("T")[0], // Sana (YYYY-MM-DD formatda)
        paid: isBeforeAddedDate, // Qo'shilgan sanadan oldingi kunlar uchun `true`, aks holda `false`
      });
    }
  }

  return daysPaid;
};

// const getStudentLessonDays = (selectedDays) => {
//   const today = new Date();
//   const year = today.getFullYear();
//   const month = today.getMonth(); // Hozirgi oy
//   const lastDay = new Date(year, month + 1, 0).getDate(); // Oyning oxirgi kuni

//   const dayMapping = {
//     yak: 0, // Yakshanba
//     du: 1,  // Dushanba
//     se: 2,  // Seshanba
//     chor: 3, // Chorshanba
//     pay: 4, // Payshanba
//     ju: 5,  // Juma
//     sha: 6, // Shanba
//   };

//   const lessonDays = [];

//   for (let day = 1; day <= lastDay; day++) {
//     const date = new Date(year, month, day);
//     const weekday = date.getDay(); // Haftaning kuni (0-6)

//     // Agar kun `selectedDays` ichida bo'lsa, massivga qo'shish
//     if (selectedDays.some((key) => dayMapping[key] === weekday)) {
//       lessonDays.push(date.toISOString().split("T")[0]); // Sana (YYYY-MM-DD formatda)
//     }
//   }

//   return lessonDays;
// };

const getLessonDaysWithDates = (selectedDays) => {
  if (!selectedDays || selectedDays.length === 0) {
    console.error("Selected days are not provided.");
    return {};
  }

  const today = new Date();
  const year = today.getFullYear();
  const month = today.getMonth(); // Hozirgi oy
  const lastDay = new Date(year, month + 1, 0).getDate(); // Oyning oxirgi kuni

  const dayMapping = {
    yak: 0, // Yakshanba
    du: 1,  // Dushanba
    se: 2,  // Seshanba
    chor: 3, // Chorshanba
    pay: 4, // Payshanba
    ju: 4,  // Juma
    sha: 5, // Shanba
  };

  const lessonDays = {};

  // Har bir tanlangan kun uchun massiv yaratamiz
  selectedDays.forEach((day) => {
    lessonDays[day] = [];
  });

  for (let day = 1; day <= lastDay; day++) {
    const date = new Date(year, month, day);
    const weekday = date.getDay(); // Haftaning kuni (0-6)

    // Agar kun `selectedDays` ichida bo'lsa, massivga qo'shish
    for (const [key, value] of Object.entries(dayMapping)) {
      if (selectedDays.includes(key) && weekday === value) {
        lessonDays[key].push(date.toISOString().split("T")[0]); // Sana (YYYY-MM-DD formatda)
      }
    }
  }

  return lessonDays;
};

const getFirstLessonDay = (selectedDays, addedDate) => {
  const today = new Date();
  const year = today.getFullYear();
  const month = today.getMonth(); // Hozirgi oy
  const lastDay = new Date(year, month + 1, 0).getDate(); // Oyning oxirgi kuni

  const dayMapping = {
    yak: 0, // Yakshanba
    du: 1,  // Dushanba
    se: 2,  // Seshanba
    chor: 3, // Chorshanba
    pay: 4,  // Payshanba
    ju: 5,  // Juma
    sha: 6, // Shanba
  };

  const lessonDays = [];
  const startDate = addedDate
    ? new Date(Date.UTC(...addedDate.split("-").map((v, i) => (i === 1 ? parseInt(v) - 1 : parseInt(v)))))
    : new Date(year, month, 1); // Qo'shilgan sana yoki oyning 1-sanasidan boshlash

  for (let day = startDate.getDate(); day <= lastDay; day++) {
    const date = new Date(year, month, day);
    const weekday = date.getDay(); // Haftaning kuni (0-6)

    // Agar kun `selectedDays` ichida bo'lsa, massivga qo'shish
    if (selectedDays.some((key) => dayMapping[key] === weekday)) {
      lessonDays.push(date.toISOString().split("T")[0]); // Sana (YYYY-MM-DD formatda)
    }
  }

  // Eng kichik sanani qaytarish (birinchi dars kuni)
  return lessonDays.length > 0 ? lessonDays[0] : null;
};

// Misol uchun `selectedDays` va `addedDate`:
const selectedDays = ["du", "chor", "ju"];
const addedDate = "2025-04-02";
const firstLessonDay = getFirstLessonDay(selectedDays, addedDate);
console.log("Oyning birinchi dars kuni:", firstLessonDay);

export function CourseCard({ course }) {
  const [status, setStatus] = useState("Nofaol"); // Default qiymat
  const [currentMonth, setCurrentMonth] = useState(new Date().getMonth()); // Hozirgi oy

  useEffect(() => {
    const studentRef = ref(database, `Students/${course.studentName}`);
    get(studentRef)
      .then((snapshot) => {
        if (snapshot.exists()) {
          const studentData = snapshot.val();
          console.log("Fetched status from Firebase:", studentData.status); // Qo'shimcha log
          setStatus(studentData.status || "Nofaol"); // Firebase-dan statusni olish
        } else {
          console.error("Student data not found in Firebase.");
        }
      })
      .catch((error) => {
        console.error("Error fetching student status:", error);
      });
  }, [course.studentName]);
  console.log(course);

  // Safely determine the balance value
  const balanceValue = course.balance; // To'g'ridan-to'g'ri balance qiymatini ishlatamiz
  const formattedBalance = parseFloat(balanceValue).toFixed(2); // 2 xonali qoldiq

  const isNegativeBalance =
    typeof balanceValue === "string"
      ? balanceValue.startsWith("-")
      : balanceValue < 0; // Raqam yoki string bo'lsa, salbiyligini tekshiring

  // Yangi oyga o'tganda avtomatik to'lovni amalga oshirish
  useEffect(() => {
    const interval = setInterval(() => {
      const now = new Date(); // Hozirgi vaqtni olish
      const newMonth = now.getMonth(); // Hozirgi oyni olish

      if (newMonth !== currentMonth) {
        setCurrentMonth(newMonth); // Oyni yangilash

        // Barcha o'quvchilarni tekshirish
        const studentsRef = ref(database, `Students`);
        get(studentsRef)
          .then((snapshot) => {
            if (snapshot.exists()) {
              const studentsData = snapshot.val();

              // Har bir o'quvchini tekshirish
              Object.entries(studentsData).forEach(([studentName, studentData]) => {
                if (studentData.status === "Faol") {
                  const currentBalance = studentData.balance || 0;
                  const groupName = studentData.group;

                  if (!groupName) {
                    console.error(`Group name not found for student: ${studentName}`);
                    return;
                  }

                  // Guruh ma'lumotlarini olish
                  const groupRef = ref(database, `Groups/${groupName}`);
                  get(groupRef)
                    .then((groupSnapshot) => {
                      if (groupSnapshot.exists()) {
                        const groupData = groupSnapshot.val();
                        const courseFee = groupData.price || 0;

                        const updatedBalance = currentBalance - courseFee;
                        console.log(
                          `Auto-deduction for ${studentName}: ${courseFee}`
                        );
                        console.log(
                          `Updated Balance for ${studentName}: ${updatedBalance}`
                        );

                        // Firebase-ni yangilash
                        const studentRef = ref(
                          database,
                          `Students/${studentName}`
                        );
                        update(studentRef, { balance: updatedBalance })
                          .then(() => {
                            console.log(
                              `Balance updated for ${studentName} for new month.`
                            );
                          })
                          .catch((error) => {
                            console.error(
                              `Error updating balance for ${studentName}:`,
                              error
                            );
                          });
                      } else {
                        console.error(
                          `Group data not found for group: ${groupName}`
                        );
                      }
                    })
                    .catch((error) => {
                      console.error(
                        `Error fetching group data for group: ${groupName}`,
                        error
                      );
                    });
                }
              });
            } else {
              console.error("No students found in Firebase.");
            }
          })
          .catch((error) => {
            console.error("Error fetching students data:", error);
          });
      }
    }, 1000 * 60 * 60); // Har bir soatda tekshirish

    return () => clearInterval(interval); // Komponent unmount bo'lganda intervalni tozalash
  }, [currentMonth]);

  useEffect(() => {
    const interval = setInterval(() => {
      const today = new Date();
      const tomorrow = new Date(today);
      tomorrow.setDate(today.getDate()  ); // Ertangi sanani olish

      const dayOfWeek = tomorrow.toLocaleDateString("uz-UZ", { weekday: "short" }).toLowerCase();
      const todayDate = tomorrow.toISOString().split("T")[0]; // Bugungi sana (YYYY-MM-DD formatda)

      console.log("Bugungi kun:", dayOfWeek);

      const dayMapping = {
        yak: "yak", // Yakshanba
        dush: "du", // Dushanba
        sesh: "se", // Seshanba
        chor: "chor", // Chorshanba
        pay: "pay", // Payshanba
        jum: "ju", // Juma
        shan: "shan", // Shanba
      };

      // `dayOfWeek`ni `dayMapping` orqali moslashtirish
      const mappedDayOfWeek = dayMapping[dayOfWeek];

      console.log("Bugungi kun:", mappedDayOfWeek);

      const studentsRef = ref(database, `Students`);
      get(studentsRef)
        .then((snapshot) => {
          if (snapshot.exists()) {
            const studentsData = snapshot.val();

            Object.entries(studentsData).forEach(([studentName, studentData]) => {
              if (studentData.status === "Faol") {
                const currentBalance = studentData.balance || 0;
                const groupName = studentData.group;
                const lastDeductionDate = studentData.lastDeductionDate || null;

                if (!groupName) {
                  console.error(`Group name not found for student: ${studentName}`);
                  return;
                }

                // Agar bugungi sana uchun to'lov allaqachon amalga oshirilgan bo'lsa, o'tkazib yuborish
                if (lastDeductionDate === todayDate) {
                  console.log(`To'lov allaqachon amalga oshirilgan: ${studentName}`);
                  return;
                }

                const groupRef = ref(database, `Groups/${groupName}`);
                get(groupRef)
                  .then((groupSnapshot) => {
                    if (groupSnapshot.exists()) {
                      const groupData = groupSnapshot.val();
                      const selectedDays = groupData.selectedDays || [];
                      const courseFee = groupData.price || 0;

                      console.log("Selected Days from Group:", selectedDays);
                      console.log("Course Fee:", courseFee);

                      // Kurs kunlarini hisoblash
                      const totalLessonDays = countWeekdaysInMonth(selectedDays);
                      const totalLessonDaysCount = Object.values(totalLessonDays).reduce(
                        (sum, count) => sum + count,
                        0
                      );

                      if (totalLessonDaysCount === 0) {
                        console.error("Total lesson days count is 0. Cannot calculate per lesson cost.");
                        return;
                      }

                      const perLessonCost = courseFee / totalLessonDaysCount;

                      // Formatlangan qiymat
                      const formattedPerLessonCost = new Intl.NumberFormat("uz-UZ", {
                        style: "decimal", // Faqat raqamlarni formatlash
                        minimumFractionDigits: 0, // Qoldiqsiz ko'rsatish
                      }).format(perLessonCost);

                      console.log(`Daily deduction for ${studentName}: ${formattedPerLessonCost}`);

                      const normalizedSelectedDays = selectedDays.map((day) =>
                        Object.keys(dayMapping).find((key) => dayMapping[key] === day)
                      );

                      // Keyin `normalizedSelectedDays` bilan solishtiring
                      if (!normalizedSelectedDays.includes(dayOfWeek)) {
                        console.log(`Bugungi kun dars kuni emas: ${dayOfWeek}`);
                        return;
                      }

                      const updatedBalance = currentBalance - perLessonCost;

                      console.log(`Daily deduction for ${studentName}: ${perLessonCost}`);
                      console.log(`Updated Balance for ${studentName}: ${updatedBalance}`);

                      // Hozirgi oy va yilni olish
                      const today = new Date();
                      const monthYear = today.toLocaleString("uz-UZ", { month: "long", year: "numeric" });

                      // Qo'shilgan sanani aniqlash
                      const addedDate = studentData.addedDate || today.toISOString().split("T")[0]; // Qo'shilgan sana yoki bugungi sana

                      // Guruhdagi mavjud `attendance` massivini olish yoki yangi massiv yaratish
                      const existingAttendance = studentData.groupFee?.[groupName]?.attendance || [];
                      const currentMonthAttendance = existingAttendance.find((item) => item.monthYear === monthYear);

                      if (!currentMonthAttendance) {
                        // Agar hozirgi oy uchun yozuv mavjud bo'lmasa, yangi yozuv qo'shish
                        const daysPaid = initializeAttendance(selectedDays, addedDate);

                        existingAttendance.push({
                          monthYear: monthYear,
                          totalDays: daysPaid.length,
                          daysPaid: daysPaid, // Oldindan to'ldirilgan `daysPaid` massivini qo'shish
                        });
                      } else {
                        // Agar hozirgi oy uchun yozuv mavjud bo'lsa, bugungi dars kunini `true` qilib belgilash
                        const totalLessonDays = countWeekdaysInMonth(selectedDays);
                        const totalLessonDaysArray = Object.keys(totalLessonDays).reduce((acc, day) => {
                          const count = totalLessonDays[day];
                          for (let i = 0; i < count; i++) {
                            acc.push(day);
                          }
                          return acc;
                        }, []);

                        // Bugungi dars kunining indeksini topish
                        const dayMapping = {
                          yak: "yak", // Yakshanba
                          dush: "du", // Dushanba
                          sesh: "se", // Seshanba
                          chor: "chor", // Chorshanba
                          pay: "pay", // Payshanba
                          jum: "ju", // Juma
                          shan: "shan", // Shanba
                        };
                        const dayOfWeek = today.toLocaleDateString("uz-UZ", { weekday: "short" }).toLowerCase();
                        const mappedDayOfWeek = dayMapping[dayOfWeek];
                        const dayIndex = totalLessonDaysArray.findIndex((day) => day === mappedDayOfWeek);

                        if (dayIndex !== -1) {
                          currentMonthAttendance.daysPaid[dayIndex] = true; // Bugungi dars kunini `true` qilib belgilash
                        }
                      }

                      if (currentMonthAttendance) {
                        const todayDate = today.toISOString().split("T")[0]; // Bugungi sana (YYYY-MM-DD formatda)
                    
                        // Bugungi dars kunini topish va `paid` qiymatini `true` qilish
                        const todayLesson = currentMonthAttendance.daysPaid.find((day) => day.date === todayDate);
                        if (todayLesson) {
                          todayLesson.paid = true;
                        }
                      }

                      // Firebase-ni yangilash
                      const studentRef = ref(database, `Students/${studentName}`);
                      update(studentRef, {
                        balance: updatedBalance,
                        lastDeductionDate: todayDate, // Oxirgi to'lov sanasini yangilash
                        groupFee: {
                          ...studentData.groupFee, // Mavjud `groupFee` obyektini saqlash
                          [groupName]: {
                            remainingDebt: calculateRemainingDebt(studentData.groupFee?.[groupName], courseFee), // Guruhdan qolgan qarz summasi
                            attendance: existingAttendance, // Yangilangan `attendance` massivini saqlash
                          },
                        },
                      }).then(() => {
                        console.log(`Attendance and balance updated for ${studentName}.`);
                      }).catch((error) => {
                        console.error(`Error updating attendance for ${studentName}:`, error);
                      });

                      // To'lov tarixini qo'shish
                      const paymentHistoryRef = ref(database, `Students/${studentName}/paymentHistory`);
                      const newPayment = {
                        date: todayDate,
                        amount: `- ${formattedPerLessonCost}`, // Formatlangan qiymat
                        description: "Kunlik dars to'lovi",
                        status: "Yechildi",
                      };

                      // Yangi yozuvni qo'shish
                      get(paymentHistoryRef)
                        .then((snapshot) => {
                          const paymentHistory = snapshot.exists() ? snapshot.val() : [];
                          const updatedHistory = [...paymentHistory, newPayment];

                          update(studentRef, { paymentHistory: updatedHistory })
                            .then(() => {
                              console.log(`Payment history updated for ${studentName}`);
                            })
                            .catch((error) => {
                              console.error(`Error updating payment history for ${studentName}:`, error);
                            });
                        })
                        .catch((error) => {
                          console.error(`Error fetching payment history for ${studentName}:`, error);
                        });
                    } else {
                      console.error(`Group data not found for group: ${groupName}`);
                    }
                  })
                  .catch((error) => {
                    console.error(`Error fetching group data for group: ${groupName}`, error);
                  });
              }
            });
          } else {
            console.error("No students found in Firebase.");
          }
        })
        .catch((error) => {
          console.error("Error fetching students data:", error);
        });
    }, 1000); // Har sekundda tekshirish

    return () => clearInterval(interval); // Intervalni tozalash
  }, []);

  const handleStatusChange = (value) => {
    const studentRef = ref(database, `Students/${course.studentName}`);
    const today = new Date();
    const todayDate = today.toISOString().split("T")[0]; // Bugungi sana (YYYY-MM-DD formatda)
  
    if (value === "Faol") {
      // Studentning statusini Firebase-da yangilash
      update(studentRef, { status: "Faol" })
        .then(() => {
          console.log("Student status updated to Faol in Firebase.");
          setStatus("Faol"); // Mahalliy state-ni ham yangilash
        })
        .catch((error) => {
          console.error("Error updating student status in Firebase:", error);
        });
  
      // Qo'shimcha hisob-kitoblar (agar kerak bo'lsa)
      get(studentRef)
        .then((snapshot) => {
          if (snapshot.exists()) {
            const studentData = snapshot.val();
            const currentBalance = studentData.balance || 0;
            const groupName = studentData.group;
            const lastDeductionDate = studentData.lastDeductionDate || null;
  
            if (!groupName) {
              console.error("Group name not found for the student.");
              return;
            }
  
            // Guruh ma'lumotlarini olish
            const groupRef = ref(database, `Groups/${groupName}`);
            get(groupRef)
              .then((groupSnapshot) => {
                if (groupSnapshot.exists()) {
                  const groupData = groupSnapshot.val();
                  const selectedDays = groupData.selectedDays || [];
                  const courseFee = groupData.price || 0;
  
                  const dayMapping = {
                    yak: "yak", // Yakshanba
                    dush: "du", // Dushanba
                    sesh: "se", // Seshanba
                    chor: "chor", // Chorshanba
                    pay: "pay", // Payshanba
                    jum: "ju", // Juma
                    shan: "shan", // Shanba
                  };

                  const dayOfWeek = today.toLocaleDateString("uz-UZ", { weekday: "short" }).toLowerCase();
                  const mappedDayOfWeek = dayMapping[dayOfWeek];
  
                  // Agar bugungi kun dars kuni bo'lsa va to'lov hali amalga oshirilmagan bo'lsa
                  if (selectedDays.includes(mappedDayOfWeek) && lastDeductionDate !== todayDate) {
                    const totalLessonDays = countWeekdaysInMonth(selectedDays);
                    const totalLessonDaysCount = Object.values(totalLessonDays).reduce(
                      (sum, count) => sum + count,
                      0
                    );
  
                    if (totalLessonDaysCount === 0) {
                      console.error("Total lesson days count is 0. Cannot calculate per lesson cost.");
                      return;
                    }
  
                    const perLessonCost = parseFloat((Math.abs(courseFee / totalLessonDaysCount) / 10000).toFixed(3));
                    const updatedBalance = currentBalance - perLessonCost;
  
                    console.log(`Daily deduction for ${course.studentName}: ${perLessonCost}`);
                    console.log(`Updated Balance for ${course.studentName}: ${updatedBalance}`);
  
                    // Firebase-ni yangilash
                    const studentRef = ref(database, `Students/${course.studentName}`);
                    update(studentRef, {
                      balance: updatedBalance,
                      lastDeductionDate: todayDate, // Oxirgi to'lov sanasini yangilash
                    }).then(() => {
                      console.log(`Balance updated for ${course.studentName}: ${updatedBalance}`);

                      // To'lov tarixini qo'shish
                      const paymentHistoryRef = ref(database, `Students/${course.studentName}/paymentHistory`);
                      const newPayment = {
                        date: todayDate,
                        amount: perLessonCost,
                        description: "Kunlik dars to'lovi",
                      };  

                      // Yangi yozuvni qo'shish
                      get(paymentHistoryRef)
                        .then((snapshot) => {
                          const paymentHistory = snapshot.exists() ? snapshot.val() : [];
                          const updatedHistory = [...paymentHistory, newPayment];

                          update(studentRef, { paymentHistory: updatedHistory })
                            .then(() => {
                              console.log(`Payment history updated for ${course.studentName}`);
                            })
                            .catch((error) => {
                              console.error(`Error updating payment history for ${course.studentName}:`, error);
                            });
                        })
                        .catch((error) => {
                          console.error(`Error fetching payment history for ${course.studentName}:`, error);
                        });
                    }).catch((error) => {
                      console.error(`Error updating balance for ${course.studentName}:`, error);
                    });
                  }
                } else {
                  console.error("Group data not found in Firebase.");
                }
              })
              .catch((error) => {
                console.error("Error fetching group data:", error);
              });
          } else {
            console.error("Student data not found in Firebase.");
          }
        })
        .catch((error) => {
          console.error("Error fetching student data:", error);
        });
    } else {
      // Agar boshqa status tanlansa, faqat statusni yangilash
      update(studentRef, { status: value })
        .then(() => {
          console.log(`Student status updated to ${value} in Firebase.`);
          setStatus(value); // Mahalliy state-ni ham yangilash
        })
        .catch((error) => {
          console.error("Error updating student status in Firebase:", error);
        });
    }
  };

  const remainingDebt = course.totalFee - course.balance; // Qolgan qarzni hisoblash
  const formattedRemainingDebt = new Intl.NumberFormat("uz-UZ", {
    style: "decimal", // Faqat raqamlarni formatlash
    minimumFractionDigits: 0, // Qoldiqsiz ko'rsatish
  }).format(remainingDebt);

  return (
    <div className="bg-white rounded-lg shadow-sm p-6 space-y-4">
      <div className="flex justify-between items-center">
        <span
          className={`flex items-center gap-1 ${
            remainingDebt > 0 ? "text-red-600 bg-red-50" : "text-green-600 bg-green-50"
          } px-2 py-1 rounded-md`}
        >
          <span className="text-lg">E</span>
          <span>{formattedRemainingDebt} so'm</span> {/* Qolgan qarz */}
        </span>
        <Select
          value={status} // `defaultValue` o'rniga `value` ishlatamiz
          className="w-[120px]"
          onValueChange={handleStatusChange}
        >
          <SelectTrigger className="w-[120px]">
            <SelectValue placeholder="Status" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="Faol">Faol</SelectItem>
            <SelectItem value="Muzlatish">Muzlatish</SelectItem>
            <SelectItem value="Nofaol">Nofaol</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <div className="flex justify-between items-start">
        <h2 className="text-2xl font-semibold">{course.name}</h2>
        <span className="text-xl">0</span>
      </div>

      <div className="space-y-3">
        <div>
          <div className="text-sm text-gray-500">Guruh intervali :</div>
          <div>{course.dateRange}</div>
        </div>

        <div className="flex items-center gap-2">
          <GraduationCap className="text-green-600" />
          <span>{course.teacher}</span>
        </div>

        <div>
          <div className="text-sm text-gray-500">Dars kunlari :</div>
          <div>{course.time}</div>
        </div>

        <div className="flex flex-wrap gap-2">
          {course.days.map((day) => (
            <span key={day} className="bg-gray-200 px-3 py-1 rounded-full text-sm">
              {day}
            </span>
          ))}
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <div className="text-sm text-gray-500">Boshlangan sana</div>
            <div className="text-green-600">{course.startDate}</div>
          </div>
          <div>
            <div className="text-sm text-gray-500">O'chiriladigan sana</div>
            <div className="text-red-600">{course.endDate}</div>
          </div>
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <div className="text-sm text-gray-500">Keyingi to'lov</div>
            <div>{course.nextPayment}</div>
          </div>
          <div>
            <div className="text-sm text-gray-500">To'lov narxi</div>
            <div className="text-green-600">{course.paymentAmount} so'm</div>
          </div>
        </div>
      </div>
    </div>
  );
}

const GroupDetails = () => {
  const [studentsData, setStudentsData] = useState([]);

  useEffect(() => {
    const database = getDatabase();
    const studentsRef = ref(database, "Students");

    onValue(studentsRef, (snapshot) => {
      if (snapshot.exists()) {
        const data = snapshot.val();
        setStudentsData(data); // Ma'lumotlarni holatga yozish
      } else {
        console.error("No students data found.");
      }
    });
  }, []);

  return (
    <div>
      <h1>Group Details</h1>
      <pre>{JSON.stringify(studentsData, null, 2)}</pre>
    </div>
  );
};

export default GroupDetails;


