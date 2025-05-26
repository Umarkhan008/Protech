import { initializeApp } from "https://www.gstatic.com/firebasejs/11.0.2/firebase-app.js";
import { getAnalytics } from "https://www.gstatic.com/firebasejs/11.0.2/firebase-analytics.js";
import { getDatabase, ref, onValue, set, remove } from "https://www.gstatic.com/firebasejs/11.0.2/firebase-database.js";
import { useState, useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { SidebarPanel } from "../../Sidebar";
import { Card, CardContent, CardHeader } from "../../components/ui/card";
import { GoPencil } from "react-icons/go";
import { MdDeleteOutline } from "react-icons/md";
import SelectReact from "react-select";
import style from "./Course.module.css";
import { Sidebar, SidebarContent, SidebarHeader, SidebarProvider } from "../../components/ui/sidebar";
import { UserPlus, X } from "lucide-react";
import { Label } from "../../components/ui/label";
import { Button } from "../../components/ui/button";
import { Input } from "../../components/ui/input";
import { Modal } from "../../components/ui/modal";

import CardBg1 from "./Images/ChatGPT Image Apr 7, 2025, 02_01_46 PM.png";
import { Textarea } from "../../components/ui/textarea";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "../../components/ui/tabs";

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

const durationOptions = [
    "30 daqiqa",
    "40 daqiqa",
    "60 daqiqa",
    "80 daqiqa",
    "90 daqiqa",
    "120 daqiqa",
    "150 daqiqa",
    "180 daqiqa",
    "240 daqiqa",
    "280 daqiqa",
    "300 daqiqa"
];

const CourseInfo = () => {
    const { id } = useParams();
    const navigate = useNavigate();
    const [takeCourses, setTakeCourse] = useState([]);
    const [firstCourse, setFirstCourse] = useState({});
    const [GroupData, setGroupData] = useState([]);
    const [FilterGroup, setFilterGroup] = useState([]);
    const [studentsData, setStudentsData] = useState([]);
    const [FilterStudent, setFilterStudent] = useState([]);
    const [selectedOptions, setSelectedOptions] = useState({ groups: null });
    const [isOpen, setIsOpen] = useState(false);
    const [open, setOpen] = useState(false);
    const [delateOpen1, setDelateOpen1] = useState(false);
    const [delateOpen2, setDelateOpen2] = useState(false);
    const [tabs, setTabs] = useState("groups");

    const [firstKey, setFirstKey] = useState("");

    const [chengeCourse, setchengeCourse] = useState({
        name: firstCourse.name,
        price: firstCourse.price,
        duration: firstCourse.duration,
        notes: "",
        month: firstCourse.month,
    });

    const [keys, setKeys] = useState({})

    useEffect(() => {
        const courseRef = ref(database, "Courses");
        onValue(courseRef, (snapshot) => {
            const data = snapshot.val();
            // console.log(Object.keys(data))
            setKeys(Object.keys(data));
            setTakeCourse(Object.values(data || {}));
        });

        const groupRef = ref(database, "Groups");
        onValue(groupRef, (snapshot) => {
            const data = snapshot.val();
            setGroupData(Object.values(data || {}));
        });

        const studentsRef = ref(database, "Students");
        onValue(studentsRef, (snapshot) => {
            const data = snapshot.val();
            setStudentsData(Object.values(data || {}));
        });

    }, []);

    useEffect(() => {
        if (keys.length > 0 && takeCourses.length > 0) {
            const foundKey = keys.find((key, index) => takeCourses[index]?.id?.toString() === id);
            if (foundKey) {
                setFirstKey(foundKey);
            } else {
                console.warn("Key topilmadi");
            }
        }
    }, [keys, takeCourses, id]);

    useEffect(() => {
        if (takeCourses.length > 0) {
            const foundCourse = takeCourses.find((course) => course.id.toString() === id);
            if (foundCourse) {
                setFirstCourse(foundCourse);
            } else {
                console.warn("Kurs topilmadi");
            }
        }
    }, [takeCourses, id]);

    useEffect(() => {
        if (firstCourse && firstCourse.name) {
            setchengeCourse({
                name: firstCourse.name,
                price: firstCourse.price,
                duration: firstCourse.duration,
                month: firstCourse.month
            });
        }
    }, [firstCourse]);

    const toggleSidebar = () => {
        setIsOpen(!isOpen);
        setOpen(!open);
    };

    const handleSubmit = (event) => {
        event.preventDefault();
        console.log("Form yuborildi");
    };

    const handleChengeToGroup = () => {
        if ((chengeCourse.name && chengeCourse.price && chengeCourse.duration && chengeCourse.month) === "") {
            alert("Barcha maydonlarni to'ldiring");
        }

        if (takeCourses.length > 0) {
            if (firstKey) {
                // Bu yerda `foundKey` bilan kerakli amallarni bajaring

                set(ref(database, `Courses/${firstKey}`), {
                    id: firstCourse.id,
                    name: chengeCourse.name,
                    price: chengeCourse.price,
                    duration: chengeCourse.duration,
                    notes: chengeCourse.notes,
                    month: chengeCourse.month,
                })
            } else {
                console.warn("Kurs topilmadi yoki key topilmadi");
            }
        }
        setOpen(false);
    };


    const handleOpenModal = (e) => {
        e.preventDefault();
        setDelateOpen1(true);
        setDelateOpen2(true);
    };

    const handleCloseModal = (e) => {
        e.preventDefault();
        setDelateOpen1(false);
        setDelateOpen2(false);
    };

    const handleDeleteCourse = () => {
        const leadRef = ref(database, `Courses/${firstKey}`);

        remove(leadRef)

        navigate("/course")
        handleCloseModal()

    }

    useEffect(() => {
        const newGroup = GroupData.filter((group) => group.courses === firstCourse.name);

        setFilterGroup(newGroup);
    }, [GroupData, firstCourse]);

    useEffect(() => {
        if (FilterGroup.length > 0 && studentsData.length > 0) {
            const allFilteredStudents = studentsData.filter(student =>
                FilterGroup.some(group => group.groupName === student.group)
            );

            setFilterStudent(allFilteredStudents);
        }
    }, [studentsData, FilterGroup]);

    return (
        <>
            {
                delateOpen1 ?
                    <Modal
                        onClose={(e) => {
                            e.preventDefault()
                            setDelateOpen1(false)
                        }}
                        title="Kursni o'chirish"
                        positionTop={"top-[40px]"}
                        isOpen={delateOpen2}
                        children={
                            <div className="flex justify-center gap-16">
                                <Button onClick={handleDeleteCourse} variant="red" className="rounded-3xl text-base px-8 py-5">Ha</Button>
                                <Button onClick={handleCloseModal} variant="outline" className="rounded-3xl text-base px-8 py-5">Yo'q</Button>
                            </div>
                        }
                    />
                    : ""
            }

            <SidebarProvider>
                {isOpen && (
                    <div        
                        className="fixed w-full h-[100vh] bg-black/50 backdrop-blur-[2px] z-30 inset-0 transition-all duration-900 ease-in-out"
                        onClick={toggleSidebar}
                    ></div>
                )}
                <Sidebar
                    className={`fixed inset-y-0 right-0 z-50 w-[400px] border-l border-gray-300 bg-white transition-transform duration-300 ease-in-out ${open ? "translate-x-0" : "translate-x-full"
                        }`}
                    side="right"
                    collapsible="none"
                >
                    <SidebarHeader className="flex items-center justify-between border border-gray-300 p-4">
                        <h2 className="text-lg font-normal">Kursni tahrirlash</h2>
                        <Button
                            variant="ghost"
                            size="icon"
                            onClick={toggleSidebar}
                            className="rounded-full hover:bg-gray-100"
                        >
                            <X className="h-5 w-5" />
                        </Button>
                    </SidebarHeader>

                    <SidebarContent>
                        <form onSubmit={handleSubmit} className="space-y-6 p-6 text-left">
                            <div className="flex flex-col gap-3">
                                <Label htmlFor="courseSelect" className="text-xs text-gray-500">Ism</Label>
                                <Input
                                    id="courseSelect"
                                    type="text"
                                    placeholder="Kurs nomi"
                                    className={`${style.inputSearch}`}
                                    value={chengeCourse.name || ""}
                                    onChange={(e) =>
                                        setchengeCourse((prevState) => ({
                                            ...prevState,
                                            name: e.target.value,
                                        }))
                                    }
                                />
                            </div>
                            <div className="flex flex-col gap-3">
                                <Label htmlFor="coursePrice" className="text-xs text-gray-500">Narx</Label>
                                <Input
                                    id="coursePrice"
                                    placeholder="Narxni kiriting"
                                    className={`${style.inputSearch}`}
                                    type="text"
                                    value={
                                        chengeCourse.price
                                            ? chengeCourse.price.toString().replace(/\B(?=(\d{3})+(?!\d))/g, " ")
                                            : ""
                                    }
                                    onChange={(e) =>
                                        setchengeCourse((prevState) => ({
                                            ...prevState,
                                            price: e.target.value.replace(/\s+/g, ""), // Bo'sh joylarni olib tashlash
                                        }))
                                    }
                                />
                            </div>
                            <div className="flex flex-col gap-3">
                                <Label htmlFor="courseDuration" className="text-xs text-gray-500">Dars davomiyligi</Label>
                                <SelectReact
                                    id="courseDuration"
                                    value={
                                        chengeCourse.duration
                                            ? { value: chengeCourse.duration, label: `${chengeCourse.duration}` }
                                            : null
                                    }
                                    onChange={(selectedOption) =>
                                        setchengeCourse((prevState) => ({
                                            ...prevState,
                                            duration: selectedOption.value + " daqiqa",
                                        }))
                                    }
                                    options={durationOptions.map((duration) => ({
                                        value: duration,
                                        label: `${duration}`,
                                    }))}
                                    placeholder="Davomiylikni tanlang"
                                    styles={{
                                        control: (base, state) => ({
                                            ...base,
                                            borderColor: state.isFocused ? "gray" : base.borderColor,
                                            boxShadow: state.isFocused ? "0 0 0 1px gray" : base.boxShadow,
                                            "&:hover": {
                                                borderColor: "gray",
                                            },
                                        }),
                                    }}
                                    className="focus:outline-none"
                                />
                            </div>
                            <div className="flex flex-col gap-3">
                                <Label htmlFor="courseMonth" className="text-xs text-gray-500">Kusr necha oy davom etadi</Label>
                                <Input
                                    id="courseMonth"
                                    type="text"
                                    placeholder="Kurs nomi"
                                    className={`${style.inputSearch}`}
                                    value={chengeCourse.month || ""}
                                    onChange={(e) =>
                                        setchengeCourse((prevState) => ({
                                            ...prevState,
                                            month: e.target.value,
                                        }))
                                    }
                                />
                            </div>
                            <div className="flex flex-col gap-3">
                                <Label htmlFor="courseNotes" className="text-xs text-gray-500">Izoh</Label>
                                <Textarea
                                    name=""
                                    id="courseNotes"
                                    className="outline-none border border-gray-300 rounded-md p-2 text-sm w-full h-32"
                                    value={chengeCourse.notes || ""}
                                    onChange={(e) =>
                                        setchengeCourse((prevState) => ({
                                            ...prevState,
                                            notes: e.target.value,
                                        }))
                                    }
                                ></Textarea>
                            </div>
                            <Button
                                className="bg-blue-950 hover:opacity-80 text-white"
                                onClick={(event) => {
                                    event.preventDefault();
                                    handleChengeToGroup();
                                }}
                            >
                                Saqlash
                            </Button>
                        </form>
                    </SidebarContent>
                </Sidebar>
            </SidebarProvider>

            <div className="CourseInfo">
                <SidebarPanel />

                <div
                    className={style.info}
                    style={{
                        marginLeft: "var(--sidebar-width, 250px)",
                        width: "var(--sidebar-width), 100%",
                        transition: "all 0.5s ease, background 0.3s ease, width 0.5s ease",
                    }}
                >
                    <h1 className={`${style.title} text-3xl font-simebolt`}>
                        {firstCourse && firstCourse.name
                            ? firstCourse.name.charAt(0).toUpperCase() + firstCourse.name.slice(1)
                            : "Yuklanmoqda..."}
                    </h1>
                    <div className={`${style.CardContainer} w-full flex justify-start gap-8`}>
                        <Card className={`${style.card} flex flex-col gap-5`}>
                            <CardHeader
                                style={{ background: `center/cover url(${CardBg1})` }}
                                className="w-full h-72"
                            >
                                <h3 className="text-xl font-semibold text-center">
                                    {firstCourse && firstCourse.name
                                        ? firstCourse.name.toUpperCase()
                                        : "Yuklanmoqda..."}
                                </h3>
                                <div className={`${style.icons}`}>
                                    <div
                                        className={`${style.icon}`}
                                        onClick={toggleSidebar}
                                    >
                                        <GoPencil />
                                    </div>
                                    <div
                                        className={`${style.icon}`}
                                        onClick={handleOpenModal}
                                    >
                                        <MdDeleteOutline />
                                    </div>
                                </div>
                            </CardHeader>
                            <CardContent className="flex flex-col gap-5 items-start">
                                <h6 className="text-sm/3 text-gray-400">Tavsif</h6>

                                <div className="flex flex-col gap-1">
                                    <span className="text-sm/3 text-gray-400">Narx</span>
                                    <h4>
                                        {firstCourse.price
                                            ? firstCourse.price
                                                .toString()
                                                .replace(/\B(?=(\d{3})+(?!\d))/g, " ") + " UZS"
                                            : "Noma'lum"}
                                    </h4>
                                </div>
                                <div className="">
                                    <span className="text-sm/3 text-gray-400">Talabalar</span>
                                    <h4>{FilterStudent.length}</h4>
                                </div>
                                <div className="">
                                    <span className="text-sm/3 text-gray-400">Dars davomiyligi</span>
                                    <h4>{firstCourse.duration ? firstCourse.duration + " daqiqa" : "Noma'lum"}</h4>
                                </div>
                            </CardContent>
                        </Card>

                        <Tabs
                            defaultValue="groups"
                            className="w-8/12"
                            value={tabs}
                            onValueChange={(value) => setTabs(value)}
                        >
                            <TabsList
                                className="w-full bg-transparent flex justify-start items-center border-b pb-0 rounded-none border-gray-300 gap-5"
                            >
                                <TabsTrigger
                                    onClick={() => setTabs("groups")}
                                    className={`${tabs === "groups" ? "border-b border-black text-black" : ""} ${style.tabs}`}
                                    value="groups"
                                >
                                    Guruhlar
                                </TabsTrigger>
                                <TabsTrigger
                                    onClick={() => setTabs("students")}
                                    className={`${tabs === "students" ? "border-b border-black text-black" : ""} ${style.tabs}`}
                                    value="students"
                                >
                                    Talabalar
                                </TabsTrigger>
                            </TabsList>
                            <TabsContent value="groups" className="pt-6">
                                {
                                    FilterGroup.length > 0 ? (
                                        <div className="flex flex-col gap-5">
                                            {FilterGroup.map((group, index) => (
                                                <div key={index} className="flex flex-col gap-2">
                                                    <h1 className="text-lg font-semibold">{group.groupName}</h1>
                                                    <p className="text-sm text-gray-500">{group.duration}</p>
                                                </div>
                                            ))}
                                        </div>
                                    ) : (
                                        <h1
                                            className="text-sm font-normal w-full py-3 px-5 bg-purple-300/70 text-gray-500"
                                        >
                                            Ushbu kursdan foydalanadigan guruhlar mavjud emas
                                        </h1>
                                    )
                                }
                            </TabsContent>
                            <TabsContent value="students" className="pt-6">
                                {
                                    FilterStudent.length > 0 ? (
                                        <div className="flex flex-col gap-5">
                                            {FilterStudent.map((student, index) => (
                                                <div key={index} className="flex flex-col gap-2">
                                                    <h1 className="text-lg font-semibold">{student.studentName}</h1>
                                                    <p className="text-sm text-gray-500">{student.group}</p>
                                                </div>
                                            ))}
                                        </div>
                                    ) : (
                                        <h1
                                            className="text-sm font-normal w-full py-3 px-5 bg-purple-300/70 text-gray-500"
                                        >
                                            Ushbu kursdan foydalanadigan talabalar mavjud emas
                                        </h1>
                                    )
                                }
                            </TabsContent>
                        </Tabs>
                    </div>
                </div>
            </div>
        </>
    );
};

export default CourseInfo;