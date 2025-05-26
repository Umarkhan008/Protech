import { initializeApp } from "https://www.gstatic.com/firebasejs/11.0.2/firebase-app.js";
import { getAnalytics } from "https://www.gstatic.com/firebasejs/11.0.2/firebase-analytics.js";
import {
    getDatabase,
    ref,
    onValue,
    set,
} from "https://www.gstatic.com/firebasejs/11.0.2/firebase-database.js";
import { useEffect, useState } from "react";
import React from "react";
import { SidebarPanel } from "../../Sidebar";
import style from './Course.module.css';
import { Card, CardContent, CardHeader, CardTitle } from "../../components/ui/card";
import { Button } from "../../components/ui/button";
import { FaPlus } from "react-icons/fa";
import { useNavigate } from "react-router-dom";
import CardBg1 from "./Images/ChatGPT Image Apr 7, 2025, 02_01_46 PM.png";
import { Sidebar, SidebarContent, SidebarHeader, SidebarProvider } from "../../components/ui/sidebar";
import { X } from "lucide-react";
import { Label } from "../../components/ui/label";
// import { Button } from "../../components/ui/button";
import { Input } from "../../components/ui/input";
import SelectReact from "react-select";
import { Textarea } from "../../components/ui/textarea";



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

const Course = () => {
    const navigate = useNavigate();
    const [CourseData, setCourseData] = useState([]);
    const [isOpen, setIsOpen] = useState(false);
    const [addCourse, setaddCourse] = useState({
        name: "",
        price: "",
        duration: "",
        month: "",
        notes: "",
    });
    const durationOptions = [30, 60, 90, 120, 150]; // Dars davomiyligi uchun variantlar

    useEffect(() => {
        const courseRef = ref(database, 'Courses');
        onValue(courseRef, (snapshot) => {
            const data = snapshot.val();
            const courseArray = Object.values(data || {});
            setCourseData(courseArray);
        });
    }, []);

    const toggleSidebar = () => {
        setIsOpen(!isOpen);
    };

    const handleCardClick = (id) => {
        navigate(`/course/${id}`);
    };2

    const handleAddGroup = (e) => {
        e.preventDefault();
        if (!addCourse.name || !addCourse.price || !addCourse.duration || !addCourse.month) {
            alert("Barcha maydonlarni to'ldiring!");
            return;
        }

        set(ref(database, `Courses/${addCourse.name}`), {
            id: CourseData.length + 1,
            name: addCourse.name,
            price: addCourse.price,
            duration: addCourse.duration,
            notes: addCourse.notes,
            month: addCourse.month
        })
            .then(() => {
                toggleSidebar();
                setaddCourse({
                    name: "",
                    price: "",
                    duration: "",
                    month: "",
                    notes: "",
                });
            })
            .catch((error) => {
                console.error("Xatolik yuz berdi:", error);
            });

    }

    return (
        <>
            <SidebarProvider>
                {isOpen && (
                    <div
                        className="fixed w-full h-[100vh] bg-black/50 z-30 inset-0 transition-all backdrop-blur-[2px] duration-900 ease-in-out"
                        onClick={toggleSidebar}
                    ></div>
                )}
                <Sidebar
                    className={`fixed inset-y-0 right-0 z-50 w-[400px] border-l border-gray-300 bg-white transition-transform duration-300 ease-in-out ${isOpen ? "translate-x-0" : "translate-x-full"
                        }`}
                    side="right"
                    collapsible="none"
                >
                    <SidebarHeader className="flex items-center justify-between border border-gray-300 p-4">
                        <h2 className="text-lg font-normal">Kurs qo'shish</h2>
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
                        <form className="space-y-6 p-6 text-left">
                            <div className="flex flex-col gap-3">
                                <Label htmlFor="courseSelect" className="text-xs text-gray-500">Ism</Label>
                                <Input
                                    id="courseSelect"
                                    type="text"
                                    placeholder="Kurs nomi"
                                    className={`${style.inputSearch}`}
                                    onChange={(e) =>
                                        setaddCourse((prevState) => ({
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
                                    onChange={(e) =>
                                        setaddCourse((prevState) => ({
                                            ...prevState,
                                            price: e.target.value.replace(/\s+/g, ""),
                                        }))
                                    }
                                />
                            </div>
                            <div className="flex flex-col gap-3">
                                <Label htmlFor="courseDuration" className="text-xs text-gray-500">Dars davomiyligi</Label>
                                <SelectReact
                                    id="courseDuration"
                                    onChange={(selectedOption) =>
                                        setaddCourse((prevState) => ({
                                            ...prevState,
                                            duration: selectedOption.value,
                                        }))
                                    }
                                    options={durationOptions.map((duration) => ({
                                        value: duration,
                                        label: `${duration} daqiqa`,
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
                                <Label htmlFor="courseMonth" className="text-xs text-gray-500">Kurs necha oy davom etadi</Label>
                                <Input
                                    id="courseMonth"
                                    type="text"
                                    placeholder="Kurs davomiyligi"
                                    className={`${style.inputSearch}`}
                                    onChange={(e) =>
                                        setaddCourse((prevState) => ({
                                            ...prevState,
                                            month: e.target.value,
                                        }))
                                    }
                                />
                            </div>
                            <div className="flex flex-col gap-3">
                                <Label htmlFor="courseNotes" className="text-xs text-gray-500">Izoh</Label>
                                <Textarea
                                    id="courseNotes"
                                    className="outline-none border border-gray-300 rounded-md p-2 text-sm w-full h-32"
                                    onChange={(e) =>
                                        setaddCourse((prevState) => ({
                                            ...prevState,
                                            notes: e.target.value,
                                        }))
                                    }
                                />
                            </div>
                            <Button
                                className="bg-blue-950 hover:opacity-80 text-white"
                                onClick={(e) => handleAddGroup(e)}
                            >
                                Qo'shish
                            </Button>
                        </form>
                    </SidebarContent>
                </Sidebar>
            </SidebarProvider>

            <div className="Course">
                <SidebarPanel />

                <div
                    className={style.course}
                    style={{
                        marginLeft: "var(--sidebar-width, 250px)",
                        width: "var(--sidebar-width), 100%",
                        transition: "all 0.5s ease, background 0.3s ease, width 0.5s ease",
                    }}
                >
                    <nav className="flex justify-between pt-8 items-center p-6 rounded-lg">
                        <h2 className="text-3xl font-normal">Kurslar</h2>
                        <Button className="bg-blue-950 flex gap-1 text-white" onClick={toggleSidebar}>
                            Yangi kurs qo'shish
                            <FaPlus />
                        </Button>
                    </nav>
                    {
                        CourseData.length > 0 ? (
                            <div className="grid gap-4 md:grid-cols-2 p-8 lg:grid-cols-4">
                                {
                                    CourseData.map((course, index) => (
                                        <Card
                                            key={index}
                                            className="flex flex-col gap-5 cursor-pointer"
                                            onClick={() => { handleCardClick(course.id) }}
                                        >
                                            <CardHeader style={{ background: `center/cover url(${CardBg1})` }} className="w-full h-50">
                                                <h3 className="text-lg font-semibold text-center">
                                                    {course.name.toUpperCase()}
                                                </h3>
                                            </CardHeader>
                                            <CardContent className="flex flex-col gap-2 items-start">
                                                <h4 className="text-base font-semibold">
                                                    {course.name.charAt(0).toUpperCase() + course.name.slice(1)}
                                                </h4>
                                                <h5 className="text-sm font-normal text-gray-500">
                                                    {course.price} UZS
                                                </h5>
                                            </CardContent>
                                        </Card>
                                    ))
                                }
                            </div>
                        ) : (
                            <div className="flex justify-center items-center w-full h-full">
                                <h2 className="text-lg font-normal">Kurslar mavjud emas</h2>
                            </div>
                        )
                    }
                </div>
            </div >
        </>
    )
}

export default Course;