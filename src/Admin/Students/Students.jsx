"use client";

import React, { useState, useEffect, useRef, useMemo } from "react";
import { useNavigate, Link, data } from "react-router-dom";
import style from "./Students.module.css";
import { initializeApp } from "https://www.gstatic.com/firebasejs/11.0.2/firebase-app.js";
import { getAnalytics } from "https://www.gstatic.com/firebasejs/11.0.2/firebase-analytics.js";
import {
  getDatabase,
  ref,
  set,
  onValue,
  update,
  remove,
  get
} from "https://www.gstatic.com/firebasejs/11.0.2/firebase-database.js";
import { SidebarPanel } from "../../Sidebar";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Input } from "@/components/ui/input";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Search,
  MoreVertical,
  FileSpreadsheet,
  MessageSquare,
  Plus,
  ChevronDown,
  X,
} from "lucide-react";
import { Sidebar, SidebarContent, SidebarHeader, SidebarProvider } from "../../components/ui/sidebar";
import { Label } from "../../components/ui/label";
import SelectReact from "react-select"
import { ToastContainer } from "react-toastify";
import { AddNotify } from "../../components/ui/Toast"

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

function Students() {
  const navigate = useNavigate();

  const getCurrentMonth = () => {
    const now = new Date();
    const currentMonthAndYear = now.toLocaleString("en-US", {
      month: "long",
      year: "numeric",
    });
    return currentMonthAndYear;
  };

  const getCurrentDate = () => {
    const today = new Date();
    const year = today.getFullYear();
    const month = String(today.getMonth() + 1).padStart(2, "0");
    const day = String(today.getDate()).padStart(2, "0");
    return `${year}-${month}-${day}`;
  };

  const getCurrentMonthDates = (selectedDays) => {
    const dates = [];
    const now = new Date();
    const year = now.getFullYear();
    const month = now.getMonth();
    const daysInMonth = new Date(year, month + 1, 0).getDate();

    // Haftaning kunlari uchun mos keladigan IDlar
    const dayMapping = {
      du: 1, // Dushanba
      se: 2, // Seshanba
      chor: 3, // Chorshanba
      pay: 4, // Payshanba
      ju: 5, // Juma
      shan: 6, // Shanba
      yak: 0, // Yakshanba
    };

    for (let day = 1; day <= daysInMonth; day++) {
      const date = new Date(year, month, day);
      const dayOfWeek = date.getDay();

      // Agar `selectedDays`da kun mavjud bo'lsa, uni qo'shamiz
      if (selectedDays.some((selectedDay) => dayMapping[selectedDay] === dayOfWeek)) {
        dates.push(`${day} ${date.toLocaleString("en-US", { month: "short" })}`);
      }
    }

    return dates;
  };

  // Oy oxirigacha tanlangan kunlar sonini hisoblash
  function countWeekdaysToEndOfMonth(selectedDays, fromDate = new Date()) {
    const dayMapping = {
      du: 1, // Dushanba
      se: 2, // Seshanba
      chor: 3, // Chorshanba
      pay: 4, // Payshanba
      ju: 5, // Juma
      shan: 6, // Shanba
      yak: 0, // Yakshanba
    };
    const result = {};
    selectedDays.forEach((d) => (result[d] = 0));
    const year = fromDate.getFullYear();
    const month = fromDate.getMonth();
    const startDay = fromDate.getDate();
    const daysInMonth = new Date(year, month + 1, 0).getDate();
    for (let day = startDay; day <= daysInMonth; day++) {
      const date = new Date(year, month, day);
      const dayOfWeek = date.getDay();
      selectedDays.forEach((d) => {
        if (dayOfWeek === dayMapping[d]) {
          result[d]++;
        }
      });
    }
    return result;
  }

  // Butun oy bo‘yicha tanlangan kunlar sonini hisoblash
  function countWeekdaysInMonth(selectedDays, fromDate = new Date()) {
    const dayMapping = {
      du: 1,
      se: 2,
      chor: 3,
      pay: 4,
      ju: 5,
      shan: 6,
      yak: 0,
    };
    const result = {};
    selectedDays.forEach((d) => (result[d] = 0));
    const year = fromDate.getFullYear();
    const month = fromDate.getMonth();
    const daysInMonth = new Date(year, month + 1, 0).getDate();
    for (let day = 1; day <= daysInMonth; day++) {
      const date = new Date(year, month, day);
      const dayOfWeek = date.getDay();
      selectedDays.forEach((d) => {
        if (dayOfWeek === dayMapping[d]) {
          result[d]++;
        }
      });
    }
    return result;
  }

  const [isAdd, setIsAdd] = useState(true);
  const [studentInfo, setStudentInfo] = useState("");
  const [studentsData, setStudentsData] = useState([]);
  const [newStudentName, setNewStudentName] = useState("");
  const [newStudentNumber, setNewStudentNumber] = useState();
  const [currentMonth, setCurrentMonth] = useState(getCurrentMonth());
  const [dates, setDates] = useState(getCurrentDate());
  const [groupsData, setGroupsData] = useState([]);
  const [paymentHistory, setPaymentHistory] = useState([]);
  const [showFilters, setShowFilters] = useState(false);
  const [students, setStudents] = useState([]);
  const [teachersData, setTeachersData] = useState([]);
  const [Group, setGroup] = useState([])
  const [GetLeads, setGetLeads] = useState([])
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedStudentName, setSelectedStudentName] = useState("");
  const [courses, setCourses] = useState([]);
  const [AddStudent, setAddStudent] = useState({
    name: "",
    group: "",
  })
  const [firstLeads, setfirstLeads] = useState({})

  const [filters, setFilters] = useState({
    search: "",
    course: "",
    groupStatus: "",
    paymentStatus: "",
    group: "",
    teacher: "",
  });

  const toggleIsAdd = () => {
    setIsAdd(!isAdd);
  };

  const handleFilterChange = (key, value) => {
    setFilters((prev) => ({
      ...prev,
      [key]: value,
    }));
  };

  useEffect(() => {
    const studentsRef = ref(database, "Students");
    onValue(studentsRef, (snapshot) => {
      const data = snapshot.val();
      setStudentsData(data ? Object.values(data) : []);
    });
  }, []);

  useEffect(() => {
    const studentsRef = ref(database, `Payments/${currentMonth}`);
    const unsubscribe = onValue(studentsRef, (snapshot) => {
      const data = snapshot.val();
      setPaymentHistory(data ? Object.values(data) : []);
    });
  }, []);

  useEffect(() => {
    const groupsRef = ref(database, `Groups`);
    onValue(groupsRef, (snapshot) => {
      const data = snapshot.val();
      setGroupsData(Object.values(data || {}))
    });
  }, []);

  useEffect(() => {
    const teachersRef = ref(database, `Teachers`);
    const unsubscribe = onValue(teachersRef, (snapshot) => {
      const data = snapshot.val();
      setTeachersData(data);
    });
  }, []);

  useEffect(() => {
    const coursesRef = ref(database, `Courses`);
    const unsubscribe = onValue(coursesRef, (snapshot) => {
      const data = snapshot.val();
      setCourses(data);
    });

    const LeadsRef = ref(database, "leads")
    onValue(LeadsRef, (snapshot) => {
      const data = snapshot.val()
      setGetLeads(Object.values(data || {}))
    })
  }, []);

  // const updatedStudents = useMemo(() => {
  //   if (groupsData && studentsData.length > 0) {
  //     return studentsData.map((student) => {
  //       if (!groupsData[student.group]) {
  //         return { ...student, group: "" };
  //       }
  //       return student;
  //     });
  //   }
  //   return studentsData;
  // }, [groupsData, studentsData]);

  // useEffect(() => {
  //   updatedStudents.forEach((student) => {
  //     const studentRef = ref(database, `Students/${student.studentName}`);
  //     update(studentRef, { group: student.group });
  //   });
  // }, [updatedStudents]);

  useEffect(() => {
    const searchStudent = GetLeads.find((value) => value.name.toLowerCase() === AddStudent.name.toLowerCase())
    setfirstLeads(searchStudent)
  }, [AddStudent.name])


  const addStudent = () => {
    if ((AddStudent.name && AddStudent.group) === "") {
      console.log("gvjs");

      return
    }
    const selectedDays = ["du", "se", "pay"]; // Guruhning tanlangan kunlari
    const dates = getCurrentMonthDates(selectedDays); // Kunlarni hisoblash

    const date = new Date().toISOString().split("T")[0]; // Qo'shilgan sana
    const today = new Date(); // Bugungi sana

    // Guruh ma'lumotlarini olish
    const groupRef = ref(database, `Groups/${AddStudent.group}`);
    get(groupRef)
      .then((groupSnapshot) => {
        if (groupSnapshot.exists()) {
          const groupData = groupSnapshot.val();
          const courseFee = groupData.price || 0;
          const selectedDays = groupData.selectedDays || [];

          // Oy oxirigacha bo'lgan dars kunlarini hisoblash
          const remainingLessonDays = countWeekdaysToEndOfMonth(selectedDays, today);
          const remainingLessonDaysCount = Object.values(remainingLessonDays).reduce(
            (sum, count) => Number(sum) + Number(count),
            0
          );

          // Har bir dars uchun narxni hisoblash
          const totalLessonDays = countWeekdaysInMonth(selectedDays, today);
          const totalLessonDaysCount = Object.values(totalLessonDays).reduce(
            (sum, count) => Number(sum) + Number(count),
            0
          );
          const perLessonCost = courseFee / (totalLessonDaysCount || 1);

          // Studentni Firebase-ga qo'shish
          set(ref(database, `Students/${AddStudent.name}`), {
            attendance: {
              [currentMonth]: {
                _empty: true,
              },
            },
            id: studentsData.length + 1,
            balance: 0,
            group: AddStudent.group,
            studentName: AddStudent.name,
            studentNumber: firstLeads.phone,
            status: "Faol",
            addedDate: date,
            perLessonCost,
            remainingLessonDaysCount,
            studentHistory: [
              {
                date: date,
                title: "Ro'yxatdan o'tdi",
                description: `${AddStudent.name} ${AddStudent.group} guruhiga qo'shildi.`,
              },
            ],
            paymentHistory: []
          })
            .then(() => {
              toggleIsAdd()
              remove(ref(database, `leads/${firstLeads.name}`))
              setAddStudent({
                name: "",
                group: ""
              })
              AddNotify()
            })
            .catch((error) => {
              console.error(error)
            })
        } else {
          alert("Guruh topilmadi");
        }
      })
      .catch((error) => {
        console.error(error);
      });
  }

  const handleLinkClick = (event, student, studentId, studentName) => {
    console.log(student);
    event.stopPropagation();
    setStudentInfo(studentName);
    navigate(`/student/${studentId}`, { state: { student: student } });
  };

  useEffect(() => {
    studentsData.map((student) => {
      const group = groupsData.find((item) => item.groupName.toLowerCase() === student.group.toLowerCase())

      setGroup([group])
    })
  }, [studentsData, groupsData])

  return (
    <>
      <ToastContainer />

      <SidebarProvider>
        {(!isAdd) && (
          <div
            className="fixed w-full h-[100vh] bg-black/50 backdrop-blur-[2px] z-30 inset-0 transition-all duration-900 ease-in-out"
            onClick={toggleIsAdd}
          ></div>
        )}
        <Sidebar
          className={`fixed inset-y-0 right-0 z-50 w-[400px] border-l border-gray-300 bg-white transition-transform duration-300 ease-in-out ${!isAdd ? "translate-x-0" : "translate-x-full"}`}
          side="right"
          collapsible="none"
        >
          <SidebarHeader className="flex items-center justify-between border border-gray-300 p-4">
            <h2 className="text-lg font-normal">
              Yangi talaba qo'shish
            </h2>
            <Button
              onClick={toggleIsAdd}
              className="rounded-full hover:bg-gray-100"
            >
              <X className="h-5 w-5" />
            </Button>
          </SidebarHeader>
          <SidebarContent>
            <form className="space-y-6 p-6 text-left">
              <div className="flex flex-col gap-3">
                <Label htmlFor="courseSelect" className="text-xs text-gray-500">Talaba ismi</Label>
                <SelectReact
                  id="courseSelect"
                  className={`${style.inputSearch}`}
                  placeholder="Studentni qidirish..."
                  options={GetLeads.map((item) => ({ value: item.name, label: item.name }))}
                  onChange={(e) => (
                    setAddStudent({ ...AddStudent, name: e.value }),
                    console.log(e.value)

                  )}
                />
              </div>
              <div className="flex flex-col gap-3">
                <Label htmlFor="coursePrice" className="text-xs text-gray-500">Guruh nomi</Label>
                <SelectReact
                  id="coursePrice"
                  placeholder="Guruhni qidirish..."
                  options={groupsData.map((item) => ({ value: item.groupName, label: item.groupName }))}
                  className={`${style.inputSearch}`}
                  onChange={(e) => (setAddStudent({ ...AddStudent, group: e.value }), console.log(e.value))}
                />
              </div>
              <Button
                className="bg-blue-950 hover:opacity-80 text-white px-4 py-2 rounded-md"
                onClick={(e) => {
                  e.preventDefault();
                  addStudent();
                }}
              >
                Qo'shish
              </Button>
            </form>
          </SidebarContent>
        </Sidebar>
      </SidebarProvider>


      <div>
        <SidebarPanel />
        <div
          className={style.main}
          style={{
            marginLeft: "var(--sidebar-width, 250px)",
            width: "var(--sidebar-width), 100%",
            transition: "all 0.5s ease, background 0.3s ease, width 0.5s ease",
          }}
        >
          <div className={style.studentAbout}>
            <h2>Talabalar soni: {studentsData.length}</h2>
            <Button
              onClick={toggleIsAdd}
              className="gap-2 bg-black text-white hover:opacity-80 cursor-pointer"
            >
              <Plus className="h-4 w-4" />
              YANGI QO'SHISH
            </Button>
          </div>
          <div className={style.students}>
            <div className="p-6 col-[1/11]">
              <div className="flex flex-wrap gap-4 mb-6 items-center">
                {/* Search Input */}
                <div className="relative">
                  <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
                  <Input
                    placeholder="Qidirish"
                    value={filters.search}
                    onChange={(e) => handleFilterChange("search", e.target.value)}
                    className="pl-8 w-[200px]"
                  />
                </div>

                {/* Courses Dropdown */}
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="outline">
                      {filters.course || "Kurslar"}{" "}
                      <ChevronDown className="ml-2 h-4 w-4" />
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent>
                    <DropdownMenuItem
                      onClick={() => handleFilterChange("course", "")}
                    >
                      Barchasi
                    </DropdownMenuItem>
                    {courses && Object.keys(courses).length > 0 ? (
                      Object.values(courses).map((course, index) => (
                        <DropdownMenuItem
                          key={index}
                          onClick={() =>
                            handleFilterChange("course", course.name)
                          }
                        >
                          {course.name}
                        </DropdownMenuItem>
                      ))
                    ) : (
                      <DropdownMenuItem disabled>
                        No courses available
                      </DropdownMenuItem>
                    )}
                  </DropdownMenuContent>
                </DropdownMenu>

                {/* Group Status Dropdown */}
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="outline">
                      {filters.groupStatus || "Guruhdagi holati"}{" "}
                      <ChevronDown className="ml-2 h-4 w-4" />
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent>
                    <DropdownMenuItem
                      onClick={() => handleFilterChange("groupStatus", "")}
                    >
                      Barchasi
                    </DropdownMenuItem>
                    <DropdownMenuItem
                      onClick={() => handleFilterChange("groupStatus", "Faol")}
                    >
                      Faol
                    </DropdownMenuItem>
                    <DropdownMenuItem
                      onClick={() =>
                        handleFilterChange("groupStatus", "Nofaol")
                      }
                    >
                      Nofaol
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>

                {/* Payment Status Dropdown */}
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="outline">
                      {filters.paymentStatus || "To'lov holati"}{" "}
                      <ChevronDown className="ml-2 h-4 w-4" />
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent>
                    <DropdownMenuItem
                      onClick={() => handleFilterChange("paymentStatus", "")}
                    >
                      Barchasi
                    </DropdownMenuItem>
                    <DropdownMenuItem
                      onClick={() =>
                        handleFilterChange("paymentStatus", "To'langan")
                      }
                    >
                      To'langan
                    </DropdownMenuItem>
                    <DropdownMenuItem
                      onClick={() =>
                        handleFilterChange("paymentStatus", "To'lanmagan")
                      }
                    >
                      To'lanmagan
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>

                {/* Teacher Dropdown */}
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="outline">
                      {filters.teacher || "Ustoz"}{" "}
                      <ChevronDown className="ml-2 h-4 w-4" />
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent>
                    <DropdownMenuItem
                      onClick={() => handleFilterChange("teacher", "")}
                    >
                      Barchasi
                    </DropdownMenuItem>
                    {teachersData && Object.keys(teachersData).length > 0 ? (
                      Object.values(teachersData).map((teacher, index) => (
                        <DropdownMenuItem
                          key={index}
                          onClick={() =>
                            handleFilterChange("teacher", teacher.name)
                          }
                        >
                          {teacher.name}
                        </DropdownMenuItem>
                      ))
                    ) : (
                      <DropdownMenuItem disabled>
                        No teachers available
                      </DropdownMenuItem>
                    )}
                  </DropdownMenuContent>
                </DropdownMenu>

                <div className="flex gap-2 ml-auto">
                  <Button
                    variant="outline"
                    className="gap-2 hover:bg-[#0000001b] cursor-pointer"
                  >
                    <FileSpreadsheet className="h-4 w-4" />
                    EXCEL
                  </Button>
                  <Button
                    variant="outline"
                    className="gap-2 hover:bg-[#0000001b] cursor-pointer"
                  >
                    <MessageSquare className="h-4 w-4" />
                    SMS YUBORISH
                  </Button>
                </div>
              </div>

              {/* Table */}
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>ID</TableHead>
                    <TableHead>Ism familiya</TableHead>
                    <TableHead>Baho</TableHead>
                    <TableHead>Telefon raqam</TableHead>
                    <TableHead>Guruhlar</TableHead>
                    <TableHead>O'qituvchi</TableHead>
                  </TableRow>
                </TableHeader>

                <TableBody>
                  {studentsData.length > 0 ? (
                    studentsData.map((student) => {
                      return (
                        <TableRow
                          onClick={(event) =>
                            handleLinkClick(event, student, student.id, student.studentName)
                          }
                          key={student.id}
                        >
                          <TableCell>{student.id}</TableCell>
                          <TableCell>{student.studentName}</TableCell>
                          <TableCell>{student.grade}</TableCell>
                          <TableCell>{student.studentNumber}</TableCell>
                          <TableCell>
                            <span className="inline-flex items-center rounded-full bg-green-50 px-2 py-1 text-xs font-medium text-green-700 ring-1 ring-inset ring-green-600/20">
                              {student.group}
                            </span>
                          </TableCell>
                          {
                            groupsData.length > 0 ? (
                              [groupsData.find(item => item.groupName.toLowerCase() === student.group.toLowerCase())].map((group => {
                                return (
                                  <TableCell>
                                    {group.teachers}
                                  </TableCell>
                                )
                              }))
                            ) : ""
                          }
                        </TableRow>
                      )
                    })) : ""
                  }
                </TableBody>
              </Table>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}

export default Students;
