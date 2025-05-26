import { initializeApp } from "https://www.gstatic.com/firebasejs/11.0.2/firebase-app.js";
import { getAnalytics } from "https://www.gstatic.com/firebasejs/11.0.2/firebase-analytics.js";
import {
    getDatabase,
    ref,
    set,
    onValue,
    update,
    remove
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


import { useEffect, useState } from "react"
import { SidebarPanel } from "../../Sidebar"
import DoughnutChart from "../../components/ui/DoughnutChart"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "../../components/ui/table"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "../../components/ui/tabs"
import { IoArrowBackSharp } from "react-icons/io5";
import { Button } from "../../components/ui/button"
import { FiArrowDown, FiArrowDownLeft, FiArrowRight, FiArrowUpRight, FiChevronDown, FiChevronRight } from "react-icons/fi";
import { Sidebar, SidebarContent, SidebarHeader, SidebarProvider } from "../../components/ui/sidebar"
import { X } from "lucide-react";
import { cn } from "../../lib/utils";
import { Label } from "../../components/ui/label"
import { Input } from "../../components/ui/input"
import style from "./Dashboard.module.css"
import SelectReact from "react-select"

// select options
const options = [
    { value: "Student to'ladi", label: "Student to'ladi" },
    { value: "Boshqadan pul olish", label: "Boshqadan pul olish" },
    { value: "Direktordan pul olish", label: "Direktordan pul olish" },
    { value: "Adashib chiqim bo'lgani qaytarish", label: "Adashib chiqim bo'lgani qaytarish" },

    // Add more options as needed
]

const paymentType = [
    { value: "Naqt", label: "Naqt" },
    { value: "Click", label: "Click" },
    { value: "Bank orqali", label: "Bank orqali" }
]

const outputOptions = [
    { value: "Hodimga oylik", label: "Hodimga oylik" },
    { value: "Hodimga avans", label: "Hodimga avans" },
    { value: "Abet", label: "Abet" },
    { value: "Tamirlash ishlari", label: "Tamirlash ishlari" },
    { value: "Ujen", label: "Ujen" },
    { value: "Boshqa", label: "Boshqa" },
    { value: "Adashib kiritilgan", label: "Adashib kiritilgan" },
    { value: "Talaba pulini qaytarish", label: "Talaba pulini qaytarish" },
    { value: "Tadbirlar", label: "Tadbirlar" },
    { value: "Boshqaga pul o'tgazish", label: "Boshqaga pul o'tgazish" },
    { value: "Arenda", label: "Arenda" },
    { value: "Yo'lkiro", label: "Yo'lkiro" },
    { value: "Bonus", label: "Bonus" },
    { value: "Elektr energiya", label: "Elektr energiya" },

    // Add more options as needed
]

const InputAndOutput = () => {
    const [TabsValue, setTabsValue] = useState("input")
    const [activePage, setActivePage] = useState("list");
    const [GetInput, setGetInput] = useState([]);
    const [GetOutput, setGetOutput] = useState([]);
    const [GetStudents, setGetStudents] = useState([])
    const [GetIncome1, setGetIncome] = useState([]);
    const [GetIncome2, setGetIncome2] = useState([]);
    const [GetIncome, setGetIncome1] = useState([]);
    const [GetIncome3, setGetIncome3] = useState([]);
    const [TotalMoney, setTotalMoney] = useState(0);
    const [isOpen, setisOpen] = useState(false)
    const [open, setOpen] = useState(false)
    const [chevron, setchevron] = useState(false)
    const [AddIncome, setAddIncome] = useState({
        paymentType: "",
        amount: "",
        date: "",
        name: "",
        tranzaksiya: "",
        color: "",
        comment: "",
        Income: []
    })
    const [AddOutput, setAddOutput] = useState({
        paymentType: "",
        amount: "",
        date: "",
        name: "",
        tranzaksiya: "",
        color: "",
        comment: "",
        Income: []
    })

    useEffect(() => {
        const InputRef = ref(database, "InputOutput/Input");
        onValue(InputRef, (snapshot) => {
            const data = snapshot.val();
            setGetInput(Object.values(data || {}));
        });

        const OutputRef = ref(database, "InputOutput/Output");
        onValue(OutputRef, (snapshot) => {
            const data = snapshot.val();
            setGetOutput(Object.values(data || {}));
        });

        const IncomeRef = ref(database, "InputOutput/Input/INP1/Income");
        onValue(IncomeRef, (snapshot) => {
            const data = snapshot.val()
            setGetIncome(Object.values(data || {}));
        });

        const Income2Ref = ref(database, "InputOutput/Input/INP2/Income");
        onValue(Income2Ref, (snapshot) => {
            const data = snapshot.val();
            setGetIncome2(Object.values(data || {}));
        });

        const Income1Ref = ref(database, "InputOutput/Output/OUT1/Income");
        onValue(Income1Ref, (snapshot) => {
            const data = snapshot.val();
            setGetIncome1(Object.values(data || {}));
        });

        const Income3Ref = ref(database, "InputOutput/Output/OUT2/Income");
        onValue(Income3Ref, (snapshot) => {
            const data = snapshot.val();
            setGetIncome3(Object.values(data || {}));
        });

        const StudentsRef = ref(database, "Students");
        onValue(StudentsRef, (snapshot) => {
            const data = snapshot.val();
            setGetStudents(Object.values(data || {}));
        });
    }, []);

    useEffect(() => {
        const totalMoney = GetInput.reduce((acc, item) => {
            return Number(acc) + Number(item.amount);
        }, 0);

        setTotalMoney(totalMoney);
    }, [GetInput]);

    const handleAddIncome = () => {
        // The code for adding a new Income is write here.
        
    }

    const handleAddOutput = () => {
        // The code for adding a new Output is write here.
        
    }

    const renderContent = (value) => {
        let incomeData;
        if (activePage === "GetIncome1") incomeData = GetIncome1;
        else if (activePage === "GetIncome2") incomeData = GetIncome2;
        // else if (activePage === "GetIncome3") incomeData = GetIncome3;

        if (activePage === "list") {
            return (
                <div className="w-full h-[540px] overflow-y-auto bg-white flex flex-col justify-between items-start rounded-xl shadow-lg">
                    <Table className="w-full h-full p-5 bg-white rounded-xl">
                        <TableHeader className="w-full">
                            <TableRow className="hover:bg-transparent sticky top-0 active:bg-transparent">
                                <TableHead className="text-gray-950">№</TableHead>
                                <TableHead className="text-gray-950">Turi</TableHead>
                                <TableHead className="text-gray-950">Summa</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody className="w-full">
                            {value.length > 0 ?
                                value.map((item, index) => {
                                    return (
                                        <TableRow
                                            key={index}
                                            style={{ color: item.color }}
                                            className="hover:bg-gray-200 cursor-pointer"
                                            onClick={() => setActivePage(`GetIncome${item.id}`)}
                                        >
                                            <TableCell>{item.id}</TableCell>
                                            <TableCell>{item.type}</TableCell>
                                            <TableCell>
                                                {
                                                    Number(item.amount).toLocaleString("uz-UZ", {
                                                        style: "currency",
                                                        currency: "UZS",
                                                    })
                                                }
                                            </TableCell>
                                        </TableRow>
                                    );
                                })
                                : ""
                            }
                        </TableBody>
                    </Table>
                    <h3 className="text-base w-full flex justify-between items-center p-5">
                        Jami:
                        <span>
                            {
                                value.length > 0 ?
                                    Number(value.reduce((acc, item) => {
                                        return Number(acc) + Number(item.amount);
                                    }, 0)).toLocaleString("uz-UZ", {
                                        style: "currency",
                                        currency: "UZS",
                                    })
                                    : Number(TotalMoney).toLocaleString("uz-UZ", {
                                        style: "currency",
                                        currency: "UZS",
                                    })
                            }
                        </span>
                    </h3>
                </div>
            );
        } else {
            return (
                <div className="h-[540px] w-full flex flex-col items-start justify-start gap-2 p-5 bg-white rounded-xl shadow-lg">
                    <div className="w-full flex items-center justify-start">
                        <Button
                            variant="outline"
                            className=" px-3 py-1 bg-gray-300 rounded-md hover:bg-gray-400"
                            onClick={() => setActivePage("list")}
                        >
                            <IoArrowBackSharp className="text-lg" />
                        </Button>
                    </div>
                    <Table>
                        <TableHeader className="w-full">
                            <TableRow className="hover:bg-transparent sticky top-0 active:bg-transparent">
                                <TableHead className="text-gray-950">№</TableHead>
                                <TableHead className="text-gray-950">Sana</TableHead>
                                <TableHead className="text-gray-950">Kim</TableHead>
                                <TableHead className="text-gray-950">Tranzaksiya</TableHead>
                                <TableHead className="text-gray-950">Summa</TableHead>
                                <TableHead className="text-gray-950">To'lov turi</TableHead>
                                <TableHead className="text-gray-950">Turi</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody className="w-full">
                            {
                                incomeData?.map(item => {
                                    return (
                                        <TableRow
                                            key={item.id}
                                            className="hover:bg-gray-200 cursor-pointer"
                                        >
                                            <TableCell>{item.id}</TableCell>
                                            <TableCell>{item.date}</TableCell>
                                            <TableCell>{item.name}</TableCell>
                                            <TableCell>Student to'ladi</TableCell>
                                            <TableCell>
                                                {Number(item.amount).toLocaleString("uz-UZ", {
                                                    style: "currency",
                                                    currency: "UZS",
                                                })}
                                            </TableCell>
                                            <TableCell>{item.paymentType}</TableCell>
                                            <TableCell>
                                                <FiArrowDownLeft className="text-[#0de739] " />
                                            </TableCell>
                                        </TableRow>
                                    );
                                })
                            }
                        </TableBody>
                    </Table>
                </div>
            );
        }
    };

    const renderContent2 = (value) => {
        let incomeData;
        if (activePage === "GetIncome1") incomeData = GetIncome;
        else if (activePage === "GetIncome2") incomeData = GetIncome3;
        // else if (activePage === "GetIncome3") incomeData = GetIncome3;

        if (activePage === "list") {
            return (
                <div className="w-full h-[540px] overflow-y-auto bg-white flex flex-col justify-between items-start rounded-xl shadow-lg">
                    <Table className="w-full h-full p-5 bg-white rounded-xl">
                        <TableHeader className="w-full">
                            <TableRow className="hover:bg-transparent sticky top-0 active:bg-transparent">
                                <TableHead className="text-gray-950">№</TableHead>
                                <TableHead className="text-gray-950">Turi</TableHead>
                                <TableHead className="text-gray-950">Summa</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody className="w-full">
                            {value.length > 0 ?
                                value.map((item, index) => {
                                    return (
                                        <TableRow
                                            key={index}
                                            style={{ color: item.color }}
                                            className="hover:bg-gray-200 cursor-pointer"
                                            onClick={() => setActivePage(`GetIncome${item.id}`)}
                                        >
                                            <TableCell>{item.id}</TableCell>
                                            <TableCell>{item.type}</TableCell>
                                            <TableCell>
                                                {
                                                    Number(item.amount).toLocaleString("uz-UZ", {
                                                        style: "currency",
                                                        currency: "UZS",
                                                    })
                                                }
                                            </TableCell>
                                        </TableRow>
                                    );
                                })
                                : ""
                            }
                        </TableBody>
                    </Table>
                    <h3 className="text-base w-full flex justify-between items-center p-5">
                        Jami:
                        <span>
                            {
                                value.length > 0 ?
                                    Number(value.reduce((acc, item) => {
                                        return Number(acc) + Number(item.amount);
                                    }, 0)).toLocaleString("uz-UZ", {
                                        style: "currency",
                                        currency: "UZS",
                                    })
                                    : Number(TotalMoney).toLocaleString("uz-UZ", {
                                        style: "currency",
                                        currency: "UZS",
                                    })
                            }
                        </span>
                    </h3>
                </div>
            );
        }
        else {
            return (
                <div className="h-[540px] w-full flex flex-col items-start justify-start gap-2 p-5 bg-white rounded-xl shadow-lg">
                    <div className="w-full flex items-center justify-start">
                        <Button
                            variant="outline"
                            className=" px-3 py-1 bg-gray-300 rounded-md hover:bg-gray-400"
                            onClick={() => setActivePage("list")}
                        >
                            <IoArrowBackSharp className="text-lg" />
                        </Button>
                    </div>
                    <Table>
                        <TableHeader className="w-full">
                            <TableRow className="hover:bg-transparent sticky top-0 active:bg-transparent">
                                <TableHead className="text-gray-950">№</TableHead>
                                <TableHead className="text-gray-950">Sana</TableHead>
                                <TableHead className="text-gray-950">Tranzaksiya</TableHead>
                                <TableHead className="text-gray-950">Summa</TableHead>
                                <TableHead className="text-gray-950">To'lov turi</TableHead>
                                <TableHead className="text-gray-950">Turi</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody className="w-full">
                            {
                                incomeData?.map(item => {
                                    return (
                                        <TableRow
                                            key={item.id}
                                            className="hover:bg-gray-200 cursor-pointer"
                                        >
                                            <TableCell>{item.id}</TableCell>
                                            <TableCell>{item.date}</TableCell>
                                            <TableCell>{item.name}</TableCell>
                                            <TableCell>
                                                {Number(item.amount).toLocaleString("uz-UZ", {
                                                    style: "currency",
                                                    currency: "UZS",
                                                })}
                                            </TableCell>
                                            <TableCell>{item.paymentType}</TableCell>
                                            <TableCell>
                                                <FiArrowUpRight className="text-[#d90d0d]" />
                                            </TableCell>
                                        </TableRow>
                                    );
                                })
                            }
                        </TableBody>
                    </Table>
                </div>
            );
        }
    };

    return (
        <>
            <SidebarProvider>
                {
                    (isOpen || open) && (
                        <div
                            className="fixed w-full h-screen bg-black/50 backdrop-blur-[2px] z-30 inset-0 transition-all duration-900 ease-in-out"
                            onClick={() => {
                                setisOpen(false)
                                setOpen(false)
                                setchevron(false)
                            }}
                        >
                        </div>
                    )
                }
                <Sidebar
                    className={cn(
                        "fixed inset-y-0 right-0 z-50 w-[400px] border-l border-gray-300 bg-white transition-transform duration-300 ease-in-out",
                        !(isOpen || open) ? "translate-x-full" : "translate-x-0"
                    )}
                    side="right"
                    collapsible="none"
                >
                    <SidebarHeader className="flex  items-center justify-between border border-gray-300 p-4">
                        <h2 className="text-xl font-semibold">
                            {!isOpen ? "Yangi kirim" : "Yangi chiqim"}
                        </h2>
                        <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => {
                                setOpen(false)
                                setisOpen(false)
                            }}
                            className="rounded-full hover:bg-gray-100"
                        >
                            <X className="h-5 w-5" />
                            <span className="sr-only">Yopish</span>
                        </Button>
                    </SidebarHeader>
                    <SidebarContent className="flex flex-col items-start justify-start gap-5 p-5">
                        <form
                            onSubmit={(e) => e.preventDefault()}
                            className="space-y-6 px-4 py-5 text-left"
                        >
                            <div className="flex flex-col gap-2 relative">
                                <Label htmlFor="name">
                                    Tranzaksiya turi
                                </Label>
                                <div className="w-[320px] h-[40px] flex items-center justify-between pr-2 border border-gray-400 rounded-lg">
                                    <Input
                                        type="text"
                                        id="name"
                                        placeholder="Tanlang"
                                        className={`${style.input} w-[281px] h-10 text-md border-none focus-visible:ring-0 focus-visible:ring-transparent focus-visible:ring-offset-0`}
                                        onClick={() => setchevron(!chevron)}
                                        onChange={(e) => {
                                            isOpen ? setAddIncome({ ...AddIncome, tranzaksiya: e.target.value }) :
                                                setAddOutput({ ...AddOutput, tranzaksiya: e.target.value })
                                        }}
                                        value={!isOpen ? AddIncome.tranzaksiya : AddOutput.tranzaksiya}
                                        readOnly
                                    />
                                    <div className="w-[30px] h-6 flex justify-center items-center border-l border-gray-300">
                                        <FiChevronDown className="w-5 h-5 text-lg text-gray-400" />
                                    </div>
                                </div>
                                {
                                    chevron && (
                                        <div className="w-[320px] h-[200px] absolute top-[80px] z-40 overflow-y-auto bg-white border border-gray-300 rounded-lg shadow-lg">
                                            <div className="w-full h-full flex flex-col items-start justify-start gap-2 p-2">
                                                {
                                                    (!isOpen ? options : outputOptions).map((option, index) => (
                                                        <div
                                                            key={index}
                                                            className="w-full h-[40px] flex items-center justify-start gap-2 px-2 rounded-md hover:bg-gray-200 cursor-pointer"
                                                            onClick={() => {
                                                                setchevron(false)
                                                                !isOpen ? setAddIncome({ ...AddIncome, type: option.value }) :
                                                                    setAddOutput({ ...AddOutput, type: option.value })
                                                            }}
                                                        >
                                                            <Label htmlFor={option.value} className="text-base font-normal">
                                                                {option.label}
                                                            </Label>
                                                        </div>
                                                    ))
                                                }
                                            </div>
                                        </div>
                                    )
                                }
                            </div>

                            <div className="flex flex-col gap-2">
                                <Label
                                    htmlFor="who"
                                >
                                    Kimdan
                                </Label>
                                <SelectReact
                                    id="who"
                                    options={GetStudents.map((item) => ({ value: item.studentName, label: item.studentName }))}
                                    className="w-[320px] h-[40px] border border-gray-300 rounded-lg"
                                    onChange={(e) => {
                                        !isOpen ? setAddIncome({ ...AddIncome, name: e.value }) :
                                            setAddOutput({ ...AddOutput, name: e.value })
                                    }}
                                    placeholder="Tanlang"
                                />
                            </div>

                            <div className="flex flex-col gap-2">
                                <Label htmlFor="amount">
                                    Qancha
                                </Label>
                                <Input
                                    id="amount"
                                    type="number"
                                    onChange={(e) => {
                                        !isOpen ? setAddIncome({ ...AddIncome, amount: e.target.value }) :
                                            setAddOutput({ ...AddOutput, amount: e.target.value })
                                    }}
                                />
                            </div>

                            <div className="flex flex-col gap-2">
                                <Label htmlFor="paymentType">
                                    To'lov Turi
                                </Label>

                                <SelectReact
                                    id="paymentType"
                                    className="w-[320px] h-[40px] border border-gray-300 rounded-lg"
                                    placeholder="Tanlang"
                                    options={paymentType}
                                    onChange={(e) => {
                                        !isOpen ? setAddIncome({ ...AddIncome, paymentType: e.value }) :
                                            setAddOutput({ ...AddOutput, paymentType: e.value })
                                    }}
                                />
                            </div>

                            <div className="flex flex-col gap-2">
                                <Label htmlFor="comment">
                                    Izoh
                                </Label>
                                <Input
                                    id="comment"
                                    type="text"
                                    onChange={(e) => {
                                        !isOpen ? setAddIncome({ ...AddIncome, comment: e.target.value }) :
                                            setAddOutput({ ...AddOutput, comment: e.target.value })
                                    }}
                                />
                            </div>

                            <Button
                                variant="outline"
                                className="bg-blue-800 text-white"
                                onClick={!isOpen ? handleAddIncome : handleAddOutput}
                            >
                                Qo'shish
                            </Button>
                        </form>
                    </SidebarContent>
                </Sidebar>
            </SidebarProvider>

            <div className="InputAndOutput">
                <SidebarPanel />

                <div
                    className="w-full"
                    style={{
                        marginLeft: "var(--sidebar-width, 250px)",
                        width: "var(--sidebar-width), 100%",
                        transition: "all 0.5s ease, background 0.3s ease, width 0.5s ease",
                    }}
                >
                    <nav className="w-full p-8 pl-10 shadow-lg">
                        <h3 className="text-3xl font-normal ">
                            Kirim va Chiqim bo'yicha hisobot
                        </h3>
                    </nav>

                    <div className="w-full px-8 py-11 flex gap-5">
                        <Tabs
                            defaultValue="input"
                            className="w-full h-full flex flex-col items-start justify-start gap-5"
                            onValueChange={(value) => {
                                setTabsValue(value);
                            }}
                        >
                            <div className="Triggers w-full flex items-center justify-between">
                                <TabsList className="w-auto h-auto p-1 border-2 border-gray-300 rounded-lg">
                                    <TabsTrigger
                                        className={`px-5 py-2 ${TabsValue === "output" ? "hover:bg-gray-200" : ""} cursor-pointer ${TabsValue === "input" ? "text-white bg-slate-800" : ""} rounded-lg`}
                                        value="input"
                                    >
                                        Kirim
                                    </TabsTrigger>
                                    <TabsTrigger
                                        className={`px-5 py-2 ${TabsValue === "input" ? "hover:bg-gray-200" : ""} cursor-pointer ${TabsValue === "output" ? "text-white bg-slate-800" : ""} rounded-lg`}
                                        value="output"
                                    >
                                        Chiqim
                                    </TabsTrigger>
                                </TabsList>
                                <div className="Actions flex gap-5">
                                    <Button
                                        variant="outline"
                                        className="px-4 py-3 bg-green-600 text-white rounded-lg hover:bg-green-700"
                                        onClick={() => setOpen(true)}
                                    >
                                        Yangi kirim +
                                    </Button>
                                    <Button
                                        variant="red"
                                        onClick={() => setisOpen(true)}
                                    >
                                        Yangi chiqim -
                                    </Button>
                                </div>
                            </div>
                            <TabsContent value="input" className="w-full h-full flex items-center justify-between gap-5">
                                <div className="p-5 bg-white rounded-xl shadow-lg">
                                    <DoughnutChart Input={GetInput.map((item) => ({ color: item.color, type: item.type, amount: item.amount }))} />
                                </div>
                                {renderContent(GetInput)}
                            </TabsContent>
                            <TabsContent value="output" className="w-full h-full flex items-center justify-between gap-5">
                                <div className="p-5 bg-white rounded-xl shadow-lg">
                                    <DoughnutChart Input={GetOutput.map((item) => ({ color: item.color, type: item.type, amount: item.amount }))} />
                                </div>
                                {renderContent2(GetOutput)}
                            </TabsContent>
                        </Tabs>
                    </div>
                </div>
            </div>
        </>
    );
};

export default InputAndOutput