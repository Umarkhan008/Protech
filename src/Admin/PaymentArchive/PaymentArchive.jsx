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


import { CreditCard } from "lucide-react";
import { SidebarPanel } from "../../Sidebar";
import { Button } from "../../components/ui/button";
import { MdOutlinePayments } from "react-icons/md";
import { Input } from "../../components/ui/input";
import { Label } from "../../components/ui/label";
import { Modal } from "../../components/ui/modal";
import { Card, CardContent, CardTitle } from "../../components/ui/card";
import imageKnow from "../../assets/dont-know.png";

import React, { useEffect, useState } from "react";
import { PaymentItem } from "../../components/ui/payment-item";
import style from "./PaymentArchive.module.css"

const getCurrentDate = () => {
    const today = new Date();
    const year = today.getFullYear();
    const month = String(today.getMonth() + 1).padStart(2, "0");
    const day = String(today.getDate()).padStart(2, "0");
    return `${year}-${month}-${day}`;
};

const PaymentArchive = () => {
    const [GetStudents, setGetStudents] = useState([])
    const [OpenModal, setOpenModal] = useState(false)
    const [OpenModalPayment, setOpenModalPayment] = useState(false)
    const [StudentKeys, setStudentKeys] = useState({});
    const [SearchStudens, setSearchStudens] = useState([]);

    const [PayValue, setPayValue] = useState({
        value1: "",
        value2: ""
    })

    // Talabalar ma'lumotlarini olish
    useEffect(() => {
        const StudentRef = ref(database, "Students");

        onValue(StudentRef, (snapshot) => {
            const data = snapshot.val();;

            setGetStudents(Object.values(data || {}));
            setStudentKeys(Object.keys(data || {}));
        });
    }, []);

    // Talabalarni qidirish funksiyasi
    const handleSearchStudent = (searchTerm) => {
        if (!searchTerm) {
            setSearchStudens([]);
            return;
        }

        const filteredStudents = GetStudents.filter((student) =>
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

        const selectedStudent = GetStudents.filter((student) => student.studentName === studentName);
        setSearchStudens(selectedStudent); // Faqat bosilgan talaba bilan natijalarni yangilash
    };


    // Talabaga to'lov qilish funksiyasi
    const handlePayment = () => {
        if (!PayValue.value2 || !PayValue.value1) {
            alert("To'lov miqdorini to'g'ri kiriting!");
            return;
        }

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
                setOpenModal(false);
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
    };

    // Talabadan pul yechish funksiyasi
    const handleStudentPayment = () => {
        if (!PayValue.value2 || !PayValue.value1) {
            alert("Pul yechish miqdorini to'g'ri kiriting!");
            return;
        }

        const paymentAmount = parseFloat(PayValue.value1.replace(/\s/g, ""));

        if (isNaN(paymentAmount) || paymentAmount <= 0) {
            alert("Pul miqdori noto'g'ri!");
            return;
        }

        const formattedPaymentAmount = new Intl.NumberFormat("uz-UZ", {
            style: "decimal",
            minimumFractionDigits: 0,
        }).format(paymentAmount);

        const paymentData = {
            date: getCurrentDate(),
            amount: `- ${formattedPaymentAmount}`,
            description: "Pul yechildi",
            status: "Yechilgan",
            time: new Date().toLocaleTimeString("en-US", { hour12: false }),
        };

        const studentRef = ref(database, `Students/${PayValue.value2}`);
        const paymentRef = ref(database, `Students/${PayValue.value2}/paymentHistory`);

        get(studentRef)
            .then((snapshot) => {
                if (snapshot.exists()) {
                    const studentData = snapshot.val();
                    const currentBalance = parseFloat(studentData.balance) || 0;

                    if (currentBalance < paymentAmount) {
                        alert("Balans yetarli emas!");
                        return;
                    }

                    const updatedBalance = currentBalance - paymentAmount;

                    // Yangi balansni va paymentHistoryni yangilash
                    return get(paymentRef).then((paymentSnapshot) => {
                        const existingPayments = paymentSnapshot.val() || [];
                        const updatedPayments = [...existingPayments, paymentData];

                        return update(studentRef, {
                            balance: updatedBalance,
                            paymentHistory: updatedPayments,
                        });
                    });
                } else {
                    alert("Talaba topilmadi!");
                }
            })
            .then(() => {
                setOpenModalPayment(false);
                setPayValue({ value1: "", value2: "" });
                setSearchStudens([]);
                alert("Pul muvaffaqiyatli yechildi!");
            })
            .catch((error) => {
                console.error("Pul yechishda xatolik yuz berdi:", error);
            });
    };

    const handleSearchStudentPayment = (value) => {
        if (!value) {
            setGetStudents(GetStudents); // Qidiruv maydoni bo'sh bo'lsa, natijalarni tozalash va eski holatga qaytarish
            return;
        }

        const studentRef = ref(database, "Students");

        get(studentRef).then((snapshot) => {
            const data = snapshot.val();
            if (!data) {
                setGetStudents([]); // Agar ma'lumot bo'lmasa, natijalarni tozalash
                return;
            }

            const studentsArray = Object.values(data); // Obyektni massivga aylantirish
            const filteredStudents = studentsArray.filter((student) =>
                student.studentName.toLowerCase().includes(value.toLowerCase()) // Talabaning ismi bo'yicha qidirish
            );

            setGetStudents(filteredStudents); // Faqat mos keladigan talabalarni o'rnating
        }).catch((error) => {
            console.error("Firebase o'qish xatosi:", error);
        });
    };

    return (
        <>
            {
                (OpenModal || OpenModalPayment) && (
                    <Modal
                        title={OpenModal ? "To'lov qilish" : "Pul yechish"}
                        isOpen={OpenModal || OpenModalPayment}
                        onClose={() => {
                            setOpenModal(false)
                            setOpenModalPayment(false)
                        }}
                        positionTop={"t-[40px]"}
                        children={
                            <div className="flex flex-col gap-4">
                                <div className="flex flex-col gap-3">
                                    <Label htmlFor="pay" className="text-sm/3 text-gray-400">{OpenModal ? "To'lov miqdori" : "Qancha yechiladi"}</Label>
                                    <Input
                                        id="pay"
                                        type="text"
                                        className={`${style.inputSearch} placeholder-gray-500 text-black`}
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
                                    <label htmlFor="who" className="text-sm/3 text-gray-400">{OpenModal ? "Kimga" : "Kimdan"}</label>
                                    <Input
                                        id="who"
                                        type="search"
                                        placeholder="Talaba ismini qidiring..."
                                        className={style.inputSearch}
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
                                        onClick={() => {
                                            setOpenModal(false)
                                            setOpenModalPayment(false)
                                        }}
                                    >
                                        Bekor qilish
                                    </Button>
                                    {
                                        OpenModal ? (
                                            <Button
                                                className="bg-green-600 hover:bg-green-700 text-white flex items-center gap-1"
                                                onClick={(e) => {
                                                    e.preventDefault()
                                                    handlePayment()
                                                }}
                                            >
                                                To'lash
                                                <CreditCard className="w-4 h-4 mr-2" />
                                            </Button>
                                        ) : (
                                            <Button
                                                className="bg-red-600 hover:bg-red-700 text-white flex items-center gap-1"
                                                onClick={(e) => {
                                                    e.preventDefault()
                                                    handleStudentPayment()
                                                }}
                                            >
                                                Yechish
                                                <CreditCard className="w-4 h-4 mr-2" />
                                            </Button>
                                        )
                                    }
                                </div>
                            </div>
                        }
                    />
                )
            }

            <div className="PaymentArchive">
                <SidebarPanel />

                <div
                    className="payment-archive p-6 flex flex-col gap-4 justify-start items-start"
                    style={{
                        marginLeft: "var(--sidebar-width, 250px)",
                        width: "var(--sidebar-width), 100%",
                        transition: "all 0.5s ease, background 0.3s ease, width 0.5s ease",
                    }}
                >
                    <nav className="w-full flex justify-between pt-8 items-center">
                        <h1 className="text-3xl font-normal">To'lovlar tarixi</h1>
                        <div className="flex gap-4">
                            <Button
                                className="bg-green-600 hover:bg-green-700 text-white"
                                onClick={() => setOpenModal(true)}
                            >
                                <CreditCard className="w-4 h-4 mr-2" />
                                To'lov qilish
                            </Button>
                            <Button
                                variant="red"
                                className="flex items-center gap-2"
                                onClick={() => setOpenModalPayment(true)}
                            >
                                <MdOutlinePayments className="w-4 h-4 mr2" />
                                Pul yechish
                            </Button>
                        </div>
                    </nav>
                    <Input
                        type="text"
                        placeholder="Talabani qidiring..."
                        className={`${style.inputSearch} w-[275px] self-end`}
                        onChange={(e) => handleSearchStudentPayment(e.target.value)}
                    />
                    <div className="Cards w-full flex justify-between items-start ">
                        <Card className="w-[48%] p-5 pt-0 h-[540px] overflow-y-scroll">
                            <CardTitle className="text-xl text-gray-600 py-5 sticky z-10 top-0 bg-white">
                                To'lov qilinganlar
                            </CardTitle>
                            <CardContent className="flex flex-col gap-3 justify-start items-start w-full border-l border-gray-500">
                                {GetStudents.length > 0 ? (
                                    GetStudents.map((student) =>
                                        Array.isArray(student.paymentHistory) && student.paymentHistory.length > 0
                                            ? student.paymentHistory
                                                .filter((payment) => typeof payment.amount === "string" && payment.amount.slice(0, 1) === "+")
                                                .map((filteredPayment, index) => (
                                                    <div className={`${style.cardStyle} w-full flex flex-col shadow-lg p-3 border-l-2 pt-4 rounded-lg`} key={student.id + '-' + index}>
                                                        <h3 className="text-lg font-normal">{student.studentName}</h3>
                                                        <PaymentItem
                                                            date={filteredPayment.date}
                                                            amount={filteredPayment.amount}
                                                            status={filteredPayment.status}
                                                            method={filteredPayment.description}
                                                            className="w-full py-0"
                                                        />
                                                    </div>
                                                ))
                                            : null
                                    )
                                ) : (
                                    <div className="flex flex-col items-center justify-center">
                                        <img src={imageKnow} alt="No data" className="w-40 h-40" />
                                        <p className="text-gray-500 mt-4">To'lovlar tarixi mavjud emas</p>
                                    </div>
                                )}
                            </CardContent>
                        </Card>
                        <Card className="w-[48%] p-5 pt-0 h-[540px] overflow-y-scroll">
                            <CardTitle className="text-xl text-gray-600 py-5 sticky z-10 top-0 bg-white">
                                Pul yechilganlar
                            </CardTitle>
                            <CardContent className="flex flex-col gap-3 justify-start items-start w-full border-l border-gray-500">
                                {GetStudents.length > 0 ? (
                                    GetStudents.map((student) =>
                                        Array.isArray(student.paymentHistory) && student.paymentHistory.length > 0
                                            ? student.paymentHistory
                                                .filter((payment) => typeof payment.amount === "string" && payment.amount.slice(0, 1) === "-")
                                                .map((filteredPayment, index) => (
                                                    <div className={`${style.cardStyle} w-full flex flex-col shadow-lg p-3 border-l-2 pt-4 rounded-lg`} key={student.id + '-' + index}>
                                                        <h3 className="text-lg font-normal">{student.studentName}</h3>
                                                        <PaymentItem
                                                            date={filteredPayment.date}
                                                            amount={filteredPayment.amount}
                                                            status={filteredPayment.status}
                                                            method={filteredPayment.description}
                                                            className="w-full py-0"
                                                        />
                                                    </div>
                                                ))
                                            : null
                                    )
                                ) : (
                                    <div className="flex flex-col items-center justify-center">
                                        <img src={imageKnow} alt="No data" className="w-40 h-40" />
                                        <p className="text-gray-500 mt-4">To'lovlar tarixi mavjud emas</p>
                                    </div>
                                )}
                            </CardContent>
                        </Card>
                    </div>
                </div>
            </div>
        </>
    )
}

export default PaymentArchive