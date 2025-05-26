"use client"

import { useEffect, useState } from "react"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "../components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "../components/ui/tabs"
import { Button } from "../components/ui/button"
import { Input } from "../components/ui/input"
import { Label } from "../components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "../components/ui/select"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "../components/ui/table"
import { Badge } from "../components/ui/badge"
import { Pie, PieChart, ResponsiveContainer, Cell, Legend, Tooltip } from "recharts"
import { UserPlus, Users, Trash2, X, UserCheck } from "lucide-react"
import SelectReact from "react-select"
import { PiArrowUDownLeftBold } from "react-icons/pi";
import { FaChevronDown, FaChevronRight } from "react-icons/fa"
import { AddNotify, DelateNotify } from "../components/ui/Toast"

import {
  Sidebar,
  SidebarContent,
  SidebarHeader,
  SidebarProvider,
} from "../components/ui/sidebar";

import { initializeApp } from "https://www.gstatic.com/firebasejs/11.0.2/firebase-app.js";
import {
  getDatabase,
  ref,
  set,
  onValue,
  remove,
  get,
  update
} from "https://www.gstatic.com/firebasejs/11.0.2/firebase-database.js";
import { Modal } from "../components/ui/modal"
import { useNavigate } from "react-router-dom"
import { ToastContainer } from "react-toastify"

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

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const database = getDatabase(app);

const StatusColors = {
  Oqiyabdi: "bg-[#2F871C]",
  Kelmadi: "bg-[#8B0B0B]",
  Kutyabdi: "bg-[#FFBB28]",
  KelibKetdi: "bg-[#717171]"
}

const Status = ["O'qiyabdi", "Kelmadi", "Kutyabdi", "Kelib ketdi"]

const SourceCOLORS = ["#0088FE", "#CE7878", "#7cbefb", "#FFBB28", "#00C49F", "#FF8042", "#2F871C"]
const statusColors = ["#2F871C", "#8B0B0B", "#FFBB28", "#717171"]

const getCurrentMonth = () => {
  const now = new Date();
  return now.toLocaleString("en-US", { month: "long", year: "numeric" }); // Masalan: "April 2025"
};

const countWeekdaysInMonth = (selectedDays, startDate) => {
  const year = startDate.getFullYear();
  const month = startDate.getMonth();
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

    for (const [key, value] of Object.entries(dayMapping)) {
      if (selectedDays.includes(key) && weekday === value) {
        count[key]++;
      }
    }
  }

  return count;
};

const countWeekdaysToEndOfMonth = (selectedDays, startDate) => {
  const year = startDate.getFullYear();
  const month = startDate.getMonth();
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

  for (let day = startDate.getDate(); day <= lastDay; day++) {
    const date = new Date(year, month, day);
    const weekday = date.getDay();

    for (const [key, value] of Object.entries(dayMapping)) {
      if (selectedDays.includes(key) && weekday === value) {
        count[key]++;
      }
    }
  }

  return count;
};

export default function LeadsPage() {
  const navigate = useNavigate()
  const [leads, setLeads] = useState([])
  const [Students, setStudents] = useState([])
  const [GroupData, setGroupData] = useState([]);
  const [teachersData, setTeachersData] = useState([]);
  const [GetCourse, setGetCourse] = useState([])
  const [roomsData, setRoomsData] = useState([]);
  const [currentMonth, setCurrentMonth] = useState(getCurrentMonth())
  const [newUser, setnewUser] = useState({})
  const [selectedOptions, setSelectedOptions] = useState([]);
  const [openModal, setopenModal] = useState(false)
  const [firstInformation, setfirstInformation] = useState({})
  const [isOpen, setIsOpen] = useState(false);
  const [open, setOpen] = useState(false);
  const [openDelateModal, setopenDelateModal] = useState(false)
  const [delateLead, setdelateLead] = useState("")
  const [OpenChengeStatus, setOpenChengeStatus] = useState(null)
  const [OpenChengeCourse, setOpenChengeCourse] = useState(null)

  const [tabs, setTabs] = useState("add")

  // read leads from firebase
  useEffect(() => {
    const takeLeads = ref(database, "leads")

    onValue(takeLeads, (snapshot) => {
      const leads = snapshot.val()

      const formattedLeads = leads ? Object.values(leads) : [];
      setLeads(formattedLeads);
    })
  }, [])

  // read students from firebase
  useEffect(() => {
    const takeStudents = ref(database, "Students")

    onValue(takeStudents, (snapshot) => {
      const students = snapshot.val()
      const formattedStudents = students ? Object.values(students) : [];

      setStudents(formattedStudents)
    })
  }, [])

  // read groups from firebase
  useEffect(() => {
    const coursesRef = ref(database, "Groups");

    onValue(coursesRef, (snapshot) => {
      const data = snapshot.val();

      const groupArray = data ? Object.values(data) : [];

      setGroupData(groupArray);
    });
  }, []);

  // read teachers from firebase
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

  // read rooms from firebase
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

    const CourseRef = ref(database, "Courses")
    onValue(CourseRef, (snapshot) => {
      const data = snapshot.val()
      setGetCourse(Object.values(data || {}))
    })
  }, []);

  useEffect(() => {
    const interval = setInterval(() => {
      const today = new Date();
      const dayOfWeek = today.toLocaleDateString("uz-UZ", { weekday: "short" }).toLowerCase();

      const studentsRef = ref(database, `Students`);
      get(studentsRef)
        .then((snapshot) => {
          if (snapshot.exists()) {
            const studentsData = snapshot.val();

            // Har bir o'quvchini tekshirish
            Object.entries(studentsData).forEach(([studentName, studentData]) => {
              if (studentData.status === "Faol") {
                const currentBalance = studentData.balance || 0;
                const perLessonCost = studentData.perLessonCost || 0;
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
                      const selectedDays = groupData.selectedDays || [];

                      // Agar bugungi kun dars kuni bo'lsa
                      if (selectedDays.includes(dayOfWeek)) {
                        const updatedBalance = currentBalance - perLessonCost;

                        console.log(
                          `Daily deduction for ${studentName}: ${perLessonCost}`
                        );
                        console.log(
                          `Updated Balance for ${studentName}: ${updatedBalance}`
                        );

                        // Firebase-ni yangilash
                        const studentRef = ref(database, `Students/${studentName}`);
                        update(studentRef, { balance: updatedBalance })
                          .then(() => {
                            console.log(
                              `Balance updated for ${studentName} for today's lesson.`
                            );
                          })
                          .catch((error) => {
                            console.error(
                              `Error updating balance for ${studentName}:`,
                              error
                            );
                          });
                      }
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
    }, 1000 * 60 * 60 * 24); // Har kuni tekshirish

    return () => clearInterval(interval); // Komponent unmount bo'lganda intervalni tozalash
  }, []);

  // state to store new lead data 
  const [newLead, setNewLead] = useState({
    name: "",
    phone: "",
    status: "Kutyabdi",
    source: "",
    course: "",
    time: "",
    notes: "",
  })

  const [filterStatus, setFilterStatus] = useState("all")

  const handleNotesChange = (e) => {
    const { value } = e.target
    setNewLead({ ...newLead, notes: value })
  }

  const handleNameChange = (e) => {
    const { value } = e.target
    setNewLead({ ...newLead, name: value })
  }

  const handlePhoneChange = (e) => {
    let value = e.target.value.replace(/\D/g, ""); // Harflar va boshqa belgilarni olib tashlaymiz

    if (!value.startsWith("998 ")) {
      value = "998 " + value.replace(/^998+/, "");
    }

    value = value.slice(0, 13); // Maksimal uzunlik 12 ta raqam bo‘lishi kerak

    let formattedNumber = `+${value}`; // Har doim `+998` ko‘rinishda bo‘lsin

    setNewLead({ ...newLead, phone: formattedNumber });
  };

  const handleSourceChange = (value) => {
    setNewLead({ ...newLead, source: value })
  }

  const handleCourseChange = (value) => {
    setNewLead({ ...newLead, course: value })
  }

  const handleTimeChange = (value) => {
    setNewLead({ ...newLead, time: value })
  }

  const handleSubmit = (e) => {
    e.preventDefault()

    if ((newLead.name && newLead.phone && newLead.source && newLead.course && newLead.time) === "") {
      alert("Iltimos barcha maydonlarni to'ldiring")
      return
    }

    const id = leads.length + 1
    const date = new Date().toISOString().split("T")[0]

    // push lead to firebase
    set(ref(database, `leads/${newLead.name}`), {
      id: id,
      name: newLead.name,
      phone: newLead.phone,
      status: newLead.status,
      source: newLead.source,
      course: newLead.course,
      notes: newLead.notes,
      time: newLead.time,
      date: date
    })
      .then(() => {
        AddNotify()
        setNewLead({ name: "", phone: "", status: "Kutyabdi", time: "", notes: "" })
      })
  }


  const filteredLeads = filterStatus === "all" ? leads : leads.filter((lead) => lead.status === filterStatus)

  // delate leads
  const handleDeleteLead = (name) => {

    const leadRef = ref(database, `leads/${name}`);

    remove(leadRef)
      .then(() => {
        setopenDelateModal(false)
      })
      .catch((error) => {
        console.error(error)
      })
  }

  // add to group
  const handleAddToGroup = () => {
    if (!selectedOptions.groups?.label) {
      alert("Iltimos, guruhni tanlang!");
      return;
    }
    const date = new Date().toISOString().split("T")[0]; // Qo'shilgan sana
    const today = new Date(); // Bugungi sana

    // Guruh ma'lumotlarini olish
    const groupRef = ref(database, `Groups/${selectedOptions.groups.label}`);
    get(groupRef)
      .then((groupSnapshot) => {
        if (groupSnapshot.exists()) {
          const groupData = groupSnapshot.val();
          const courseFee = groupData.price || 0; // Guruh narxi
          const selectedDays = groupData.selectedDays || []; // Guruh dars kunlari

          // Oy oxirigacha bo'lgan dars kunlarini hisoblash
          const remainingLessonDays = countWeekdaysToEndOfMonth(selectedDays, today);
          const remainingLessonDaysCount = Object.values(remainingLessonDays).reduce(
            (sum, count) => sum + count,
            0
          );

          // Har bir dars uchun narxni hisoblash
          const totalLessonDays = countWeekdaysInMonth(selectedDays, today);
          const totalLessonDaysCount = Object.values(totalLessonDays).reduce(
            (sum, count) => sum + count,
            0
          );
          const perLessonCost = courseFee / totalLessonDaysCount;

          // Qolgan dars kunlari uchun umumiy to'lovni hisoblash
          const totalDeduction = Math.round(perLessonCost * remainingLessonDaysCount);

          // Studentni Firebase-ga qo'shish
          set(ref(database, `Students/${newUser.name}`), {
            attendance: {
              [currentMonth]: {
                _empty: true,
              },
            },
            id: Students.length + 1
            ,
            balance: 0, // Boshlang'ich balansni 0 qilib qo'yamiz
            group: selectedOptions.groups.label,
            studentName: newUser.name,
            studentNumber: newUser.phone,
            status: "Faol",
            addedDate: date, // Qo'shilgan sana
            perLessonCost, // Har bir dars uchun narxni saqlaymiz
            remainingLessonDaysCount, // Qolgan dars kunlari soni
            studentHistory: [
              {
                date: newUser.date, // newUserning sanasi
                title: "Ro'yxatdan o'tdi",
                description: `${newUser.name} ${selectedOptions.groups.label} guruhiga qo'shildi.`,
              },
            ],
            paymentHistory: []
          })
            .then(() => {
              handleDeleteLead(newUser.name)
              setIsOpen(false)
              AddNotify()
            })
            .catch((error) => {
              console.error(error)
            })


          // Leadni Firebase-dan o'chirish
        }
        else {
          console.error("Group data not found in Firebase.");
        }
      })
      .catch((error) => {
        console.error("Error fetching group data:", error);
      });
  };

  const handleSelectChange = (selectedOption, actionMeta) => {
    setSelectedOptions((prevState) => ({
      ...prevState,
      [actionMeta.name]: selectedOption, // To'liq obyektni saqlaymiz
    }));
  };

  const toggleSidebar = (id) => {
    setIsOpen(!isOpen);
    const newUser = leads.find(user => user.id === id)

    setnewUser(newUser)
  };

  const OpenModal = (id) => {
    const FindStudents = leads.find(firstStudent => firstStudent.id === id)
    setfirstInformation(FindStudents)
    setopenModal(true)
  }

  const CloseModal = () => setopenModal(false)
  const closeDelateModal = () => setopenDelateModal(false)

  const sourceKochadan = leads.filter((leads) => leads.source === "Ko'chadan")
  const sourceInstagram = leads.filter((leads) => leads.source === "Instagram")
  const sourceTelegram = leads.filter((leads) => leads.source === "Telegram")
  const sourceShtender = leads.filter((leads) => leads.source === "Shtender")
  const sourceTanish = leads.filter((leads) => leads.source === "Tanish")
  const sourceTavsiya = leads.filter((leads) => leads.source === "Tavsiya")
  const sourceReklama = leads.filter((leads) => leads.source === "Reklama")

  // source data for pie chart
  const sourceData = [
    { name: "Ko'chadan", value: sourceKochadan.length },
    { name: "Instagram", value: sourceInstagram.length },
    { name: "Telegram", value: sourceTelegram.length },
    { name: "Shtender", value: sourceShtender.length },
    { name: "Tanish", value: sourceTanish.length },
    { name: "Tavsiya", value: sourceTavsiya.length },
    { name: "Reklama", value: sourceReklama.length },
  ]

  const statusOqimoqda = leads.filter((lead) => lead.status === "O'qiyabdi")
  const statusKelmadi = leads.filter((lead) => lead.status === "Kelmadi")
  const statusKutyabdi = leads.filter((lead) => lead.status === "Kutyabdi")
  const statusQaytdi = leads.filter((lead) => lead.status === "Kelib ketdi")

  // status data for pie chart
  const statusData = [
    { name: "O'qiyabdi", value: statusOqimoqda.length },
    { name: "Kelmadi", value: statusKelmadi.length },
    { name: "Kutyabdi", value: statusKutyabdi.length },
    { name: "Kelib ketdi", value: statusQaytdi.length },
  ]

  const toggleDelateLead = (name) => {
    setopenDelateModal(true)
    setdelateLead(name)
  }

  const handleChengeStatus = (status, name) => {
    const chengeLead = ref(database, `leads/${name}/status`)

    set(chengeLead, status)
      .then(() => {
        console.log("secses")
      })
      .catch((error) => {
        console.error(error)
      })
  }

  const handleChengeCourse = (course, name) => {
    const chengeLead = ref(database, `leads/${name}/course`)

    set(chengeLead, course)
      .then(() => {
        console.log("secses")
      })
      .catch((error) => {
        console.error(error)
      })
  }


  return (
    <>
      {openModal ? <Modal
        isOpen={openModal}
        onClose={CloseModal}
        positionTop={"top-[20%]"}
        title={`${firstInformation.name}ning ma'lmotlari`}
        children={
          <div className="flex flex-col space-y-2">
            <h3 className="text-md font-semibold">
              ID: {firstInformation.id}
            </h3>
            <h4 className="text-md font-semibold">
              Ismi: {firstInformation.name}
            </h4>
            <h4 className="text-md font-semibold">
              Telefon raqami: {firstInformation.phone}
            </h4>
            <h4 className="text-md font-semibold">
              Qaysi soha: {firstInformation.course}
            </h4>
            <h4 className="text-md font-semibold">
              Bizni qanday topdi: {firstInformation.source}
            </h4>
            <h4 className="text-md font-semibold">
              Statusi: {firstInformation.status}
            </h4>
            <h4 className="text-md font-semibold">
              Qachon royhatga olingan: {firstInformation.date}
            </h4>
            <h4 className="text-md font-semibold">
              Qaysi payt: {firstInformation.time}
            </h4>
            <h4 className="text-md font-semibold">
              Bu yerga kelishiga nima sabab: {firstInformation.notes}
            </h4>
          </div>
        }
      /> : ""}

      {
        openDelateModal ? <Modal
          isOpen={openDelateModal}
          onClose={closeDelateModal}
          positionTop={"top-[40%]"}
          title={"Bu lead ni rostanham o'chirilsinmi?"}
          children={
            <div className="flex justify-center items-center gap-5">
              <Button className="px-7 text-lg" variant="red" onClick={() => { handleDeleteLead(delateLead), DelateNotify() }}>Ha</Button>
              <Button className="px-7 text-lg" variant="outline" onClick={() => setopenDelateModal(false)}>Yo'q</Button>
            </div>
          }
        /> : ""
      }

      <ToastContainer />

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
          className={`fixed inset-y-0 right-0 z-50 w-[400px] border-l border-gray-300 bg-white transition-transform duration-300 ease-in-out
            ${isOpen ? "translate-x-0" : "translate-x-full"}`}
          side="right"
          collapsible="none"
        >
          <SidebarHeader className="flex  items-center justify-between border border-gray-300 p-4">
            <h2 className="text-xl font-semibold">Guruhga qo'shish</h2>
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
              <div className="space-y-2">
                <Label htmlFor="courseSelect">Guruh tanlash</Label>
                <SelectReact
                  value={selectedOptions.groups} // Bu obyekt bo'lishi kerak: { label, value }
                  onChange={(selectedOption) =>
                    handleSelectChange(selectedOption, { name: "groups" })
                  }
                  options={GroupData.map((group) => ({
                    label: group.groupName,
                    value: group.id, // value qo'shildi
                  }))}
                />
              </div>

              <Button
                className="w-full bg-black hover:opacity-80 text-white"
                onClick={(event) => {
                  event.preventDefault(); // Prevent form submission
                  setOpen(false);
                  toggleSidebar();
                  handleAddToGroup();
                }}
              >
                <UserPlus className="w-4 h-4 mr-2" />
                Qo'shish
              </Button>
            </form>
          </SidebarContent>
        </Sidebar>
      </SidebarProvider>

      <div className={`container mx-auto p-4 space-y-8`}>
        <div className="icon flex flex-col gap-2">
          <div
            className="cursor-pointer w-[30px] h-[30px] rounded-full hover:bg-gray-200 flex justify-center items-center"
            onClick={() => navigate("/panel")}
          >
            <PiArrowUDownLeftBold className="text-lg" />
          </div>
          <h1 className="text-3xl font-bold mb-4">Lidlar boshqaruvi</h1>
        </div>

        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium">Jami Lidlar</CardTitle>
              <Users className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{leads.length}</div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="pt-5">
              <h3 className="text-2xl font-medium">
                Lidlar holati
              </h3>
              {statusData.every((data) => data.value === 0) ? ( // Agar barcha value 0 bo'lsa
                <div className="text-lg text-center text-gray-500">Ma'lumot yo'q</div>
              ) : (
                <ResponsiveContainer width="100%" height={220}>
                  <PieChart>
                    <Pie
                      data={statusData}
                      cx="50%"
                      cy="50%"
                      labelLine={false}
                      outerRadius={80}
                      fill="#8884d8"
                      dataKey="value"
                    >
                      {statusData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={statusColors[index % statusColors.length]} />
                      ))}
                    </Pie>
                    <Legend />
                    <Tooltip />
                  </PieChart>
                </ResponsiveContainer>
              )}
            </CardContent>
          </Card>
          <Card>
            <CardHeader>
              <CardTitle>Lidlar manbasi</CardTitle>
            </CardHeader>
            <CardContent>
              {sourceData.every((data) => data.value === 0) ? ( // Agar barcha value 0 bo'lsa
                <div className="text-lg text-center text-gray-500">Ma'lumot yo'q</div>
              ) : (
                <ResponsiveContainer width="100%" height={220}>
                  <PieChart>
                    <Pie
                      data={sourceData}
                      cx="50%"
                      cy="50%"
                      labelLine={false}
                      outerRadius={80}
                      fill="#8884d8"
                      dataKey="value"
                    >
                      {sourceData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={SourceCOLORS[index % SourceCOLORS.length]} />
                      ))}
                    </Pie>
                    <Legend />
                    <Tooltip />
                  </PieChart>
                </ResponsiveContainer>
              )}
            </CardContent>
          </Card>
        </div>

        <Tabs
          defaultValue="add"
          value={tabs}
          onValueChange={(value) => setTabs(value)}
          className="w-full"
        >
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger
              className={`${tabs === "add"
                ? "bg-black text-white rounded-md h-full flex items-center justify-center"
                : "h-full flex items-center justify-center"
                }`}
              value="add"
            >
              Yangi lid qo'shish
            </TabsTrigger>
            <TabsTrigger
              className={`${tabs === "list"
                ? "bg-black text-white rounded-md h-full flex items-center justify-center"
                : "h-full flex items-center justify-center"
                }`}
              value="list"
            >
              Lidlar ro'yxati
            </TabsTrigger>
          </TabsList>
          <TabsContent value="list" onClick={() => setOpenChengeStatus(false)}>
            <Card>
              <CardHeader>
                <CardTitle>Lidlar ro'yxati</CardTitle>
                <CardDescription>Barcha lidlar va ularning ma'lumotlari</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="flex justify-end mb-4">
                  <Select onValueChange={setFilterStatus} defaultValue={filterStatus}>
                    <SelectTrigger className="w-[180px]">
                      <SelectValue placeholder="Status bo'yicha filtrlash" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">Barchasi</SelectItem>
                      {statusData.map((status) => (
                        <SelectItem value={status.name}>
                          {status.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Ism</TableHead>
                      <TableHead>Telefon</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead>Manba</TableHead>
                      <TableHead>Kurs</TableHead>
                      <TableHead>Vaqt</TableHead>
                      <TableHead>Sana</TableHead>
                      <TableHead>Amallar</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {filteredLeads.map((lead, index) => (
                      <TableRow key={lead.id} onClick={() => { OpenModal(lead.id), setOpenChengeStatus(false), setOpenChengeCourse(null) }}>
                        <TableCell className="font-medium">{lead.name}</TableCell>
                        <TableCell>{lead.phone}</TableCell>
                        <TableCell className="relative" onClick={(e) => { e.stopPropagation(), setOpenChengeStatus(false) }}>
                          <Badge
                            variant="outline"
                            className={`
                              ${lead.status === "Kelib ketdi" ?
                                StatusColors["KelibKetdi"] :
                                lead.status === "O'qiyabdi" ?
                                  StatusColors["Oqiyabdi"] : StatusColors[lead.status]}  cursor-pointer
                            `}
                            onClick={(event) => {
                              event.stopPropagation()
                              setOpenChengeStatus(OpenChengeStatus !== lead.id ? lead.id : null)
                            }}
                          >
                            {lead.status}
                            {
                              OpenChengeStatus === lead.id ? (
                                <div className="p-3 text-black bg-white flex flex-col gap-2 rounded-lg border border-gray-300 absolute z-10 top-[50px] left-[10px]">
                                  {
                                    Status.map((status) => (
                                      <h3
                                        className={`
                                      ${status === "O'qiyabdi" ?
                                            StatusColors.Oqiyabdi :
                                            status === "Kelib ketdi" ?
                                              StatusColors.KelibKetdi :
                                              StatusColors[status]}  rounded-md px-2 py-[2px] text-white cursor-pointer`}
                                        onClick={() => handleChengeStatus(status, lead.name)}
                                      >
                                        {status}
                                      </h3>
                                    ))
                                  }
                                </div>
                              ) : ""
                            }
                          </Badge>
                        </TableCell>
                        <TableCell>{lead.source}</TableCell>
                        <TableCell
                          onClick={(e) => (e.stopPropagation(), setOpenChengeCourse(OpenChengeCourse !== lead.id ? lead.id : null))}
                          className="relative"
                        >
                          <div className="flex items-center gap-1 p-[2px] pl-[5px] rounded-lg hover:bg-gray-200 cursor-pointer">
                            {lead.course}
                            {OpenChengeCourse !== lead.id ? <FaChevronDown /> : <FaChevronRight />}
                          </div>
                          {
                            OpenChengeCourse === lead.id ? (
                              <div className="p-3 text-black bg-white flex flex-col gap-2 rounded-lg border border-gray-300 absolute z-10 top-[50px] left-[10px]">
                                {
                                  GetCourse.map((course) => (
                                    <h3
                                      onClick={() => handleChengeCourse(course.name, lead.name)}
                                      className="rounded-md px-2 py-[2px] cursor-pointer hover:bg-gray-200"
                                    >
                                      {course.name}
                                    </h3>
                                  ))
                                }
                              </div>
                            ) : ""
                          }
                        </TableCell>
                        <TableCell>{lead.time}</TableCell>
                        <TableCell>{lead.date}</TableCell>
                        <TableCell>
                          <div className="flex space-x-2">
                            <Button
                              variant="secondary"
                              size="sm"
                              onClick={(event) => {
                                event.stopPropagation();
                                setopenModal(false);
                                setOpen(true);
                                toggleSidebar(lead.id);
                              }}
                            >
                              <UserCheck className="w-4 h-4 mr-2" />
                              Guruhga qo'shish
                            </Button>
                            <Button
                              size="sm"
                              variant="red"
                              onClick={(event) => {
                                event.stopPropagation();
                                toggleDelateLead(lead.name);
                              }}
                            >
                              <Trash2 className="w-4 h-4 mr-2" />
                              O'chirish
                            </Button>
                          </div>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </CardContent>
            </Card>
          </TabsContent>
          <TabsContent value="add">
            <Card>
              <CardHeader>
                <CardTitle>Yangi lid qo'shish</CardTitle>
                <CardDescription>Yangi lid ma'lumotlarini kiriting</CardDescription>
              </CardHeader>
              <CardContent>
                <form className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="name">Ism</Label>
                      <Input id="name" name="name" value={newLead.name} onChange={handleNameChange} required />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="phone">Telefon</Label>
                      <Input id="phone" name="phone" value={newLead.phone} placeholder="+998" onChange={handlePhoneChange} required />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="source">Manba</Label>
                      <Select onValueChange={handleSourceChange} defaultValue={newLead.source}>
                        <SelectTrigger>
                          <SelectValue placeholder="Manba tanlang" />
                        </SelectTrigger>
                        <SelectContent>
                          {
                            sourceData.map((value) => (
                              <SelectItem value={value.name}>
                                {value.name}
                              </SelectItem>
                            )
                            )
                          }
                        </SelectContent>
                      </Select>
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="course">Kurs</Label>
                      <Select onValueChange={handleCourseChange} defaultValue={newLead.course}>
                        <SelectTrigger>
                          <SelectValue placeholder="Kurs tanlang" />
                        </SelectTrigger>
                        <SelectContent>
                          {
                            GetCourse.map((item) => {
                              return (
                                <SelectItem key={item} value={item.name}>
                                  {item.name}
                                </SelectItem>
                              )
                            })
                          }
                        </SelectContent>
                      </Select>
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="time">Vaqt</Label>
                      <Select onValueChange={handleTimeChange} defaultValue={newLead.time}>
                        <SelectTrigger>
                          <SelectValue placeholder="Vaqt tanlang" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="Abetdan oldin (DCHJ)">Abetdan oldin (DCHJ)</SelectItem>
                          <SelectItem value="Abetdan oldin (SPSH)">Abetdan oldin (SPSH)</SelectItem>
                          <hr />
                          <SelectItem value="Abetdan keyin (DCHJ)">Abetdan keyin (DCHJ)</SelectItem>
                          <SelectItem value="Abetdan keyin (SPSH)">Abetdan keyin (SPSH)</SelectItem>
                          <hr />
                          <SelectItem value="Har qanday">Har qanday</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="notes">Izoh</Label>
                      <Input id="notes" name="notes" value={newLead.notes} placeholder="Ma'lumot (ixtiyoriy)" onChange={handleNotesChange} />
                    </div>
                  </div>
                  <Button onClick={handleSubmit} className="w-full">
                    <UserPlus className="w-4 h-4 mr-2" />
                    Yangi lid qo'shish
                  </Button>
                </form>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div >
    </>
  )
}

