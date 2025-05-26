import React, { useState, useEffect } from "react";
import { useNavigate, Link } from "react-router-dom";
import { initializeApp } from "https://www.gstatic.com/firebasejs/11.0.2/firebase-app.js";
import { getAnalytics } from "https://www.gstatic.com/firebasejs/11.0.2/firebase-analytics.js";
import {
  getDatabase,
  ref,
  onValue,
  set,
  update,
  get
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
export const database = getDatabase(app);

import style from "../../Admin/PaymentArchive/PaymentArchive.module.css"

import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from "./card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "./table";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  LineChart,
  Line,
  PieChart,
  Pie,
  Cell,
} from "recharts";
import { ScrollArea, ScrollBar } from "./scroll-area";
import { cn } from "../../lib/utils";
import {
  TrendingUp,
  Users,
  GraduationCap,
  DollarSign,
  Award,
  AlertTriangle,
  UserPlus,
  CreditCard,
  Receipt,
  Wallet
} from "lucide-react";
import { Button } from "./button";
import { Modal } from "./modal";
import { Input } from "./input";
import { Label } from "./label";

const timeSlots = Array.from({ length: 13 }).map((_, i) => ({
  time: `${(i + 8).toString().padStart(2, "0")}:00`,
  courses: [],
}));

const COLORS = ["#0088FE", "#00C49F", "#FFBB28", "#FF8042"];

// Helper function to calculate duration in hours from a time range string
const calculateDuration = (timeRange) => {
  const [start, end] = timeRange.split("-");
  const [startHour, startMinute] = start.split(":").map(Number);
  const [endHour, endMinute] = end.split(":").map(Number);

  const startTime = startHour + startMinute / 60;
  const endTime = endHour + endMinute / 60;

  return endTime - startTime;
};

// Function to get the current time slot
const getCurrentTimeSlot = () => {
  const now = new Date();
  const hours = now.getHours();
  const minutes = now.getMinutes();
  return `${hours.toString().padStart(2, "0")}:${minutes
    .toString()
    .padStart(2, "0")}`;
};

const isDayMatch = (selectedDays, day) => {
  const synonyms = {
    dush: ["du", "dush", "dushanba"],
    sesh: ["se", "sesh", "seshanba"],
    chor: ["ch", "chor", "chorshanba"],
    pay: ["pa", "pay", "payshanba"],
    jum: ["ju", "jum", "juma"],
    shan: ["sh", "shan", "shanba"],
    yak: ["ya", "yak", "yakshanba"],
  };

  if (!selectedDays || !Array.isArray(selectedDays)) {
    console.error("Xatolik: selectedDays noto‘g‘ri yoki mavjud emas", selectedDays);
    return false;
  }

  // Sinonimlar qiymatlari ichidan mos keladigan kunni qidirish
  return Object.values(synonyms).some((synonymList) =>
    synonymList.includes(day) && selectedDays.some((selected) => synonymList.includes(selected.toLowerCase()))
  );
};

const filterGroupsByDay = (groupsArray, day) => {
  return groupsArray.filter((group) => {
    if (!group.selectedDays) return false;
    return isDayMatch(group.selectedDays, day);
  });
};

const getCurrentDate = () => {
  const today = new Date();
  const year = today.getFullYear();
  const month = String(today.getMonth() + 1).padStart(2, "0");
  const day = String(today.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
};

export default function Dashboard({ data }) {
  const navigate = useNavigate();
  const [groupsData, setGroupsData] = useState([]);
  const [roomData, setRoomsData] = useState([]);
  const [leadsData, setLeadsData] = useState([]);
  const [CourseAbout, setCourseAbout] = useState([]);
  const [courseSchedule, setCourseSchedule] = useState([]); // Ertangi kun uchun jadval
  const [OpenModal, setOpenModal] = useState(false)
  const [StudentKeys, setStudentKeys] = useState({});
  const [TakeStudents, setTakeStudents] = useState([])
  const [SearchStudens, setSearchStudens] = useState([]);

  const [DebtorStudent, setDebtorStudent] = useState([])

  const [PayValue, setPayValue] = useState({
    value1: "",
    value2: ""
  })

  useEffect(() => {
    const leadsRef = ref(database, "leads");
    onValue(leadsRef, (snapshot) => {
      const data = snapshot.val();
      const leadsArray = data ? Object.values(data) : 0;
      setLeadsData(leadsArray);
    });
  }, [])

  useEffect(() => {
    const groupsRef = ref(database, "Groups");
    onValue(groupsRef, (snapshot) => {
      const data = snapshot.val();
      if (data) {
        const groupsArray = Object.keys(data).map((key) => ({
          id: key,
          groupName: key,
          ...data[key], // Includes selectedDays
        }));
        setGroupsData(groupsArray);
      } else {
        console.error("Groups data is empty or undefined.");
      }
    });
  }, []);

  useEffect(() => {
    const coursesRef = ref(database, "Courses");
    const unsubscribe = onValue(coursesRef, (snapshot) => {
      const data = snapshot.val();
      setCourseAbout(data ? Object.values(data) : []);
    });
    return () => unsubscribe();
  }, []);


  useEffect(() => {
    const roomsRef = ref(database, "Rooms");
    onValue(roomsRef, (snapshot) => {
      const data = snapshot.val();
      if (data) {
        const roomData = Object.keys(data).map((key) => ({
          value: key,
          label: data[key].name,
        }));
        setRoomsData(roomData);
      } else {
        console.error("Room data is empty or undefined.");
      }
    });
  }, []);

  useEffect(() => {
    const StudentRef = ref(database, "Students");

    const unsubscribe = onValue(StudentRef, (snapshot) => {
      const data = snapshot.val();
      const studentsArray = data ? Object.values(data) : [];

      setTakeStudents(studentsArray);
      setStudentKeys(Object.keys(data || {}));
    });

    return () => unsubscribe(); // Kuzatuvni tozalash
  }, []);

  const courseScheduleData = groupsData.map((group, index) => {
    if (!group.duration) {
      console.error(`Group ${group.groupName} has no duration defined.`);
      return null;
    }

    const duration = calculateDuration(group.duration); // Calculate duration from group.duration
    const [startHour] = group.duration.split("-")[0].split(":").map(Number); // Extract start hour
    const schedule = {
      id: group.id,
      name: group.groupName,
      instructor: group.teachers,
      room: group.rooms,
      groupId: index,
      duration,
      startHour,
      selectedDays: group.selectedDays,
    };
    return schedule;
  }).filter(Boolean); // Filter out null values


  // Populate time slots with courses
  courseScheduleData.forEach((course) => {
    const slotIndex = course.startHour - 8;
    if (timeSlots[slotIndex]) {
      timeSlots[slotIndex].courses.push(course);
    }
  });



  const revenueData = [
    { month: "Yan", revenue: 450000 },
    { month: "Fev", revenue: 720000 },
    { month: "Mar", revenue: 480000 },
    { month: "Apr", revenue: 600000 },
    { month: "May", revenue: 500000 },
    { month: "Iyu", revenue: 670000 },
  ];

  const courseRevenue = CourseAbout.reduce((acc, course) => {
    const courseName = course.name || "Noma'lum Kurs"; // Kurs nomi mavjud bo'lmasa, "Noma'lum Kurs" deb belgilash
    const courseValue = parseFloat(course.price) || 0;

    // Kursni mavjud bo'lsa, qiymatini qo'shish, aks holda yangi kurs qo'shish
    const existingCourse = acc.find((item) => item.name === courseName);
    console.log(acc);
    if (existingCourse) {
      existingCourse.value += courseValue;
    } else {
      acc.push({ name: courseName, value: courseValue });
    }

    return acc;
  }, []);

  const topPerformers = [
    {
      name: "Ilg'or React",
      revenue: 25000000,
      students: 45,
      rating: 4.8,
      growth: "+15%",
    },
    {
      name: "Data Science",
      revenue: 22000000,
      students: 38,
      rating: 4.7,
      growth: "+12%",
    },
    {
      name: "Python Ustasi",
      revenue: 20000000,
      students: 42,
      rating: 4.9,
      growth: "+18%",
    },
  ];

  const [currentTime, setCurrentTime] = useState(getCurrentTimeSlot());

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentTime(getCurrentTimeSlot());
    }, 60000); // Har daqiqada yangilanadi

    return () => clearInterval(timer);
  }, []);

  const isSlotCurrent = (slotTime) => {
    const [slotHour] = slotTime.split(":").map(Number);
    const currentHour = new Date().getHours();
    return slotHour === currentHour;
  };

  const isSlotPast = (slotTime) => {
    const [slotHour] = slotTime.split(":").map(Number);
    const currentHour = new Date().getHours();
    return slotHour < currentHour;
  };
  const isCoursePast = (course) => {
    const currentHour = new Date().getHours();
    return course.startHour + course.duration <= currentHour;
  };

  const handleCardClick = (groupId) => {
    navigate(`/group/${groupId}`);
  };
  const getTomorrow = () => {
    const tomorrow = new Date();
    tomorrow.setDate(tomorrow.getDate() + 1);
    return tomorrow.toLocaleDateString("uz-UZ", { weekday: "short" }).toLowerCase();
  };

  const handleShowTodayGroups = () => {
    const todayDay = new Date().toLocaleDateString("uz-UZ", { weekday: "short" }).toLowerCase(); // Bugungi kunni aniqlash

    const filteredGroups = filterGroupsByDay(groupsData, todayDay); // Bugungi kundagi guruhlarni filtrlash
    // console.log("Bugungi guruhlar:", filteredGroups); // Konsolda filtrlash natijasini ko'rsatish

    // Bugungi kun uchun courseSchedule ni yangilash
    const filteredSchedule = filteredGroups.map((group, index) => {
      if (!group.duration) {
        console.error(`Group ${group.groupName} has no duration defined.`);
        return null;
      }

      const duration = calculateDuration(group.duration); // Calculate duration from group.duration
      const [startHour] = group.duration.split("-")[0].split(":").map(Number); // Extract start hour
      return {
        id: group.id,
        name: group.groupName,
        instructor: group.teachers,
        room: group.rooms,
        groupId: index,
        duration,
        startHour,
        selectedDays: group.selectedDays,
      };
    }).filter(Boolean); // Filter out null values

    // Bugungi kun uchun jadvalni yangilash
    setCourseSchedule(filteredSchedule);
  };

  const handleShowTomorrowGroups = () => {
    const tomorrowDay = getTomorrow(); // Ertangi kunni aniqlash
    const filteredGroups = filterGroupsByDay(groupsData, tomorrowDay); // Ertangi kundagi guruhlarni filtrlash

    // Ertangi kun uchun courseSchedule ni yangilash
    const filteredSchedule = filteredGroups.map((group, index) => {
      if (!group.duration) {
        console.error(`Group ${group.groupName} has no duration defined.`);
        return null;
      }

      const duration = calculateDuration(group.duration); // Calculate duration from group.duration
      const [startHour] = group.duration.split("-")[0].split(":").map(Number); // Extract start hour
      return {
        id: group.id,
        name: group.groupName,
        instructor: group.teachers,
        room: group.rooms,
        groupId: index,
        duration,
        startHour,
        selectedDays: group.selectedDays,
      };
    }).filter(Boolean);

    // Ertangi kun uchun jadvalni yangilash
    setCourseSchedule(filteredSchedule);
  };

  // Komponent yuklanganda bugungi guruhlarni ko'rsatish
  useEffect(() => {
    handleShowTodayGroups();
  }, [groupsData]);

  useEffect(() => {
    const filterStudent = TakeStudents.filter((student) =>
      student.balance.toString().slice(0, 1) === "-"
    )

    setDebtorStudent(filterStudent)
  }, [TakeStudents])

  // Talabalarni qidirish funksiyasi
  const handleSearchStudent = (searchTerm) => {
    if (!searchTerm) {
      setSearchStudens([]);
      return;
    }

    const filteredStudents = TakeStudents.filter((student) =>
      student.studentName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      student.studentNumber.toLowerCase().includes(searchTerm.toLowerCase())
    );

    setSearchStudens(filteredStudents); // Faqat filtrlangan natijalarni o'rnating
  };


  // Talabani bosilganda inputga qo'shish funksiyasi
  const handleStudentClick = (studentName) => {
    if (PayValue.value2) {
      setPayValue((prevState) => ({
        ...prevState,
        value2: studentName
      }))
    }

    const selectedStudent = TakeStudents.filter((student) => student.studentName === studentName);
    setSearchStudens(selectedStudent); // Faqat bosilgan talaba bilan natijalarni yangilash
  };


  // Talabaga to'lov qilish funksiyasi
  const handleStudentFee = () => {
    if (!PayValue.value2 || !PayValue.value1) {
      alert("To'lov miqdorini to'g'ri kiriting!");
      return;
    }
    else {
      setOpenModal(false);

      const formattedPaymentAmount = new Intl.NumberFormat("uz-UZ", {
        style: "decimal",
        minimumFractionDigits: 0,
      }).format(parseInt(PayValue.value1.replace(/\s/g, ""), 10));

      const paymentData = {
        date: getCurrentDate(),
        amount: `+ ${formattedPaymentAmount}`,
        description: "To'lov qabul qilindi",
        status: "To'langan",
        time: new Date().toLocaleTimeString("en-US", { hour12: false }),
      };

      const paymentRef = ref(database, `Students/${PayValue.value2}/paymentHistory`);
      get(paymentRef)
        .then((snapshot) => {
          const existingPayments = snapshot.val() || [];
          const updatedPayments = [...existingPayments, paymentData];

          return update(ref(database, `Students/${PayValue.value2}`), { paymentHistory: updatedPayments });
        })
        .then(() => {
          setPayValue({ value1: "", value2: "" });
          setSearchStudens([])
          alert("To'lov muvaffaqiyatli amalga oshirildi!");

          const balanceRef = ref(database, `Students/${PayValue.value2}/balance`);
          get(balanceRef)
            .then((snapshot) => {
              const currentBalance = parseFloat(snapshot.val()) || 0;
              const newBalance = currentBalance + parseInt(PayValue.value1.replace(/\s/g, ""), 10);

              return update(ref(database, `Students/${PayValue.value2}`), { balance: newBalance });
            })
            .then(() => console.log("Student balance updated successfully"))
            .catch((error) => console.error("Error updating student balance:", error));
        })
        .catch((error) => {
          console.error("To'lovni amalga oshirishda xatolik yuz berdi:", error);
        });
    }
  };


  return (
    <>
      {
        OpenModal && (
          <Modal
            title="To'lov qilish"
            isOpen={OpenModal}
            onClose={() => setOpenModal(false)}
            positionTop={"t-[40px]"}
            children={
              <div className="flex flex-col gap-4">
                <div className="flex flex-col gap-3">
                  <Label htmlFor="pay" className="text-sm/3 text-gray-400">To'lov miqdori</Label>
                  <Input
                    id="pay"
                    type="text"
                    className={`${style.inputSearch}`}
                    placeholder="To'lovni kiriting"
                    value={PayValue.value1}
                    onChange={(e) => {
                      const rawValue = e.target.value.replace(/\s/g, ""); // Bo'sh joylarni olib tashlash
                      if (isNaN(rawValue)) return; // Faqat raqamlarni qabul qilish

                      const formattedValue = rawValue.replace(/\B(?=(\d{3})+(?!\d))/g, " "); // Har 3 ta raqamdan keyin bo'sh joy qo'shish
                      setPayValue((prevState) => ({
                        ...prevState,
                        value1: formattedValue,
                      }));
                    }}
                  />
                </div>
                <div className="flex flex-col gap-3">
                  <label htmlFor="who" className="text-sm/3 text-gray-400">Kimga</label>
                  <Input
                    id="who"
                    type="search"
                    className={`${style.inputSearch}`}
                    placeholder="Talaba ismini qidiring..."
                    value={PayValue.value2}
                    onChange={(e) => {
                      setPayValue((prevState) => ({
                        ...prevState,
                        value2: e.target.value
                      }))
                      handleSearchStudent(e.target.value)
                    }}
                  />
                </div>
                <div
                  className={`flex flex-col gap-2 ${SearchStudens.length > 0 ? "h-auto" : SearchStudens.length < 4 ? "h-auto overflow-y-scroll" : ""}`}
                >
                  {SearchStudens.length > 0 ? (
                    SearchStudens.map((student) => (
                      <div
                        key={student.id}
                        className="flex justify-between items-center p-2 border-b border-gray-300 cursor-pointer hover:bg-gray-100"
                        onClick={() => handleStudentClick(student.studentName)} // Div bosilganda ismni inputga qo'shish
                      >
                        <div className="flex flex-col">
                          <span className="font-semibold">{student.studentName}</span>
                          <span className="text-sm text-gray-500">{student.studentNumber}</span>
                        </div>
                      </div>
                    ))
                  ) : ""
                  }
                </div>
                <div className="flex justify-between items-center gap-10">
                  <Button
                    variant="outline"
                    onClick={() => setOpenModal(false)}
                  >
                    Bekor qilish
                  </Button>
                  <Button
                    className="bg-green-600 hover:bg-green-700 text-white flex items-center gap-1"
                    onClick={(e) => {
                      e.preventDefault()
                      handleStudentFee()
                    }}
                  >
                    To'lash
                    <CreditCard className="w-4 h-4 mr-2" />
                  </Button>
                </div>
              </div>
            }
          />
        )
      }

      <div className="space-y-5">

        {/* Payment */}
        <div className="flex items-center justify-between mb-8">
          <h1 className="text-3xl font-bold">IT Ta'lim Markazi CRM</h1>
          <div className="flex gap-4">
            <Button
              className="bg-green-600 hover:bg-green-700 text-white"
              onClick={(e) => {
                e.preventDefault()
                setOpenModal(true)
              }}
            >
              <CreditCard className="w-4 h-4 mr-2" />
              To'lov qilish
            </Button>
            <Button variant="outline" onClick={() => navigate("/paymentArchive")} className="border-green-600 text-green-600 hover:bg-green-50">
              <Receipt className="w-4 h-4 mr-2" />
              To'lovlar tarixi
            </Button>
            <Button variant="outline" className="border-blue-600 text-blue-600 hover:bg-blue-50">
              <Wallet className="w-4 h-4 mr-2" />
              Balans: 2,450,000 so'm
            </Button>
          </div>
        </div>
        {/* KPI Section */}
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-5">
          <Card
            className="bg-gradient-to-br cursor-pointer from-pink-50 to-pink-100"
            onClick={() => navigate("/leads")}
          >
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium">Yangi Lidlar</CardTitle>
              <UserPlus className="h-4 w-4 text-pink-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-pink-700">{leadsData === 0 ? 0 : leadsData.length}</div>
              <p className="text-xs text-pink-600 mt-1 flex items-center">
                <TrendingUp className="h-4 w-4 mr-1" />
                O'tgan haftaga nisbatan +15%
              </p>
            </CardContent>
          </Card>
          <Card
            className="bg-gradient-to-br cursor-pointer from-blue-50 to-blue-100"
            onClick={() => handleCardClick(groupsData[0]?.id)}
          >
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium">Oylik Daromad</CardTitle>
              <DollarSign className="h-4 w-4 text-blue-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-blue-700">
                {data.totalRevenue.toLocaleString()} so'm
              </div>
              <p className="text-xs text-blue-600 mt-1 flex items-center">
                <TrendingUp className="h-4 w-4 mr-1" />
                O'tgan oyga nisbatan +12.5%
              </p>
            </CardContent>
          </Card>

          <Card
            className="bg-gradient-to-br cursor-pointer from-green-50 to-green-100"
            onClick={() => navigate("/students")}
          >
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium">
                Faol O'quvchilar
              </CardTitle>
              <Users className="h-4 w-4 text-green-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-green-700">
                {TakeStudents.length}
              </div>
              <p className="text-xs text-green-600 mt-1 flex items-center">
                <TrendingUp className="h-4 w-4 mr-1" />
                +8.2% saqlanish darajasi
              </p>
            </CardContent>
          </Card>

          <Card
            className="bg-gradient-to-br cursor-pointer from-indigo-50 to-indigo-100"
            onClick={() => navigate("/groups")}
          >
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium">Faol Guruhlar</CardTitle>
              <Users className="h-4 w-4 text-indigo-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-indigo-700">{groupsData.length}</div>
              <p className="text-xs text-indigo-600 mt-1 flex items-center">
                <TrendingUp className="h-4 w-4 mr-1" />
                O'tgan oyga nisbatan +2 ta
              </p>
            </CardContent>
          </Card>

          <Card
            className="bg-gradient-to-br cursor-pointer from-amber-50 to-amber-100"
            onClick={() => navigate("/debtadStudents")}
          >
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium">
                Qarzdor O'quvchilar
              </CardTitle>
              <AlertTriangle className="h-4 w-4 text-amber-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-amber-700">{DebtorStudent.length}</div>
              <p className="text-xs text-amber-600 mt-1 flex items-center">
                <TrendingUp className="h-4 w-4 mr-1" />
                O'tgan oyga nisbatan -3 ta
              </p>
            </CardContent>
          </Card>
        </div>

        {/* Course Schedule */}
        <Card className="col-span-3">
          <CardHeader>
            <CardTitle>Dars Jadvali</CardTitle>
            <CardDescription>
              Barcha xonalardagi joriy va kelgusi darslar
            </CardDescription>
            <div className="flex items-center justify-center mt-2">
              Bugun:
              <div className="bg-blue-100 rounded-full w-10 h-10 flex items-center justify-center text-blue-700 font-bold">
                {new Date().getDate()}
              </div>
            </div>
            <div className="text-center text-sm text-gray-600 mt-2">
              {new Date().toLocaleDateString("uz-UZ", { weekday: "long" })}
            </div>
          </CardHeader>
          <CardContent>
            <ScrollArea className="h-[600px] w-full rounded-md border border-gray-300">
              <div className="relative w-full">
                {/* Time header */}
                <div className="sticky top-0 z-10 w-full border-b border-gray-300 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
                  <div className="flex h-12">
                    <div className="flex-none w-[100px] border-r border-gray-300 bg-background p-2">
                      Xona
                    </div>
                    {timeSlots.map((slot) => (
                      <div
                        key={slot.time}
                        className={cn(
                          "flex-none w-[100px] border-r border-gray-300 p-2 text-center",
                          isSlotCurrent(slot.time) && "bg-blue-100 font-bold",
                          isSlotPast(slot.time) && "bg-gray-100 text-gray-400"
                        )}
                      >
                        {slot.time}
                      </div>
                    ))}
                  </div>
                </div>
                <div className="sticky top-12 z-20 w-full bg-yellow-100 p-2 text-center font-bold">
                  Joriy vaqt: {currentTime}
                </div>

                {/* Schedule grid */}
                <div className="flex flex-col">
                  {roomData.map((room) => (
                    <div
                      key={room.value} // Use a unique property like `room.value` as the key
                      className="flex min-h-[100px] border-b border-gray-300"
                    >
                      <div className="flex-none w-[100px] border-r border-gray-300 bg-muted/20 p-2">
                        {room.label}
                      </div>
                      <div className="relative flex flex-1">
                        {courseSchedule
                          .filter((course) => course.room === room.label)
                          .map((course) => {
                            const isToday = new Date().toDateString() === new Date(course.date).toDateString();
                            return (
                              <div
                                key={course.id} // Ensure each course also has a unique key
                                className={cn(
                                  " group absolute flex flex-col transition-all duration-300 cursor-pointer rounded-lg border p-2 text-sm hover:shadow-md",
                                  isCoursePast(course)
                                    ? "bg-gray-300 border-gray-400 text-gray-600"
                                    : course.id % 2 === 0
                                      ? "bg-blue-100 border-blue-200"
                                      : "bg-green-100 border-green-200",
                                  isToday && "bg-yellow-100 border-yellow-200"
                                )}
                                style={{
                                  left: `${(course.startHour - 8) * 100}px`,
                                  width: `${course.duration * 100}px`,
                                  top: "4px",
                                  bottom: "4px",
                                }}
                                onClick={() => handleCardClick(course.id)}
                              >
                                {/* Yon chiziq */}
                                <div className="absolute left-0 top-0 bottom-0 w-1  bg-transparent group-hover:bg-blue-500 transition-all duration-300"></div>

                                {/* Kontent */}
                                <div className="font-semibold">{course.name}</div>
                                <div className="text-xs text-muted-foreground">{course.instructor}</div>
                                <div className="text-xs font-medium text-primary">Guruh: {course.groupId}</div>
                                <div className="text-xs p-0 m-0 text-gray-800 mt-1">
                                  {course.selectedDays ? course.selectedDays.join(", ") : "Noma'lum"}
                                </div>
                                {isCoursePast(course) && (
                                  <div className="absolute top-0 right-0 bg-red-500 text-white text-xs px-1 rounded-bl rounded-tr-[inherit]">
                                    Tugadi
                                  </div>
                                )}
                              </div>
                            );
                          })}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
              <ScrollBar orientation="horizontal" />
            </ScrollArea>

          </CardContent>
        </Card>

        {/* Ertangi kun tugmasi */}
        <div className="flex justify-end mb-4 gap-2">
          <Button
            className="bg-green-600 hover:bg-green-700 text-white"
            onClick={handleShowTodayGroups}
          >
            Bugungi Guruhlarni Ko'rsat
          </Button>
          <Button
            className="bg-blue-600 hover:bg-blue-700 text-white"
            onClick={handleShowTomorrowGroups}
          >
            Ertangi Guruhlarni Ko'rsat
          </Button>
        </div>

        {/* Revenue and Performance Analytics */}
        <div className="grid gap-4 md:grid-cols-2">
          <Card>
            <CardHeader>
              <CardTitle>Daromad Trendi</CardTitle>
              <CardDescription>So'nggi 6 oy uchun oylik daromad</CardDescription>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={300}>
                <LineChart data={revenueData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="month" />
                  <YAxis />
                  <Tooltip />
                  <Line
                    type="monotone"
                    dataKey="revenue"
                    stroke="#8884d8"
                    strokeWidth={2}
                    dot={{ fill: "#8884d8" }}
                  />
                </LineChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Daromad Taqsimoti</CardTitle>
              <CardDescription>
                Kurs toifasi bo'yicha daromad ulushi
              </CardDescription>
            </CardHeader>
            <CardContent>
              {
                courseRevenue.length > 0 ? (
                  <ResponsiveContainer width="100%" height={300}>
                    <PieChart>
                      <Pie
                        data={courseRevenue}
                        cx="50%"
                        cy="50%"
                        labelLine={false}
                        outerRadius={100}
                        fill="#8884d8"
                        dataKey="value"
                      >
                        {courseRevenue.map((entry, index) => (
                          <Cell
                            key={`cell-${index}`}
                            fill={COLORS[index % COLORS.length]}
                          />
                        ))}
                      </Pie>
                      <Tooltip />
                    </PieChart>
                  </ResponsiveContainer>
                ) : (
                  <span className="text-gray-600">Ma'lumot mavjud emas</span>
                )
              }
            </CardContent>
          </Card>
        </div>

        {/* Top Performing Courses */}
        <Card>
          <CardHeader>
            <CardTitle>Eng Yaxshi Kurslar</CardTitle>
            <CardDescription>
              Eng yuqori daromad va talabalar mamnuniyatiga ega kurslar
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Kurs Nomi</TableHead>
                  <TableHead>Daromad</TableHead>
                  <TableHead>O'quvchilar</TableHead>
                  <TableHead>Reyting</TableHead>
                  <TableHead>O'sish</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {topPerformers.map((course) => (
                  <TableRow key={course.name}>
                    <TableCell className="font-medium">{course.name}</TableCell>
                    <TableCell>{course.revenue.toLocaleString()} so'm</TableCell>
                    <TableCell>{course.students}</TableCell>
                    <TableCell>
                      <span className="flex items-center text-amber-600">
                        {course.rating} <Award className="h-4 w-4 ml-1" />
                      </span>
                    </TableCell>
                    <TableCell className="text-green-600">
                      {course.growth}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Kurs Mashhurligi</CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={data.coursePopularity}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="name" />
                <YAxis />
                <Tooltip />
                <Bar dataKey="students" fill="#8884d8" />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </div>
    </>
  );
}
