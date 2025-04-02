import React, { useState, useEffect } from "react";
import { useNavigate, Link } from "react-router-dom";
import { initializeApp } from "https://www.gstatic.com/firebasejs/11.0.2/firebase-app.js";
import { getAnalytics } from "https://www.gstatic.com/firebasejs/11.0.2/firebase-analytics.js";
import {
  getDatabase,
  ref,
  onValue,
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

export default function Dashboard({ data }) {
  const [groupsData, setGroupsData] = useState([]);
  const [roomData, setRoomsData] = useState([]);
  const [leadsData, setLeadsData] = useState([]);
  const [courseSchedule, setCourseSchedule] = useState([]); // Ertangi kun uchun jadval
  const navigate = useNavigate();

  useEffect(() => {
    const leadsRef = ref(database, "leads");
    onValue(leadsRef, (snapshot) => {
      const data = snapshot.val
      ();
      const leadsArray = data ? Object.values(data) : 0;
      setLeadsData(leadsArray);
    });
  }, [])

  console.log(leadsData);


  useEffect(() => {
    const groupsRef = ref(database, "Groups");
    onValue(groupsRef, (snapshot) => {
      const data = snapshot.val();
      const groupsArray = Object.keys(data || {}).map((key) => ({
        id: key,
        groupName: key,
        ...data[key], // Includes selectedDays
      }));
      setGroupsData(groupsArray);
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
      const roomData = Object.keys(data).map((key) => ({
        value: key,
        label: data[key].name,
      }));
      setRoomsData(roomData);
    });
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

  const courseRevenue = [
    { name: "Web Dasturlash", value: 35 },
    { name: "Data Science", value: 25 },
    { name: "Mobile Dasturlash", value: 20 },
    { name: "Cloud Hisoblash", value: 20 },
  ];

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

  useEffect(() => {
    // Komponent yuklanganda bugungi guruhlarni ko'rsatish
    handleShowTodayGroups();
  }, [groupsData]);

  return (
    <div className="space-y-5">

      {/* Payment */}
      <div className="flex items-center justify-between mb-8">
        <h1 className="text-3xl font-bold">IT Ta'lim Markazi CRM</h1>
        <div className="flex gap-4">
          <Button className="bg-green-600 hover:bg-green-700 text-white">
            <CreditCard className="w-4 h-4 mr-2" />
            To'lov qilish
          </Button>
          <Button variant="outline" className="border-green-600 text-green-600 hover:bg-green-50">
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
          onClick={() => handleCardClick(groupsData[1]?.id)}
        >
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">
              Faol O'quvchilar
            </CardTitle>
            <Users className="h-4 w-4 text-green-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-700">
              {data.totalStudents}
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
            <div className="text-2xl font-bold text-indigo-700">24</div>
            <p className="text-xs text-indigo-600 mt-1 flex items-center">
              <TrendingUp className="h-4 w-4 mr-1" />
              O'tgan oyga nisbatan +2 ta
            </p>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-amber-50 to-amber-100">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">
              Qarzdor O'quvchilar
            </CardTitle>
            <AlertTriangle className="h-4 w-4 text-amber-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-amber-700">15</div>
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
  );
}
