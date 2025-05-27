import React, { useState, useEffect } from "react";
import SelectReact from "react-select";
import { data, Link, useNavigate } from "react-router-dom";
import style from "./Group.module.css";
import { initializeApp } from "https://www.gstatic.com/firebasejs/11.0.2/firebase-app.js";
import { getAnalytics } from "https://www.gstatic.com/firebasejs/11.0.2/firebase-analytics.js";
import {
  getDatabase,
  ref,
  set,
  onValue,
  update,
  push,
} from "https://www.gstatic.com/firebasejs/11.0.2/firebase-database.js";
import { SidebarPanel } from "../../Sidebar";
import {
  Sidebar,
  SidebarContent,
  SidebarHeader,
  SidebarProvider,
} from "../../components/ui/sidebar";
import { Card, CardContent, CardHeader, CardTitle } from "../../components/ui/card"
import {
  Edit,
  Plus,
  Trash2,
  Check,
  ChevronsUpDown,
  X,
  Clock,
} from "lucide-react";
import { Button } from "../../components/ui/button"
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from "../../components/ui/sheet";
import { Input } from "@/components/ui/input";
import { Label } from "../../components/ui/label";
import { Checkbox } from "../../components/ui/checkbox";
import { Popover, PopoverContent, PopoverTrigger } from "../../components/ui/popover";
import { Command, CommandEmpty, CommandGroup, CommandInput, CommandItem, CommandList } from "../../components/ui/command";
import { cn } from "../../lib/utils";


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
  { label: "Toq kunlar" },
  { label: "Juft kunlar" },
  { label: "Dam olish kuni" },
  { label: "Har kuni" },
];


const teachers = [
  { value: "umarxon", label: "Umarxon" },
  { value: "abror", label: "Abror" },
  { value: "sardor", label: "Sardor" },
  { value: "dilshod", label: "Dilshod" },
]

const rooms = [
  { value: "1", label: "1-xona" },
  { value: "2", label: "2-xona" },
  { value: "3", label: "3-xona" },
  { value: "4", label: "4-xona" },
]

const weekDays = [
  { id: "monday", label: "Du" },
  { id: "tuesday", label: "Se" },
  { id: "wednesday", label: "Chor" },
  { id: "thursday", label: "Pay" },
  { id: "friday", label: "Ju" },
  { id: "saturday", label: "Shan" },
  { id: "sunday", label: "Yak" },
]
const daysOfWeek = [
  { id: "du", label: "Du" },
  { id: "se", label: "Se" },
  { id: "chor", label: "Chor" },
  { id: "pay", label: "Pay" },
  { id: "ju", label: "Ju" },
  { id: "shan", label: "Shan" },
  { id: "yak", label: "Yak" },
];

function Groups() {
  const navigate = useNavigate();

  const [openTeacher, setOpenTeacher] = React.useState(false)
  const [valueTeacher, setValueTeacher] = React.useState("")
  const [open, setOpen] = useState(false);
  const [isOpen, setIsOpen] = useState(false);
  const [startTime, setStartTime] = useState("");
  const [endTime, setEndTime] = useState("");
  const [openRoom, setOpenRoom] = React.useState(false)
  const [valueRoom, setValueRoom] = React.useState("")
  const [isAdd, setIsAdd] = useState(true);
  const [selectedOptions, setSelectedOptions] = useState([]);
  const [coursesData, setCoursesData] = useState([]);
  const [teachersData, setTeachersData] = useState([]);
  const [roomsData, setRoomsData] = useState([]);
  const [groupInfo, setGroupInfo] = useState();
  const [groupsData, setGroupsData] = useState([]);
  const [studentsData, setStudentsData] = useState([]);
  const [newGroupName, setNewGroupName] = useState("");
  const [newPrice, setNewPrice] = useState("");
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [newStudentName, setNewStudentName] = useState("");
  const [newStudentNumber, setNewStudentNumber] = useState("");
  const [students, setStudents] = useState([]);
  const [selectedDays, setSelectedDays] = useState([]); 

  const getCurrentMonthDates = () => {
    const dates = [];
    const pastMonths = [];
    const months = [];
    const now = new Date();
    const year = now.getFullYear();
    const month = now.getMonth();
    const daysInMonth = new Date(year, month + 1, 0).getDate();

    for (let day = 1; day <= daysInMonth; day++) {
      const date = new Date(year, month, day);
      const dayOfWeek = date.getDay();
      if (dayOfWeek === 2 || dayOfWeek === 4 || dayOfWeek === 6) {
        dates.push(
          `${day} ${date.toLocaleString("en-US", { month: "short" })}`
        );
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

  const handleAttendance = (studentIndex, dateIndex, student, status) => {
    const newStudents = [...students, dateIndex];
    newStudents[studentIndex][`attendance`][months][dateIndex] = status;

    const studentCell = ref(database, `Students/${student.studentName}`);

    update(studentCell, {
      [`attendance/${months}/${dateIndex}`]: status,
    }).catch((error) => {
      console.error("Error adding group to Firebase:", error);
    });

    setStudents(students);
    console.log(students);
  };

  const handleMonthClick = (month) => {
    setSelectedMonth(month);
  };

  const toggleIsAdd = () => {
    setIsAdd(!isAdd);
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

  const handleDayChange = (day) => {
    if (selectedDays.includes(day)) {
      setSelectedDays((prev) => prev.filter((d) => d !== day));
      return;
    }

    const updatedDays = [...selectedDays, day];
    setSelectedDays(updatedDays);
  };

  const handleInputChangeNum = (event) =>
    setNewStudentNumber(event.target.value || "");

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


  const addStudentToGroup = () => {
    if (newStudentName.trim() === "" || newStudentNumber.trim() === "") {
      console.log("Student name and number are required");
      return;
    }

    const newStudent = {
      studentName: newStudentName,
      studentNumber: newStudentNumber,
      group: groupInfo.groupName,
      attendance: {
        [months]: Array(dates.length).fill(false),
      },
    };

    const userRef = ref(database, `Students/${newStudentName}`);
    update(userRef, newStudent)
      .then(() => {
        alert("Ma'lumot muvaffaqiyatli yangilandi!");
      })
      .catch((error) => {
        console.error("Xatolik yuz berdi: ", error);
      });

    setNewStudentName("");
    setNewStudentNumber("");
    toggleModal();
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    console.log("Form submitted");
    setOpen(false);
  };
  const toggleSidebar = () => {
    setIsOpen(!isOpen);
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
  console.log(groupInfo);

  const attendance = (studentName) => {
    const attendanceRef = ref(database, `Students/${studentName}/attendance`);

    // Get the current date
    const currentDate = new Date();

    // Format the key as "YYYY-MM-DD"
    const dateKey = `${currentDate.getFullYear()}-${String(
      currentDate.getMonth() + 1
    ).padStart(2, "0")}-${String(currentDate.getDate()).padStart(2, "0")}`;

    const attendanceData = {
      [dateKey]: { status: true },
    };

    update(attendanceRef, attendanceData)
      .then(() => {
        console.log("Attendance recorded for:", studentName);
        console.log(studentsData[0].attendance);
      })
      .catch((error) => {
        console.error("Error adding attendance to Firebase:", error);
      });
  };

  // ... existing code ...

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
        duration: data[key].duration
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




  return (
    <>
      <SidebarProvider>
        {isOpen && (
          <div
            className="fixed w-full h-[100vh] bg-black/50 backdrop-blur-[2px] z-30 inset-0 transition-all duration-900 ease-in-out"
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
            <h2 className="text-xl font-semibold">Yangi kurs qo'shish</h2>
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
              className="space-y-6 p-6 text-left"
            >
              <div className="space-y-6">
                <Label htmlFor="courseName">Kurs nomi</Label>
                <Input
                  id="courseName"
                  placeholder="Kurs nomini kiriting"
                  className={`${style.inputSearch} w-full`}
                  value={newGroupName} // Controlled input
                  onChange={handleInputChange}
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="courseSelect">Kursni tanlash</Label>
                <SelectReact
                  value={selectedOptions.courses}
                  onChange={(selectedOption) =>
                    handleSelectChange(selectedOption, { name: "courses" })
                  }
                  options={coursesData}
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
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="price">Narxi</Label>
                <Input
                  id="price"
                  placeholder="Narxini kiriting"
                  className={`${style.inputSearch} w-full`}
                  value={newPrice}
                  onChange={(e) => setNewPrice(e.target.value)}
                  required
                />
              </div>

              <div className="space-y-3">
                <Label>Dars kunlari</Label>
                <div className="flex flex-wrap gap-3">
                  {daysOfWeek.map((day) => (
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
              </div>

              <div className="space-y-2">
                <Label>Dars vaqti</Label>
                <div className="grid grid-cols-2 gap-4">
                  <div className="relative">
                    <Input
                      type="time"
                      className={`${style.inputSearch} w-full pl-10`}
                      value={startTime}
                      onChange={(e) => setStartTime(e.target.value)}
                      required
                    />
                    <Clock className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-500" />
                  </div>
                  <div className="relative">
                    <Input
                      type="time"
                      className={`${style.inputSearch} w-full pl-10`}
                      value={endTime}
                      onChange={(e) => setEndTime(e.target.value)}
                      required
                    />
                    <Clock className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-500" />
                  </div>
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="room">Xona</Label>
                <SelectReact
                  value={selectedOptions.rooms}
                  onChange={(selectedOption) =>
                    handleSelectChange(selectedOption, { name: "rooms" })
                  }
                  options={roomsData}
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
            <Button className={style.groupAddButton}
              onClick={() => {
                setOpen(true);
                toggleSidebar();
              }}>
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
                        <span className="font-medium">{groupInfo.courseName}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">O'qituvchi:</span>
                        <span className="font-medium">{groupInfo.teacherName}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">Narx:</span>
                        <span className="font-medium">{groupInfo.price} UZS</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">Davomiyligi:</span>
                        <span className="font-medium">{groupInfo.schedule}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">Room:</span>
                        <span className="font-medium">{groupInfo.room}</span>
                      </div>
                    </div>

                    <div className="flex gap-2 pt-4">
                      <Button
                        variant="outline"
                        size="icon"
                        className="rounded-full text-orange-500 border-orange-500 hover:bg-orange-50"
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
                      <Button
                        variant="outline"
                        size="icon"
                        onClick={toggleModal}
                        className="rounded-full text-blue-500 border-blue-500 hover:bg-blue-50"
                      >
                        <Plus className="h-4 w-4" />
                        <span className="sr-only">Add</span>
                      </Button>
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

              {students.map((student, studentIndex) => (
                <div key={studentIndex} className={style.studentCol}>
                  <div className={style.nameCol}>{student.studentName}</div>
                  {student[`attendance`][selectedMonth] &&
                    Array.isArray(student[`attendance`][selectedMonth]) ? (
                    student[`attendance`][selectedMonth].map(
                      (attendance, dateIndex) => (
                        <div key={dateIndex} className={style.attendanceCell} x>
                          <div
                            className={`${style.circle} ${attendance === true
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
                                  handleAttendance(
                                    studentIndex,
                                    dateIndex,
                                    student,
                                    true
                                  )
                                }
                              >
                                Ha
                              </button>
                              <button
                                className={style.noBtn}
                                onClick={() =>
                                  handleAttendance(
                                    studentIndex,
                                    dateIndex,
                                    student,
                                    false
                                  )
                                }
                              >
                                Yo'q
                              </button>
                            </div>
                          </div>
                        </div>
                      )
                    )
                  ) : (
                    <div>No attendance data available</div>
                  )}
                </div>
              ))}
            </div>
          </div>
        </div>
        <Sheet>
          <SheetContent side="right" className="w-[400px] sm:w-[540px]">
            <SheetHeader>
              <SheetTitle>Yangi kurs qo'shish</SheetTitle>
            </SheetHeader>
            <form className="grid gap-4 py-4">
              <div className="grid gap-2">
                <Label htmlFor="title">Kurs nomi</Label>
                <Input id="title" placeholder="Kurs nomini kiriting" className={`${style.inputSearch}`} />
              </div>
              <div className="grid gap-2">
                <Label>O'qituvchi</Label>
                <Popover open={openTeacher} onOpenChange={setOpenTeacher}>
                  <PopoverTrigger asChild>
                    <Button variant="outline" role="combobox" aria-expanded={openTeacher} className="justify-between">
                      {valueTeacher
                        ? teachers.find((teacher) => teacher.value === valueTeacher)?.label
                        : "O'qituvchini tanlang..."}
                      <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className="w-[300px] p-0">
                    <Command>
                      <CommandInput placeholder="O'qituvchi qidirish..." />
                      <CommandList>
                        <CommandEmpty>O'qituvchi topilmadi.</CommandEmpty>
                        <CommandGroup>
                          {teachers.map((teacher) => (
                            <CommandItem
                              key={teacher.value}
                              value={teacher.value}
                              onSelect={(currentValue) => {
                                setValueTeacher(currentValue === valueTeacher ? "" : currentValue)
                                setOpenTeacher(false)
                              }}
                            >
                              <Check
                                className={cn("mr-2 h-4 w-4", valueTeacher === teacher.value ? "opacity-100" : "opacity-0")}
                              />
                              {teacher.label}
                            </CommandItem>
                          ))}
                        </CommandGroup>
                      </CommandList>
                    </Command>
                  </PopoverContent>
                </Popover>
              </div>
              <div className="grid gap-2">
                <Label htmlFor="price">Narxi</Label>
                <Input id="price" placeholder="Narxini kiriting" type="number" className={`${style.inputSearch}`} />
              </div>
              <div className="grid gap-2">
                <Label>Dars kunlari</Label>
                <div className="flex flex-wrap gap-2">
                  {weekDays.map((day) => (
                    <div key={day.id} className="flex items-center space-x-2">
                      <Checkbox id={day.id} />
                      <Label htmlFor={day.id}>{day.label}</Label>
                    </div>
                  ))}
                </div>
              </div>
              <div className="grid gap-2">
                <Label>Dars vaqti</Label>
                <div className="flex gap-2">
                  <Input type="time" className={`${style.inputSearch}`} placeholder="Boshlanish vaqti" />
                  <Input type="time" className={`${style.inputSearch}`} placeholder="Tugash vaqti" />
                </div>
              </div>
              <div className="grid gap-2">
                <Label>Xona</Label>
                <Popover open={openRoom} onOpenChange={setOpenRoom}>
                  <PopoverTrigger asChild>
                    <Button variant="outline" role="combobox" aria-expanded={openRoom} className="justify-between">
                      {valueRoom ? rooms.find((room) => room.value === valueRoom)?.label : "Xonani tanlang..."}
                      <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className="w-[300px] p-0">
                    <Command>
                      <CommandInput placeholder="Xona qidirish..." />
                      <CommandList>
                        <CommandEmpty>Xona topilmadi.</CommandEmpty>
                        <CommandGroup>
                          {rooms.map((room) => (
                            <CommandItem
                              key={room.value}
                              value={room.value}
                              onSelect={(currentValue) => {
                                setValueRoom(currentValue === valueRoom ? "" : currentValue)
                                setOpenRoom(false)
                              }}
                            >
                              <Check
                                className={cn("mr-2 h-4 w-4", valueRoom === room.value ? "opacity-100" : "opacity-0")}
                              />
                              {room.label}
                            </CommandItem>
                          ))}
                        </CommandGroup>
                      </CommandList>
                    </Command>
                  </PopoverContent>
                </Popover>
              </div>
              <Button type="submit" className="mt-2">
                Saqlash
              </Button>
            </form>
          </SheetContent>
        </Sheet>
      </div>
    </>
  );
}

export default Groups;
