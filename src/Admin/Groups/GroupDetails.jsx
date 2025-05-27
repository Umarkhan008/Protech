import React, { useState, useEffect } from "react";
import { data, Link, useNavigate, useParams } from "react-router-dom";
import SelectReact from "react-select";
import style from "./Group.module.css";
import { initializeApp } from "https://www.gstatic.com/firebasejs/11.0.2/firebase-app.js";
import { getAnalytics } from "https://www.gstatic.com/firebasejs/11.0.2/firebase-analytics.js";
import { SidebarPanel } from "../../Sidebar.jsx";
import {
  getDatabase,
  ref,
  set,
  onValue,
  update,
  push,
} from "https://www.gstatic.com/firebasejs/11.0.2/firebase-database.js";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "../../components/ui/card";
import {
  Edit,
  Plus,
  Trash2,
  Check,
  ChevronsUpDown,
  X,
  Clock,
} from "lucide-react";
import { Button } from "../../components/ui/button";
import { Input } from "../../components/ui/input";
import { Label } from "../../components/ui/label";
import { Checkbox } from "../../components/ui/checkbox";
import {
  Sidebar,
  SidebarContent,
  SidebarHeader,
  SidebarProvider,
} from "../../components/ui/sidebar";
import { CourseSidebar } from "../../components/ui/course-sidebar";

import { cn } from "../../lib/utils";
import { duration } from "@mui/material";
import { PiArrowUDownLeftBold } from "react-icons/pi";

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

const days = [
  { label: "Toq kunlar (SPSH)" },
  { label: "Juft kunlar (DCHJ)" },
  { label: "Har kuni" },
  { label: "Maxsus kunlar" },
];

const daysOfWeek = [
  { id: "du", label: "Du" },
  { id: "se", label: "Se" },
  { id: "chor", label: "Chor" },
  { id: "pay", label: "Pay" },
  { id: "ju", label: "Ju" },
  { id: "shan", label: "Shan" },
  { id: "yak", label: "Yak" },
];
function GroupDetails() {
  const { id } = useParams(); // URLdan id ni olish
  const navigate = useNavigate(); // useHistory dan foydalaning
  const queryParams = new URLSearchParams(location.search);
  const groupInfoo = JSON.parse(
    decodeURIComponent(queryParams.get("groupInfo"))
  );

  const [open, setOpen] = useState(false);
  const [startTime, setStartTime] = useState("");
  const [endTime, setEndTime] = useState("");
  const [selectedOptions, setSelectedOptions] = useState([]);
  const [coursesData, setCoursesData] = useState([]);
  const [teachersData, setTeachersData] = useState([]);
  const [roomsData, setRoomsData] = useState([]);
  const [groupInfo, setGroupInfo] = useState(groupInfoo);
  const [groupsData, setGroupsData] = useState([]);
  const [newGroupName, setNewGroupName] = useState("");
  const [newPrice, setNewPrice] = useState("");
  const [LessonTime, setLessonTime] = useState([])

  const [AddGroup, setAddGroup] = useState({
    groupName: "",
    courses: "",
    teachers: "",
    rooms: "",
    duration: "",
    selectedDays: [],
  })

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [students, setStudents] = useState([]);
  const [isOpen, setIsOpen] = useState(false);

  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [editGroupData, setEditGroupData] = useState(null);

  const openEditModal = (group) => {
    setEditGroupData(group); // Tahrirlanayotgan guruh ma'lumotlarini saqlash
    setIsEditModalOpen(true); // Modalni ochish
  };

  const closeEditModal = () => {
    setIsEditModalOpen(false); // Modalni yopish
    setEditGroupData(null); // Tahrir ma'lumotlarini tozalash
  };

  const getCurrentMonthDates = () => {
    console.log(groupInfo);

    const selectedDays = groupInfo?.selectedDays || []; // Agar `selectedDays` mavjud bo'lmasa, bo'sh massivni ishlatamiz
    const dates = [];
    const pastMonths = [];
    const months = [];
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

    for (let i = 5; i >= 0; i--) {
      const pastMonth = new Date(year, month - i);
      pastMonths.push(
        pastMonth.toLocaleString("en-US", { month: "long", year: "numeric" })
      );
    }

    months.push(
      now.toLocaleString("en-US", { month: "long", year: "numeric" })
    );

    return { dates, months, pastMonths };
  };

  const { dates, months, pastMonths } = getCurrentMonthDates();

  const [selectedMonth, setSelectedMonth] = useState(`${months}`);

  useEffect(() => {
    const groupsRef = ref(database, `Groups/${id}`);
    onValue(groupsRef, (snapshot) => {
      const data = snapshot.val();
      if (data) {
        setGroupInfo({ id, ...data }); // Guruh ma'lumotlarini state ga saqlash
      } else {
        console.log("Guruh topilmadi");
      }
    });
  }, [id]);

  const handleAttendance = (studentIndex, dateIndex, student, status) => {
    const newStudents = [...students];
    const date = dates[dateIndex]; // Indeksdan sanani olamiz

    // `attendance`ni yangilash
    if (!newStudents[studentIndex][`attendance`][selectedMonth]) {
      newStudents[studentIndex][`attendance`][selectedMonth] = {};
    }
    newStudents[studentIndex][`attendance`][selectedMonth][date] = status;

    // Firebase'da yangilash
    const studentRef = ref(database, `Students/${student.studentName}`);
    update(studentRef, {
      [`attendance/${selectedMonth}/${date}`]: status,
    }).catch((error) => {
      console.error("Error updating attendance in Firebase:", error);
    });

    setStudents(newStudents);
  };


  const handleMonthClick = (month) => {
    setSelectedMonth(month);
  };


  const toggleModal = () => setIsModalOpen(!isModalOpen);

  const handleSelectChange = (selectedOption, actionMeta) => {
    setSelectedOptions((prevState) => ({
      ...prevState,
      [actionMeta.name]: selectedOption,
    }));
  };

  const handleInputChange = (event) => {
    const value = event.target.value;
    setNewGroupName(value); // Update new group name state
    setSelectedOptions((prevState) => ({
      ...prevState,
      groupName: value,
    }));
  };

  const addGroup = () => {
    if (newGroupName.trim() !== "") {
      const newGroup = {
        groupName: newGroupName,
        price: newPrice,
        duration: `${startTime}-${endTime}`,
        courses: selectedOptions.courses ? selectedOptions.courses.label : null,
        teachers: selectedOptions.teachers ? selectedOptions.teachers.label : null,
        rooms: selectedOptions.rooms ? selectedOptions.rooms.label : null,
        selectedDays: selectedDays, // Yangi guruhning kunlari
      };

      // Yangi guruhning boshlanish va tugash vaqtini aniqlash
      const newGroupStartTime = parseInt(startTime.split(":")[0], 10) * 60 +
        parseInt(startTime.split(":")[1], 10);
      const newGroupEndTime = parseInt(endTime.split(":")[0], 10) * 60 +
        parseInt(endTime.split(":")[1], 10);

      // Vaqtlar mantiqiyligini tekshirish
      if (newGroupStartTime >= newGroupEndTime) {
        alert("Boshlanish vaqti tugash vaqtidan oldin bo'lishi kerak.");
        return;
      }

      // To'qnashuvni tekshirish
      const isConflict = groupsData.some((group) => {
        if (!group.duration || !group.rooms || !group.selectedDays) {
          return false; // Guruhda kerakli ma'lumotlar bo'lmasa, to'qnashuv yo'q
        }

        const groupStartTime = parseInt(group.duration.split("-")[0].split(":")[0], 10) * 60 +
          parseInt(group.duration.split("-")[0].split(":")[1], 10);
        const groupEndTime = parseInt(group.duration.split("-")[1].split(":")[0], 10) * 60 +
          parseInt(group.duration.split("-")[1].split(":")[1], 10);

        // Kunlar to'qnashuvini tekshirish
        const hasDayConflict = group.selectedDays.some((day) =>
          newGroup.selectedDays.includes(day)
        );

        // Vaqt to'qnashuvini tekshirish
        const hasTimeConflict =
          (newGroupStartTime < groupEndTime && newGroupEndTime > groupStartTime);

        // Xona, vaqt va kunlar to'qnashuvini birgalikda tekshirish
        return group.rooms === newGroup.rooms && hasDayConflict && hasTimeConflict;
      });

      if (isConflict) {
        alert("Yangi guruhning dars vaqti va xonasi mavjud guruhlar bilan to'qnash keladi.");
        return;
      }

      // Guruhni qo'shish
      setGroupsData([...groupsData, newGroup]);

      const newGroupRef = ref(database, `Groups/${newGroupName}`);
      set(newGroupRef, newGroup)
        .then(() => {
          console.log("Group added to Firebase:", newGroup);
        })
        .catch((error) => {
          console.error("Error adding group to Firebase:", error);
        });

      // Formani tozalash
      setNewGroupName("");
      setStartTime("");
      setEndTime("");
      setNewPrice("");
      setSelectedDays([]); // Kunlarni tozalash
    }
  };



  function handleGroupClick(groupName, id) {
    const groupData = groupsData.find((group) => group.groupName === groupName);
    if (groupData) {
      setGroupInfo(groupData);
      // Fetch students for the selected group
      const studentsRef = ref(database, "Students");
      onValue(studentsRef, (snapshot) => {
        const data = snapshot.val();
        const groupStudents = Object.keys(data)
          .map((key) => data[key])
          .filter((student) => student.group === groupName);

        setStudents(groupStudents);
      });
      navigate(`/group/${id}`); // Yangi sahifaga o'tish
    }
  }


  // Sana bo'yicha `attendance` ma'lumotlarini indeks bo'yicha qayta ishlash
  const getAttendanceByIndex = (attendance, dates) => {
    const attendanceByIndex = Array(dates.length).fill(null); // Barcha indekslarni `null` bilan to'ldiramiz

    dates.forEach((date, index) => {
      if (attendance[date]) {
        attendanceByIndex[index] = attendance[date]; // Sanaga mos keladigan qiymatni indeksga qo'yamiz
      }
    });

    return attendanceByIndex;
  };

  useEffect(() => {
    const coursesRef = ref(database, "Teachers");
    onValue(coursesRef, (snapshot) => {
      const data = snapshot.val();
      const teacherData = Object.keys(data).map((key) => ({
        value: key,
        label: data[key].name,
      }));
      setTeachersData(teacherData);
    });
  }, []);

  useEffect(() => {
    const studentsRef = ref(database, "Students");
    onValue(studentsRef, (snapshot) => {
      const data = snapshot.val();
      const studentsWithAttendance = Object.keys(data).map((key) => ({
        value: key,
        label: data[key].studentName,
        attendance: data[key].attendance,
        studentNumber: data[key].studentNumber,
        group: data[key].group,
      }));

      setStudentsData(studentsWithAttendance);
    });
  }, []);

  useEffect(() => {
    const coursesRef = ref(database, "Courses");
    onValue(coursesRef, (snapshot) => {
      const data = snapshot.val();
      const courseOptions = Object.keys(data).map((key) => ({
        value: key,
        label: data[key].name,
        price: data[key].price,
        duration: data[key].duration,
      }));
      setCoursesData(courseOptions);
    });
  }, []);

  useEffect(() => {
    const coursesRef = ref(database, "Rooms");
    onValue(coursesRef, (snapshot) => {
      const data = snapshot.val();
      const roomData = Object.keys(data).map((key) => ({
        value: key,
        label: data[key].name,
      }));
      setRoomsData(roomData);
    });
  }, []);

  useEffect(() => {
    const groupsRef = ref(database, "Groups");
    onValue(groupsRef, (snapshot) => {
      const data = snapshot.val();
      const groupsArray = Object.keys(data).map((key) => ({
        id: key,
        groupName: key,
        ...data[key],
      }));
      setGroupsData(groupsArray);
    });
  }, []);

  useEffect(() => {
    if (groupInfo) {
      const studentsRef = ref(database, "Students");
      onValue(studentsRef, (snapshot) => {
        const data = snapshot.val();
        const groupStudents = Object.keys(data)
          .map((key) => data[key])
          .filter((student) => student.group === groupInfo.groupName);

        setStudents(groupStudents);
      });
    }
  }, [groupInfo]); // groupInfo o'zgarganida useEffect qayta ishlaydi


  useEffect(() => {
    const LessonTimeRef = ref(database, "LessonTimes");
    onValue(LessonTimeRef, (snapshot) => {
      const data = snapshot.val();
      
      setLessonTime(Object.values(data || {}));
    }); 
  }, [])
  
  const [selectedDays, setSelectedDays] = useState([]);

  const handleDayChange = (day) => {
    // Remove the day if it's already selected
    if (selectedDays.includes(day)) {
      setSelectedDays(prev => prev.filter(d => d !== day));
      return;
    }

    // Add the new day first
    const updatedDays = [...selectedDays, day];

    // Check for odd days pattern (du, chor, ju)
    const oddDays = ['du', 'chor', 'ju'];
    const evenDays = ['se', 'pay', 'shan'];

    // Check if all odd days are selected
    const selectedOddDays = updatedDays.filter(d => oddDays.includes(d));
    if (selectedOddDays.length === 3 && oddDays.includes(day)) {
      setSelectedDays([...oddDays, 'toq kunlar']); // Keep odd days selected and add label
      return;
    }

    // Check if all even days are selected
    const selectedEvenDays = updatedDays.filter(d => evenDays.includes(d));
    if (selectedEvenDays.length === 3 && evenDays.includes(day)) {
      setSelectedDays([...evenDays, 'juft kunlar']); // Keep even days selected and add label
      return;
    }

    setSelectedDays(updatedDays);
  };


  const handleSubmit = (e) => {
    e.preventDefault();
    console.log("Form submitted");
    setOpen(false);
  };
  const toggleSidebar = () => {
    setIsOpen(!isOpen);
  };

  const handleSelectDays = (value) => {
    value === "Toq kunlar (SPSH)" ? setAddGroup({ ...AddGroup, selectedDays: ["Se", "Pay", "Shan"] }) :
    value === "Juft kunlar (DCHJ)" ? setAddGroup({ ...AddGroup, selectedDays: ["Du", "Chor", "Ju"] }) :
    value === "Har kuni" ? setAddGroup({ ...AddGroup, selectedDays: ["Du", "Se", "Chor", "Pay", "Ju", "Shan", "Yak"] }) :
    value === "Maxsus kunlar" ? setAddGroup({ ...AddGroup, selectedDays: "Maxsus kunlar" }) : null
  }

  if (!groupInfo) {
    return <div>Loading...</div>; // Ma'lumotlar yuklanayotganida yuklanishni ko'rsatish
  }

  return (
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
        <div className={style.menu}>
          <h1>Guruhlar: </h1>
          <div className={style.groups}>
            {groupsData.map((group, index) => (
              <span
                key={index}
                onClick={() => handleGroupClick(group.groupName, group.id)}
              >
                {group.groupName}
              </span>
            ))}
          </div>
        </div>
        <div className={style.groupAbout}>
          <h2>Guruhlar soni: {groupsData.length}</h2>
          <SidebarProvider>
            {isOpen && (
              <div
                className="fixed w-full h-[100vh] z-30  inset-0 backdrop-blur-[2px] bg-black/50 transition-all duration-900 ease-in-out"
                onClick={() => {
                  setOpen(false);
                  toggleSidebar();
                }}
              ></div>
            )}
            <Sidebar
              className={cn(
                "fixed inset-y-0 right-0 z-50 w-[400px] border-l border-gray-300 bg-white transition-transform duration-300 ease-in-out",
                open ? "translate-x-0" : "translate-x-full"
              )}
              side="right"
              collapsible="none"
            >
              <SidebarHeader className="flex  items-center justify-between border border-gray-300 p-4">
                <h2 className="text-xl font-semibold">Yangi guruh qo'shish</h2>
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => {
                    setOpen(false);
                    toggleSidebar();
                  }}
                  className="rounded-full hover:bg-gray-100"
                >
                  <X className="h-5 w-5  " />
                  <span className="sr-only">Yopish</span>
                </Button>
              </SidebarHeader>

              <SidebarContent>
                <form
                  onSubmit={handleSubmit}
                  className="space-y-6 p-6 text-left "
                >
                  <div className="space-y-6">
                    <Label htmlFor="courseName">Guruh nomi</Label>
                    <Input
                      id="courseName"
                      placeholder="Guruh nomini kiriting"
                      className={`w-full ${style.inputSearch}`}
                      onChange={(e) => setAddGroup({ ...AddGroup, groupName: e.target.value })}
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="courseSelect">Kursni tanlash</Label>
                    <SelectReact
                      onChange={(e) => setAddGroup({ ...AddGroup, courses: e.value })}
                      options={coursesData}
                      placeholder="Kursni tanlang"
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="teacher">O'qituvchi</Label>
                    <SelectReact  
                      value={selectedOptions.teachers}
                      onChange={(selectedOption) =>
                        handleSelectChange(selectedOption, { name: "teachers" })
                      }
                      options={teachersData}
                      placeholder="O'qitchini tanlang"
                    />
                  </div>

                  <div className="space-y-3">
                    <Label>Dars kunlari</Label>
                    <div className="flex flex-wrap gap-3">
                      {AddGroup.selectedDays !== "Maxsus kunlar" ? <SelectReact
                        className="w-full"
                        placeholder="Dars kunlarini tanlang"
                        options={days.map((day) => ({ value: day.label, label: day.label }))}
                        onChange={(e) => handleSelectDays(e.value)}
                      /> :
                        <div className="w-full flex justify-start flex-col gap-3">
                          <div
                            className="cursor-pointer w-[30px] h-[30px] rounded-full hover:bg-gray-200 flex justify-center items-center"
                            onClick={() => setAddGroup({ ...AddGroup, selectedDays: [] })}
                          >
                            <PiArrowUDownLeftBold className="text-lg" />
                          </div>
                          {
                            daysOfWeek.map((day) => (
                              <div
                                key={day.id}
                                className="flex items-center space-x-2"
                              >
                                <Checkbox
                                  id={day.id}
                                  checked={selectedDays.includes(day.id)}
                                  onCheckedChange={() => handleDayChange(day.id)}
                                />
                                <Label
                                  htmlFor={day.id}
                                  className="text-sm font-normal cursor-pointer"
                                >
                                  {day.label}
                                </Label>
                              </div>
                            ))}
                        </div>
                      }
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label>Dars vaqti</Label>
                    <SelectReact
                      placeholder="Dars vaqti tanlang"
                      className="w-full"
                      options={LessonTime.map((time) => ({value: time, label: time}))}
                      onChange={(e) => console.log(e.value)}
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="room">Xona</Label>
                    <SelectReact
                      value={selectedOptions.rooms}
                      onChange={(selectedOption) =>
                        handleSelectChange(selectedOption, { name: "rooms" })
                      }
                      options={roomsData}
                      placeholder="Xona tanlang"
                    />
                  </div>

                  <Button
                    type="submit"
                    className="w-full bg-black hover:opacity-80 text-white"
                    onClick={() => {
                      setOpen(false);
                      toggleSidebar();
                      addGroup();
                    }}
                  >
                    Saqlash
                  </Button>
                </form>
              </SidebarContent>
            </Sidebar>
          </SidebarProvider>
          <Button
            className={style.groupAddButton}
            onClick={() => {
              setOpen(true);
              toggleSidebar();
            }}
          >
            Guruh qo'shish
          </Button>
        </div>
        <Card className="col-[1/4] row-[4/11] border-slate-200 rounded-[5px]">
          {groupInfo && (
            <>
              <CardHeader className="border-b pb-4">
                <CardTitle>{groupInfo.groupName}</CardTitle>
              </CardHeader>
              <CardContent className="pt-6">
                <div className="space-y-4">
                  <div className="grid gap-1">
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Kurs:</span>
                      <span className="font-medium">
                        {groupInfo.courses
                          ? groupInfo.courses
                          : "No course selected"}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">O'qituvchi:</span>
                      <span className="font-medium">
                        {groupInfo.teachers
                          ? groupInfo.teachers
                          : "No teacher selected"}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Narx:</span>
                      <span className="font-medium">
                        {groupInfo.price ? `${groupInfo.price} UZS` : "N/A"}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Dars vaqti:</span>
                      <span className="font-medium">
                        {duration
                          ? `${groupInfo.duration}`
                          : "N/A"}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Room:</span>
                      <span className="font-medium">
                        {groupInfo.rooms ? groupInfo.rooms : "No room selected"}
                      </span>
                    </div>
                  </div>

                  <div className="flex gap-2 pt-4">
                    <Button
                      variant="outline"
                      size="icon"
                      className="rounded-full text-orange-500 border-orange-500 hover:bg-orange-50"
                      onClick={() => openEditModal(groupInfo)}
                    >
                      <Edit className="h-4 w-4" />
                      <span className="sr-only">Edit</span>
                    </Button>
                    <Button
                      variant="outline"
                      size="icon"
                      className="rounded-full text-red-500 border-red-500 hover:bg-red-50"
                    >
                      <Trash2 className="h-4 w-4" />
                      <span className="sr-only">Delete</span>
                    </Button>
                    <CourseSidebar />
                  </div>
                </div>
              </CardContent>
            </>
          )}
        </Card>

        <div className={style.davomat}>
          <h1>Davomat</h1>
          <div className={style.months}>
            {months.map((month, index) => (
              <span
                key={index}
                className={month === selectedMonth ? style.active : ""}
                onClick={() => handleMonthClick(month)}
              >
                {month}
              </span>
            ))}
          </div>

          <div className={style.attendanceGrid}>
            <div className={style.header}>
              <div className={style.nameCol}>Ism</div>
              {dates.map((date, index) => (
                <div key={index} className={style.dateCol}>
                  {date}
                </div>
              ))}
            </div>

            {students.map((student, studentIndex) => {
              // Tanlangan oy uchun `attendance` ma'lumotlarini tekshirish
              const attendanceData = student[`attendance`]?.[selectedMonth];
              if (!attendanceData) {
                return (
                  <div key={studentIndex} className={style.studentCol}>
                    <div className={style.nameCol}>{student.studentName}</div>
                    <div className={style.dateCol} colSpan={dates.length}>
                      <span className="text-red-500">Not Found</span>
                    </div>
                  </div>
                );
              }

              const attendanceByIndex = getAttendanceByIndex(attendanceData, dates);

              return (
                <div key={studentIndex} className={style.studentCol}>
                  <div className={style.nameCol}>{student.studentName}</div>

                  {attendanceByIndex.map((attendance, dateIndex) => {
                    const currentDate = dates[dateIndex];
                    const today = `${new Date().getDate()} ${new Date().toLocaleString("en-US", {
                      month: "short",
                    })}`;
                    const isPastDate = new Date(currentDate) < new Date(today);
                    const isNotToday = currentDate !== today;

          return (
            <div key={dateIndex} className={style.attendanceCell}>
              <div
                className={`${style.circle} ${
                  attendance === true
                    ? style.present
                    : attendance === false
                    ? style.absent
                    : ""
                }`}
              >
                <div className={style.hoverButtons}>
                  <button
                    className={style.yesBtn}
                    onClick={() =>
                      handleAttendance(studentIndex, dateIndex, student, true)
                    }
                    disabled={isPastDate || isNotToday}
                  >
                    Ha
                  </button>
                  <button
                    className={style.noBtn}
                    onClick={() =>
                      handleAttendance(studentIndex, dateIndex, student, false)
                    }
                    disabled={isPastDate || isNotToday}
                  >
                    Yo'q
                  </button>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    );
  })}
</div>

        </div>
      </div>
      <div>
        {isEditModalOpen && (

      <div
      className="fixed w-full  h-[100vh] z-30  inset-0 backdrop-blur-sm transition-all duration-900 ease-in-out"
      onClick={() => {
        closeEditModal()
        }}
              ></div>
            )}

        {/* Modalning o'ngdan chiqishi */}
        <Sidebar
          className={cn(
            "fixed inset-y-0 right-0 z-50 w-[400px] border-l border-gray-300 bg-white transition-transform duration-300 ease-in-out",
            isEditModalOpen ? "translate-x-0" : "translate-x-full"
          )}
          side="right"
          collapsible="none"
        >
          <SidebarHeader className="flex items-center justify-between border-b border-gray-300 p-4">
            <h2 className="text-xl font-semibold">Guruhni tahrirlash</h2>
            <Button
              variant="ghost"
              size="icon"
              onClick={closeEditModal}
              className="rounded-full hover:bg-gray-100"
            >
              <X className="h-5 w-5" />
              <span className="sr-only">Yopish</span>
            </Button>
          </SidebarHeader>

          <SidebarContent>
            <form
              onSubmit={(e) => {
                e.preventDefault();

                const updatedGroup = {
                  ...editGroupData,
                  groupName: newGroupName || editGroupData.groupName,
                  price: newPrice || editGroupData.price,
                  duration: `${startTime || editGroupData.duration.split("-")[0]}-${endTime || editGroupData.duration.split("-")[1]
                    }`,
                  courses: selectedOptions.courses
                    ? selectedOptions.courses?.label
                    : editGroupData.courses,
                  teachers: selectedOptions.teachers
                    ? selectedOptions.teachers.label
                    : editGroupData.teachers,
                  rooms: selectedOptions.rooms
                    ? selectedOptions.rooms.label
                    : editGroupData.rooms,
                  selectedDays: selectedDays.length
                    ? selectedDays
                    : editGroupData.selectedDays,
                };

                // Yangi guruhning boshlanish va tugash vaqtini aniqlash
                const newGroupStartTime = parseInt(updatedGroup.duration.split("-")[0].split(":")[0], 10) * 60 +
                  parseInt(updatedGroup.duration.split("-")[0].split(":")[1], 10);
                const newGroupEndTime = parseInt(updatedGroup.duration.split("-")[1].split(":")[0], 10) * 60 +
                  parseInt(updatedGroup.duration.split("-")[1].split(":")[1], 10);

                // Vaqtlar mantiqiyligini tekshirish
                if (newGroupStartTime >= newGroupEndTime) {
                  alert("Boshlanish vaqti tugash vaqtidan oldin bo'lishi kerak.");
                  return;
                }

                // To'qnashuvni tekshirish
                const isConflict = groupsData.some((group) => {
                  if (group.groupName === editGroupData.groupName) {
                    return false; // O'zi bilan to'qnashuvni tekshirmaslik
                  }

                  if (!group.duration || !group.rooms || !group.selectedDays) {
                    return false; // Guruhda kerakli ma'lumotlar bo'lmasa, to'qnashuv yo'q
                  }

                  const groupStartTime = parseInt(group.duration.split("-")[0].split(":")[0], 10) * 60 +
                    parseInt(group.duration.split("-")[0].split(":")[1], 10);
                  const groupEndTime = parseInt(group.duration.split("-")[1].split(":")[0], 10) * 60 +
                    parseInt(group.duration.split("-")[1].split(":")[1], 10);

                  // Kunlar to'qnashuvini tekshirish
                  const hasDayConflict = group.selectedDays.some((day) =>
                    updatedGroup.selectedDays.includes(day)
                  );

                  // Vaqt to'qnashuvini tekshirish
                  const hasTimeConflict =
                    (newGroupStartTime < groupEndTime && newGroupEndTime > groupStartTime);

                  // Xona, vaqt va kunlar to'qnashuvini birgalikda tekshirish
                  return group.rooms === updatedGroup.rooms && hasDayConflict && hasTimeConflict;
                });

                if (isConflict) {
                  alert("Guruhning dars vaqti va xonasi boshqa guruhlar bilan to'qnash keladi.");
                  return;
                }

                // Firebase'da guruhni yangilash
                handleGroupUpdate(updatedGroup);
              }}
              className="space-y-6 p-6 text-left"
            >
              <div className="space-y-4">
                <div>
                  <Label htmlFor="editGroupName">Guruh nomi</Label>
                  <Input
                    id="editGroupName"
                    placeholder="Guruh nomini kiriting"
                    defaultValue={editGroupData?.groupName}
                    onChange={(e) => setNewGroupName(e.target.value)}
                  />
                </div>
                <div>
                  <Label htmlFor="editPrice">Narxi</Label>
                  <Input
                    id="editPrice"
                    placeholder="Narxini kiriting"
                    defaultValue={editGroupData?.price}
                    onChange={(e) => setNewPrice(e.target.value)}
                  />
                </div>
                <div>
                  <Label htmlFor="editCourse">Kursni tanlash</Label>
                  <SelectReact
                    value={
                      selectedOptions.courses ||
                      coursesData.find((course) => course.label === editGroupData?.courses) ||
                      null
                    }
                    onChange={(selectedOption) =>
                      handleSelectChange(selectedOption, { name: "courses" })
                    }
                    options={coursesData}
                  />
                </div>
                <div>
                  <Label htmlFor="editTeacher">O'qituvchi</Label>
                  <SelectReact
                    value={
                      selectedOptions.teachers ||
                      teachersData.find((teacher) => teacher.label === editGroupData?.teachers) ||
                      null
                    }
                    onChange={(selectedOption) =>
                      handleSelectChange(selectedOption, { name: "teachers" })
                    }
                    options={teachersData}
                  />
                </div>
                <div>
                  <Label htmlFor="editRoom">Xona</Label>
                  <SelectReact
                    value={
                      selectedOptions.rooms ||
                      roomsData.find((room) => room.label === editGroupData?.rooms) ||
                      null
                    }
                    onChange={(selectedOption) =>
                      handleSelectChange(selectedOption, { name: "rooms" })
                    }
                    options={roomsData}
                  />
                </div>
                <div>
                  <Label>Dars vaqti</Label>
                  <div className="grid grid-cols-2 gap-4">
                    <Input
                      type="time"
                      defaultValue={editGroupData?.duration.split("-")[0]}
                      onChange={(e) => setStartTime(e.target.value)}
                    />
                    <Input
                      type="time"
                      defaultValue={editGroupData?.duration.split("-")[1]}
                      onChange={(e) => setEndTime(e.target.value)}
                    />
                  </div>
                </div>
                <div>
                  <Label>Dars kunlari</Label>
                  <div className="flex flex-wrap gap-3">
                    {daysOfWeek.map((day) => (
                      <div key={day.id} className="flex items-center space-x-2">
                        <Checkbox
                          id={day.id}
                          checked={
                            selectedDays.includes(day.id) ||
                            (editGroupData?.selectedDays &&
                              editGroupData.selectedDays.includes(day.id))
                          }
                          onCheckedChange={() => handleDayChange(day.id)}
                        />
                        <Label htmlFor={day.id}>{day.label}</Label>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
              <div className="mt-6 flex justify-end space-x-4">
                <Button
                  variant="outline"
                  onClick={closeEditModal}
                  className="text-gray-600"
                >
                  Bekor qilish
                </Button>
                <Button type="submit" className="bg-blue-600 text-white">
                  Saqlash
                </Button>
              </div>
            </form>
          </SidebarContent>
        </Sidebar>
      </div>
    </div>
  );
}

const updateStudentAttendance = (groupName, selectedDays) => {
  const studentsRef = ref(database, "Students");

  onValue(studentsRef, (snapshot) => {
    const studentsData = snapshot.val();

    if (!studentsData) return;

    Object.keys(studentsData).forEach((studentKey) => {
      const student = studentsData[studentKey];

      // Faqat ushbu guruhga tegishli talabalarni yangilash
      if (student.group === groupName) {
        const currentMonth = new Date().toLocaleString("en-US", {
          month: "long",
          year: "numeric",
        });

        // Guruhdagi yangi kunlar
        const newDates = getCurrentMonthDates(selectedDays);

        // Yangi attendance ma'lumotlarini yaratish
        const updatedAttendance = {};
        newDates.forEach((date) => {
          updatedAttendance[date] = false; // Barcha yangi kunlar uchun `false` qiymat qo'shamiz
        });

        // Firebase ma'lumotlar bazasiga yozish
        const studentRef = ref(database, `Students/${studentKey}`);
        update(studentRef, {
          [`attendance/${currentMonth}`]: updatedAttendance, // Eski ma'lumotlarni o'chirib, yangi ma'lumotlarni yozamiz
        })
          .then(() => {
            console.log(
              `Attendance updated for student: ${student.studentName}`
            );
          })
          .catch((error) => {
            console.error(
              `Error updating attendance for student: ${student.studentName}`,
              error
            );
          });
      }
    });
  });
};

const handleGroupUpdate = (updatedGroup) => {
  const groupRef = ref(database, `Groups/${updatedGroup.groupName}`);
  update(groupRef, updatedGroup)
    .then(() => {
      alert("Group updated successfully!");

      // Talabalar `attendance` ma'lumotlarini yangilash
      updateStudentAttendance(updatedGroup.groupName, updatedGroup.selectedDays);
    })
    .catch((error) => {
      console.error("Error updating group:", error);
    });
};

export default GroupDetails;

