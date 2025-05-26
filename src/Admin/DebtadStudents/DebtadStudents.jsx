import { useState, useEffect } from "react";
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

import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from "@/components/ui/table";

import { SidebarPanel } from "../../Sidebar"
import { Card, CardContent, CardHeader } from "../../components/ui/card";
import { Input } from "../../components/ui/input";
import style from "./DabtedStudents.module.css"
import { Button } from "../../components/ui/button";
import { FileSpreadsheet, MessageSquare } from "lucide-react";
import { useNavigate } from "react-router-dom";

const DebtadStudents = () => {
    const navigate = useNavigate()
    const [GetStudents, setGetStudents] = useState([]);
    const [groupsData, setGroupsData] = useState([]);
    const [filteredStudents, setFilteredStudents] = useState([]);
    const [allBalance, setallBalance] = useState(0)
    const [DabtedSstudentLength, setDabtedSstudentLength] = useState(0)

    // Studentlarni olish
    useEffect(() => {
        const studentRef = ref(database, "Students");
        onValue(studentRef, (snapshot) => {
            const data = snapshot.val();
            const students = data ? Object.values(data) : [];
            setGetStudents(students);

            // Faqat qarzdor talabalarni saqlash
            const dabtedStudents = students.filter((student) =>
                student.balance.toString().slice(0, 1) === "-"
            );
            setFilteredStudents(dabtedStudents);
            setDabtedSstudentLength(dabtedStudents.length)
        });
    }, []);

    // Guruhlarni olish
    useEffect(() => {
        const groupRef = ref(database, "Groups");
        onValue(groupRef, (snapshot) => {
            const data = snapshot.val();
            setGroupsData(Object.values(data || {}));
        });
    }, []);

    // Qarzdor o'quvchilarni qidirish
    const handleSearchStudent = (value) => {
        if (value === "") {
            // Agar qidiruv maydoni bo'sh bo'lsa, barcha qarzdor talabalarni ko'rsatish
            const dabtedStudents = GetStudents.filter((student) =>
                student.balance.toString().slice(0, 1) === "-"
            );
            setFilteredStudents(dabtedStudents);
            return;
        }

        // Qidiruv natijalarini filtrlash
        const searchResults = GetStudents.filter(
            (student) =>
                student.balance.toString().slice(0, 1) === "-" &&
                student.studentName.toLowerCase().includes(value.toLowerCase())
        );
        setFilteredStudents(searchResults);
    };

    useEffect(() => {
        if (filteredStudents) {
            let totalBalance = 0; // Jami balansni hisoblash uchun boshlang'ich qiymat
            filteredStudents.forEach((student) => {
                const balance = parseFloat(student.balance || 0); // Balansni son sifatida olish
                totalBalance += balance; // Jami balansga qo'shish
            });
            setallBalance(totalBalance); // Jami balansni yangilash
        } else {
            setallBalance(0); // Agar talabalar bo'lmasa, balansni 0 ga o'rnatish
        }
    }, [filteredStudents]);


    return (
        <div className="DebtedStudents">
            <SidebarPanel />

            <div
                className="flex flex-col items-center gap-3 p-6"
                style={{
                    marginLeft: "var(--sidebar-width, 250px)",
                    width: "var(--sidebar-width), 100%",
                    transition: "all 0.5s ease, background 0.3s ease, width 0.5s ease",
                }}
            >
                <nav className="w-full">
                    <h1 className="text-3xl font-normal">
                        Qarzdor o'quvchilar - {DabtedSstudentLength} ta
                    </h1>
                </nav>

                <Card className="w-full h-[100px] flex justify-start items-center p-5">
                    <h3 className="text-xl ">
                        <span className="text-red-600">Jami qarz</span>: 
                        {new Intl.NumberFormat("uz-UZ", {
                            style: "currency",
                            currency: "UZS",
                            minimumFractionDigits: 2,
                            maximumFractionDigits: 2,
                        }).format(allBalance)}
                    </h3>
                </Card>

                <Card className="w-full">
                    <CardHeader className="w-full flex flex-row justify-between">
                        <Input
                            type="text"
                            className={`${style.inputSearch} w-[250px]`}
                            placeholder="Qidirish..."
                            onChange={(e) => handleSearchStudent(e.target.value)}
                        />
                        <div className="flex gap-2">
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
                    </CardHeader>
                    <CardContent>
                        {filteredStudents.length > 0 ? (
                            <Table>
                                <TableHeader>
                                    <TableRow>
                                        <TableHead>ID</TableHead>
                                        <TableHead>Ism familiya</TableHead>
                                        <TableHead>Qarzi</TableHead>
                                        <TableHead>Telefon raqam</TableHead>
                                        <TableHead>Guruhlar</TableHead>
                                        <TableHead>O'qituvchi</TableHead>
                                    </TableRow>
                                </TableHeader>
                                <TableBody>
                                    {filteredStudents.map((student) => {
                                        const filterGroup = groupsData.find(
                                            (group) => group.groupName === student.group
                                        );
                                        return (
                                            <TableRow key={student.id} onClick={() => navigate(`/student/${student.id}`)} className="cursor-pointer">
                                                <TableCell>{student.id}</TableCell>
                                                <TableCell>{student.studentName}</TableCell>
                                                <TableCell>

                                                    <span
                                                        className={`py-1 px-2 ${student.balance > 0
                                                            ? "bg-green-300 text-green-700"
                                                            : "bg-red-300 text-red-700"
                                                            } rounded-3xl`}
                                                    >
                                                        {new Intl.NumberFormat("uz-UZ", {
                                                            style: "currency",
                                                            currency: "UZS",
                                                            minimumFractionDigits: 0,
                                                        }).format(
                                                            parseFloat(student.balance || 0).toFixed(2)
                                                        )}
                                                    </span>
                                                </TableCell>
                                                <TableCell>{student.studentNumber}</TableCell>
                                                <TableCell>
                                                    <span className="inline-flex items-center rounded-full bg-green-50 px-2 py-1 text-xs font-medium text-green-700 ring-1 ring-inset ring-green-600/20">
                                                        {student.group}
                                                    </span>
                                                </TableCell>
                                                <TableCell>
                                                    {filterGroup && filterGroup.teachers
                                                        ? filterGroup.teachers
                                                        : "Noma'lum"}
                                                </TableCell>
                                            </TableRow>
                                        );
                                    })}
                                </TableBody>
                            </Table>
                        ) : (
                            <h1 className="w-full text-gray-500 text-center">
                                Ma'lumot yo'q
                            </h1>
                        )}
                    </CardContent>
                </Card>
            </div>
        </div>
    );
};


export default DebtadStudents