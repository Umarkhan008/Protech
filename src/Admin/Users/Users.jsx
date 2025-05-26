import style from './Users.module.css';
import { SidebarPanel } from '../../Sidebar';
import { Button } from '../../components/ui/button';
import { Input } from '../../components/ui/input';
import { Card } from '../../components/ui/card';
import { useEffect, useState } from "react";
import { FaPlus } from "react-icons/fa";

import { initializeApp } from "https://www.gstatic.com/firebasejs/11.0.2/firebase-app.js";
import { getAnalytics } from "https://www.gstatic.com/firebasejs/11.0.2/firebase-analytics.js";
import {
    getDatabase,
    ref,
    onValue,
    set,
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

import UserPng from "../../assets/Avatar.png"
import { useNavigate } from "react-router-dom";
import { Sidebar, SidebarContent, SidebarHeader, SidebarProvider } from "../../components/ui/sidebar";
import { Label } from "../../components/ui/label";
import { X } from "lucide-react";
import { Checkbox } from "../../components/ui/checkbox";

const Users = () => {
    const navigate = useNavigate();
    const [takeTeacher, setTakeTeacher] = useState([]);
    const [isOpen, setIsOpen] = useState(false);

    const [addUser, setaddUser] = useState({
        name: "",
        young: "",
        number: "",
        email: "",
        job: "",
        address: "",
    });

    const [CheckValue, setCheckValue] = useState({
        value1: false,
        value2: false,
        value3: false,
        value4: false,
        value5: false,
        value6: false,
        value7: false,
        value8: false,
        value9: false,
        value10: false,
    });

    useEffect(() => {
        const teacherRef = ref(database, "Teachers");
        onValue(teacherRef, (snapshot) => {
            const data = snapshot.val();

            setTakeTeacher(Object.values(data || {}));
        });
    }, []);

    const toggleSidebar = () => {
        setIsOpen(!isOpen);
    };

    const handleNextPage = (id) => {
        navigate(`/users/${id}`);
    };

    const handleSearchUser = (value) => {
        const teacherRef = ref(database, "Teachers");
        onValue(teacherRef, (snapshot) => {
            const data = snapshot.val();
            const filteredData = Object.values(data || {}).filter((teacher) =>
                teacher.name.toLowerCase().includes(value.toLowerCase()) || teacher.number.toLowerCase().includes(value.toLowerCase())
            );
            setTakeTeacher(filteredData);
        });
    };

    const handleAddUser = () => {
        if (!addUser.name || !addUser.number || !addUser.email || !addUser.job || !addUser.young || !addUser.address) {
            alert("Barcha maydonlarni to'ldiring!");
            return;
        }

        set(ref(database, `Teachers/Teacher${takeTeacher.length + 1}`), {
            id: takeTeacher.length + 1,
            young: addUser.young,
            name: addUser.name,
            number: addUser.number,
            email: addUser.email,
            job: addUser.job,
            address: addUser.address,

            // User permissions
            permissions: {
                toAttend: CheckValue.value1,
                toChangeInfo: CheckValue.value2,
                toAddPeople: CheckValue.value3,

                // Additional permissions can be added here
            }
        })
            .then(() => {
                alert("Xodim muvaffaqiyatli qo'shildi!");
                setaddUser({
                    name: "",
                    young: "",
                    number: "",
                    email: "",
                    job: "",
                });
                setCheckValue({
                    value1: false,
                    value2: false,
                    value3: false,
                    value4: false,
                    value5: false,
                    value6: false,
                    value7: false,
                    value8: false,
                    value9: false,
                    value10: false,
                });
            })
            .catch((error) => {
                console.error("Xodim qo'shishda xatolik:", error);
            })

    };

    return (
        <>

            <SidebarProvider>
                {isOpen && (
                    <div
                        className="fixed w-full h-[100vh] bg-black/50 backdrop-blur-[2px] z-30 inset-0 transition-all duration-900 ease-in-out"
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
                        <h2 className="text-lg font-normal">Xodim qo'shish</h2>
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
                                    placeholder="Xodim nomi"
                                    value={addUser.name}
                                    onChange={(e) =>
                                        setaddUser((prevState) => ({
                                            ...prevState,
                                            name: e.target.value,
                                        }))
                                    }
                                />
                            </div>
                            <div className="flex flex-col gap-3">
                                <Label htmlFor="courseDuration" className="text-xs text-gray-500">Yoshi</Label>
                                <Input
                                    id="courseDuration"
                                    type="number"
                                    value={addUser.young}
                                    placeholder="Xodim yoshi"
                                    onChange={(e) =>
                                        setaddUser((prevState) => ({
                                            ...prevState,
                                            young: e.target.value,
                                        }))
                                    }
                                />
                            </div>
                            <div className="flex flex-col gap-3">
                                <Label htmlFor="coursePrice" className="text-xs text-gray-500">Telifon raqami</Label>
                                <Input
                                    id="coursePrice"
                                    placeholder="Telefon raqami"
                                    type="text"
                                    value={addUser.number}
                                    onChange={(e) => {
                                        let input = e.target.value;

                                        // Faqat raqamlar va "+" belgisini qabul qilish
                                        input = input.replace(/[^+\d]/g, "");

                                        // Formatlash: +XXX XX XXX XX XX
                                        if (input.startsWith("+")) {
                                            input = input.replace(
                                                /^(\+\d{1,3})(\d{1,2})?(\d{1,3})?(\d{1,2})?(\d{1,2})?/,
                                                (match, p1, p2, p3, p4, p5) =>
                                                    [p1, p2, p3, p4, p5].filter(Boolean).join(" ")
                                            );
                                        }

                                        // Holatni yangilash
                                        setaddUser((prevState) => ({
                                            ...prevState,
                                            number: input,
                                        }));
                                    }}
                                    maxLength={17} // Maksimal uzunlikni cheklash
                                />
                            </div>
                            <div className="flex flex-col gap-3">
                                <Label htmlFor="courseDuration" className="text-xs text-gray-500">Yo'nalishi</Label>
                                <Input
                                    id="courseDuration"
                                    type="text"
                                    value={addUser.job}
                                    placeholder="Xodim yo'nalishi"
                                    onChange={(e) =>
                                        setaddUser((prevState) => ({
                                            ...prevState,
                                            job: e.target.value,
                                        }))
                                    }
                                />
                            </div>
                            <div className="flex flex-col gap-3">
                                <Label htmlFor="courseMonth" className="text-xs text-gray-500">E-mail address</Label>
                                <Input
                                    id="courseMonth"
                                    type="text"
                                    placeholder="E-mail Address"
                                    value={addUser.email}
                                    onChange={(e) =>
                                        setaddUser((prevState) => ({
                                            ...prevState,
                                            email: e.target.value,
                                        }))
                                    }
                                />
                            </div>
                            <div className="flex flex-col gap-3">
                                <Label htmlFor="country" className="text-xs text-gray-500">Yashash joyi</Label>
                                <Input
                                    id="country"
                                    type="text"
                                    value={addUser.address}
                                    placeholder="Yashash joyi"
                                    onChange={(e) =>
                                        setaddUser((prevState) => ({
                                            ...prevState,
                                            address: e.target.value,
                                        }))
                                    }
                                />
                            </div>
                            <div className="w-full pt-3 border-t border-gray-400 flex flex-col gap-3">
                                <span className="text-xs text-gray-500">Ruxsatnomalar</span>
                                <div className="flex flex-wrap gap-3">
                                    <h4
                                        className={`flex items-center gap-2 text-sm font-normal text-gray-400 ${!CheckValue.value1 ? "text-gray-400" : "text-gray-950"}`}
                                    >
                                        <Checkbox
                                            id="checkbox1"
                                            className="data-[state=checked]:bg-blue-950"
                                            onClick={(e) => {
                                                setCheckValue({
                                                    ...CheckValue,
                                                    value1: e.target.ariaChecked === "true" ? false : true
                                                })
                                            }}
                                        />
                                        <Label
                                            htmlFor="checkbox1"
                                            className={`text-sm font-normal ${!CheckValue.value1 ? "text-gray-400" : "text-gray-950"} cursor-pointer`}>
                                            Davomat qilish
                                        </Label>
                                    </h4>
                                    <h4
                                        className={`flex items-center gap-2 text-sm font-normal text-gray-400 ${!CheckValue.value2 ? "text-gray-400" : "text-gray-950"}`}
                                    >
                                        <Checkbox
                                            id="checkbox2"
                                            className="data-[state=checked]:bg-blue-950"
                                            onClick={(e) => {
                                                setCheckValue({
                                                    ...CheckValue,
                                                    value2: e.target.ariaChecked === "true" ? false : true
                                                })
                                            }}
                                        />
                                        <Label
                                            htmlFor="checkbox2"
                                            className={`text-sm font-normal ${!CheckValue.value2 ? "text-gray-400" : "text-gray-950"} cursor-pointer`}
                                        >
                                            Ma'lumotlarni o'zgartirish
                                        </Label>
                                    </h4>
                                    <h4
                                        className={`flex items-center gap-2 text-sm font-normal text-gray-400 ${!CheckValue.value3 ? "text-gray-400" : "text-gray-950"}`}
                                    >
                                        <Checkbox
                                            id="checkbox-3"
                                            className="data-[state=checked]:bg-blue-950"
                                            onClick={(e) => {
                                                setCheckValue({
                                                    ...CheckValue,
                                                    value3: e.target.ariaChecked === "true" ? false : true
                                                })
                                            }}
                                        />
                                        <Label
                                            htmlFor="checkbox-3"
                                            className={`text-sm font-normal ${!CheckValue.value3 ? "text-gray-400" : "text-gray-950"} cursor-pointer`}
                                        >
                                            Odamlar qo'shish
                                        </Label>
                                    </h4>
                                </div>
                            </div>
                            <Button
                                className="bg-blue-950 hover:opacity-80 text-white"
                                onClick={(e) => {
                                    e.preventDefault();
                                    handleAddUser()
                                    setIsOpen(false);
                                }}
                            >
                                Qo'shish
                            </Button>
                        </form>
                    </SidebarContent>
                </Sidebar>
            </SidebarProvider>

            <div className="Users">
                <SidebarPanel />

                <div
                    className={style.users}
                    style={{
                        marginLeft: "var(--sidebar-width, 250px)",
                        width: "var(--sidebar-width), 100%",
                        transition: "all 0.5s ease, background 0.3s ease, width 0.5s ease",
                    }}
                >
                    <nav className="flex justify-between pt-8 items-center p-6">
                        <h2 className="text-3xl font-normal">Xodimlar - {takeTeacher.length} ta</h2>
                        <div className="flex gap-4 items-center">
                            <Input
                                type="text"
                                placeholder="Qidirish..."
                                className="w-64 placeholder-gray-900"
                                onChange={(e) => handleSearchUser(e.target.value)}
                            />
                            <Button
                                className="bg-blue-950 text-white flex gap-2 items-center"
                                onClick={toggleSidebar}
                            >
                                Yangi xodim qo'shish
                                <FaPlus />
                            </Button>
                        </div>
                    </nav>
                    <div className="cards grid grid-cols-4 gap-4 px-6 py-8">
                        {
                            takeTeacher.length > 0 ? takeTeacher.map((teacher, index) => (
                                <Card
                                    key={index}
                                    className="flex flex-col hover:shadow-xl cursor-pointer items-center justify-center gap-3 bg-white shadow-md rounded-lg p-4"
                                    onClick={() => handleNextPage(teacher.id)}
                                >
                                    <img src={UserPng} className="w-30 h-30" alt="User picture" />
                                    <div className="w-full border-t border-gray-400 pt-7 pb-2 flex flex-col items-start justify-start gap-1">
                                        <h2 className="text-xl font-semibold">{teacher.name}</h2>
                                        <p className="text-gray-500">{teacher.number}</p>
                                    </div>
                                </Card>
                            )) : (
                                <div className="flex items-start justify-start w-full h-full">
                                    <h2 className="text-2xl font-semibold text-gray-500">Xodimlar topilmadi</h2>
                                </div>
                            )
                        }
                    </div>
                </div>2
            </div>
        </>
    );
};

export default Users;