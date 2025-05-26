import { useState, useEffect } from "react";
import { useNavigate, useParams, useLocation, data } from "react-router-dom";
import style from "./StudentDetail.module.css";
import SelectReact from "react-select";
import { initializeApp } from "https://www.gstatic.com/firebasejs/11.0.2/firebase-app.js";
import { getAnalytics } from "https://www.gstatic.com/firebasejs/11.0.2/firebase-analytics.js";
import {
  getDatabase,
  ref,
  set,
  onValue,
  update,
  get,
  remove,
} from "https://www.gstatic.com/firebasejs/11.0.2/firebase-database.js";

import { MessageSquare, PenSquare, Plus, Calendar } from "lucide-react";
import { Button } from "../../components/ui/button";
import { Input } from "../../components/ui/input";

import { Tabs } from "./Tabs";
import CourseGrid from "./CourseGrid";
import { Comments } from "./Comments";
import { StudentHistory } from "./StudentHistory";
import { SidebarPanel } from "../../Sidebar";
import { Textarea } from "../../components/ui/textarea";
import { Modal } from "../../components/ui/modal";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "../../components/ui/select";
import { FaRegTrashAlt } from "react-icons/fa"
import { DelateNotify, ChengeNotify, AddNotify } from "../../components/ui/Toast"
import { ToastContainer } from "react-toastify";
import { FiMinusCircle } from "react-icons/fi";

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

const getCurrentMonth = () => {
  const now = new Date();
  return now.toLocaleString("en-US", { month: "long", year: "numeric" }); // Masalan: "April 2025"
};

const StudentDetail = () => {
  const location = useLocation();
  const courseData = location.state?.student;

  const getCurrentDate = () => {
    const today = new Date();
    const year = today.getFullYear();
    const month = String(today.getMonth() + 1).padStart(2, "0");
    const day = String(today.getDate()).padStart(2, "0");
    return `${year}-${month}-${day}`;
  };

  const { id } = useParams();
  const navigate = useNavigate();
  const [students, setStudents] = useState(courseData);
  const [isAdd, setIsAdd] = useState(true);
  const [studentsData, setStudentsData] = useState([]);
  const [newStudentName, setNewStudentName] = useState("");
  const [newStudentNumber, setNewStudentNumber] = useState("");
  const [editingStudent, setEditingStudent] = useState(null);
  const [currentMonth, setCurrentMonth] = useState(getCurrentMonth());
  const [activeTab, setActiveTab] = useState("groups");
  const [date, setDate] = useState("30.01.2025");
  const [isOpen, setIsOpen] = useState(false);
  const [groupsData, setGroupsData] = useState([]);
  const [groupName, setGroupName] = useState("");
  const [OpenDelateModal, setOpenDelateModal] = useState(false)
  const [isEditModalOpen, setIsEditModalOpen] = useState(false); // Added state
  const [isPaymentModalOpen, setIsPaymentModalOpen] = useState(false); // To'lov modalining holati
  const [paymentAmount, setPaymentAmount] = useState(""); // To'lov miqdori
  const [isRefundModalOpen, setIsRefundModalOpen] = useState(false); // Pul qaytarish modalining holati
  const [refundAmount, setRefundAmount] = useState(""); // Qaytariladigan pul miqdori

  const toggleIsAdd = (student = null) => {
    setIsAdd(!isAdd);
    setEditingStudent(student);
    setNewStudentName(student ? student.studentName : "");
    setNewStudentNumber(student ? student.studentNumber : "");
  };

  const handleInputChange = (event) =>
    setNewStudentName(event.target.value || "");
  const handleInputChangeNum = (event) =>
    setNewStudentNumber(event.target.value || "");

  const addStudent = () => {
    if (newStudentName.trim() === "") {
      console.log("Student name is required");
      return;
    }

    const newStudent = {
      studentName: newStudentName,
      studentNumber: newStudentNumber,
      id:
        editingStudent?.id ??
        (studentsData.length > 0
          ? Math.max(...studentsData.map((s) => s.id)) + 1
          : 1),
    };

    const studentRef = ref(database, `Students/${newStudentName}`);
    set(studentRef, newStudent)
      .then(() => {
        console.log("Student added/updated in Firebase:", newStudent);
        setStudentsData(
          editingStudent
            ? studentsData.map((s) =>
              s.id === editingStudent.id ? newStudent : s
            )
            : [...studentsData, newStudent]
        );
        setNewStudentName("");
        setNewStudentNumber("");
        setEditingStudent(null);
      })
      .catch((error) =>
        console.error("Error adding/updating student in Firebase:", error)
      );
  };

  const handlePayment = () => {
    if (!paymentAmount || isNaN(paymentAmount)) {
      alert("To'lov miqdorini to'g'ri kiriting!");
      return;
    }


    const formattedPaymentAmount = new Intl.NumberFormat("uz-UZ", {
      style: "decimal", // Faqat raqamlarni formatlash
      minimumFractionDigits: 0,
    }).format(parseFloat(paymentAmount)); // Formatlash

    const paymentDate = getCurrentDate(); // Hozirgi sanani olish
    const paymentTime = new Date().toLocaleTimeString("en-US", { hour12: false }); // To'lov vaqti
    const paymentData = {
      date: paymentDate,
      amount: `+ ${formattedPaymentAmount}`, // Formatlangan miqdor
      description: "To'lov qabul qilindi",
      status: "To'langan",
      time: paymentTime,
    };


    // To'lovni Firebase ma'lumotlar bazasiga yozish
    const paymentRef = ref(database, `Students/${student.studentName}/paymentHistory`);
    get(paymentRef)
      .then((snapshot) => {
        const existingPayments = snapshot.val() || []; // Mavjud to'lovlarni olish
        const updatedPayments = [...existingPayments, paymentData]; // Yangi to'lovni qo'shish

        return update(ref(database, `Students/${student.studentName}`), { paymentHistory: updatedPayments }); // To'lov tarixini yangilash
      })
      .then(() => {
        setIsPaymentModalOpen(false);
        setPaymentAmount(""); // To'lov miqdorini tozalash

        // Studentning balansini yangilash
        const balanceRef = ref(database, `Students/${student.studentName}/balance`);
        get(balanceRef)
          .then((snapshot) => {
            const currentBalance = parseFloat(snapshot.val()) || 0; // Hozirgi balansni olish yoki 0 ga o'rnatish
            const newBalance = currentBalance + parseFloat(paymentAmount); // To'g'ri hisoblash
            update(ref(database, `Students/${student.studentName}`), { balance: newBalance }) // Balansni yangilash
              .then(() => {
                AddNotify({AddTitle: "To'landi!"})
              })
              .catch((error) => console.error("Error updating student balance:", error));
          })
          .catch((error) => console.error("Error fetching student balance:", error));
      })
      .catch((error) => {
        console.error("To'lovni amalga oshirishda xatolik yuz berdi:", error);
      });
  };

  const handleRefund = () => {
    if (!refundAmount || isNaN(refundAmount)) {
      alert("Qaytariladigan miqdorni to'g'ri kiriting!");
      return;
    }

    const formattedRefundAmount = new Intl.NumberFormat("uz-UZ", {
      style: "decimal", // Faqat raqamlarni formatlash
      minimumFractionDigits: 0, // Qoldiqsiz ko'rsatish
    }).format(refundAmount); // Salbiy miqdor

    const refundDate = getCurrentDate(); // Hozirgi sanani olish
    const refundTime = new Date().toLocaleTimeString("en-US", { hour12: false }); // Qaytarish vaqti
    const refundData = {
      date: refundDate,
      amount: `- ${formattedRefundAmount}`, // Formatlangan miqdor
      description: "Pul qaytarildi",
      status: "Qaytarildi",
      time: refundTime,
    };

    // To'lov tarixini yangilash
    const paymentRef = ref(database, `Students/${student.studentName}/paymentHistory`);
    get(paymentRef)
      .then((snapshot) => {
        const existingPayments = snapshot.val() || []; // Mavjud to'lovlarni olish
        const updatedPayments = [...existingPayments, refundData]; // Yangi yozuvni qo'shish

        return update(ref(database, `Students/${student.studentName}`), { paymentHistory: updatedPayments }); // To'lov tarixini yangilash
      })
      .then(() => {
        setIsRefundModalOpen(false);
        setRefundAmount(""); // Qaytarish miqdorini tozalash

        // Studentning balansini yangilash
        const balanceRef = ref(database, `Students/${student.studentName}/balance`);
        get(balanceRef)
          .then((snapshot) => {
            const currentBalance = parseFloat(snapshot.val()) || 0; // Hozirgi balansni olish yoki 0 ga o'rnatish
            const newBalance = currentBalance - Math.abs(parseFloat(refundAmount)); // Yangi balansni hisoblash
            update(ref(database, `Students/${student.studentName}`), { balance: newBalance }) // Balansni yangilash
              .then(() => {
                DelateNotify({DelateTitle: "Yechildi!", Icon: FiMinusCircle })
              })
              .catch((error) => console.error("Error updating student balance:", error));
          })
          .catch((error) => console.error("Error fetching student balance:", error));
      })
      .catch((error) => {
        console.error("Pulni qaytarishda xatolik yuz berdi:", error);
      });
  };

  useEffect(() => {
    const studentRef = ref(database, `Students`);
    onValue(studentRef, (snapshot) => {
      const data = snapshot.val();
      setStudentsData(Object.values(data || {}));
    });

    const groupsRef = ref(database, "Groups");
    onValue(groupsRef, (snapshot) => {
      const data = snapshot.val();
      setGroupsData(data ? Object.keys(data) : []);
    });
  }, []);

  const addStudentToGroup = () => {
    // Guruhdagi kunlarni olish
    const groupRef = ref(database, `Groups/${groupName}`);
    onValue(groupRef, (snapshot) => {
      const groupData = snapshot.val();
      if (!groupData) {
        alert("Guruh ma'lumotlari topilmadi!");
        return;
      }

      // Talabaning mavjud ma'lumotlarini olish
      const userRef = ref(database, `Students/${student.studentName}`);
      get(userRef).then((studentSnapshot) => {
        const studentData = studentSnapshot.val() || {};

        // Talaba uchun yangi ma'lumotlar
        const newStudentData = {
          ...studentData,
          attendance: {
            [currentMonth]: { _empty: true }, // Maxsus kalit bilan bo'sh obyektni saqlash
          },
          group: groupName,
        };

        // `studentHistory`ga yangi yozuv qo'shish
        const newHistoryEntry = {
          date: getCurrentDate(), // Hozirgi sana
          title: "Guruhga qo'shildi",
          description: `${student.studentName} ${groupName} guruhiga qo'shildi.`,
        };

        const updatedHistory = studentData.studentHistory
          ? [...studentData.studentHistory, newHistoryEntry]
          : [newHistoryEntry];

        // Firebase ma'lumotlar bazasiga yozish
        update(userRef, { ...newStudentData, studentHistory: updatedHistory })
          .then(() => {
            setStudents((prevStudents) => ({
              ...prevStudents,
              ...newStudentData,
              studentHistory: updatedHistory,
            }));
            ChengeNotify()
          })
          .catch((error) => {
            console.error("Xatolik yuz berdi: ", error);
          });

        setIsOpen(false);
      });
    });
  };

  const CloseDelateModal = () => setOpenDelateModal(false)

  const student = studentsData.find((s) => s.id === Number.parseInt(id));

  useEffect(() => {
    if (student) {
      const paymentsRef = ref(
        database,
        `Payments/${currentMonth}/${student.studentName}/studentPayment`
      );
      const unsubscribe = onValue(paymentsRef, (snapshot) => {
        const data = snapshot.val();
        setPayments(data ? Object.values(data) : []);
      });
      return () => unsubscribe();
    }
  }, [student, currentMonth]);

  const handleAddGroup = () => {
    if (!editingStudent) return;

    const oldStudentName = student.studentName;
    const newStudentName = editingStudent.studentName;

    // If name hasn't changed, just update the other fields
    if (oldStudentName === newStudentName) {
      const studentRef = ref(
        database,
        `Students/${oldStudentName}`
      );
      update(studentRef, {
        studentNumber: editingStudent.studentNumber,
      })
        .then(() => {
          setIsEditModalOpen(false);
          setStudents((prevStudents) => ({
            ...prevStudents,
            studentNumber: editingStudent.studentNumber,
          }));
        })
        .catch((error) => {
          console.error("Error updating student:", error);
        });
      return;
    }

    // If name has changed, we need to move the data to a new location
    const oldRef = ref(database, `Students/${oldStudentName}`);
    const newRef = ref(database, `Students/${newStudentName}`);

    // First get all existing data
    get(oldRef).then((snapshot) => {
      if (snapshot.exists()) {
        const data = snapshot.val();

        // Create new node with updated data
        set(newRef, {
          ...data,
          studentName: newStudentName,
          studentNumber: editingStudent.studentNumber,
        })
          .then(() => {
            // Remove old node
            remove(oldRef).then(() => {
              setIsEditModalOpen(false);
              // Update local state
              setStudents((prevStudents) => ({
                ...prevStudents,
                studentName: newStudentName,
                studentNumber: editingStudent.studentNumber,
              }));
              // Redirect to new URL with updated student name
              navigate(`/student/${editingStudent.id}`);
            });
          })
          .catch((error) => {
            console.error("Error updating student:", error);
          });
      }
    });
  }

  const handleDelateStudent = () => {
    const student = studentsData.find((student) => student.id === Number(id))
    console.log(student, studentsData, id);

    const findStudentRef = ref(database, `Students/${student.studentName}`)

    remove(findStudentRef)
      .then(() => {
        setOpenDelateModal(false)
        DelateNotify()
        navigate("/students")
      })
      .catch((error) => {
        console.error(error)
      })
  }

  if (!student) return <span>Not Found</span>

  return (
    <>

    <ToastContainer/>

      {
        OpenDelateModal ? <Modal
          isOpen={OpenDelateModal}
          onClose={CloseDelateModal}
          title={"O'quvchi rostanham o'chirilsinmi?"}
          positionTop="top-[40%]"
          children={
            <div className="flex justify-center items-center gap-5">
              <Button onClick={handleDelateStudent} className="px-6 py-2 text-lg" variant="red">Ha</Button>
              <Button onClick={() => setOpenDelateModal(false)} className="px-6 py-2 text-lg" variant="outline">Yo'q</Button>
            </div>
          }
        /> : ""
      }

      <SidebarPanel />

      <div
        className={style.main}
        style={{
          marginLeft: "var(--sidebar-width, 250px)",
          width: "var(--sidebar-width), 100%",
          transition: "all 0.5s ease, background 0.3s ease, width 0.5s ease",
        }}
      >
        <div className={`${style.studentAdd} ${isAdd ? style.isAdd : ""}`}>
          <span>
            <h2>Yangi talaba qo'shish</h2>
            <button onClick={toggleIsAdd}>❌</button>
          </span>
          <hr />
          <label htmlFor="">Ism</label>
          <input
            type="text"
            value={newStudentName || ""}
            onChange={handleInputChange}
          />
          <label htmlFor="">Telefon</label>
          <input
            type="text"
            value={newStudentNumber || ""}
            onChange={handleInputChangeNum}
          />
          <label htmlFor="">Tug'ilgan sana</label>
          <input type="date" name="" id="" value={getCurrentDate()} />
          <button onClick={addStudent}>Saqlash</button>
        </div>

        <div className={style.studentActive}>
          <div className="w-full rounded-lg sticky top-3 bg-white shadow">
            {/* Balance Header */}
            <div className="bg-[#6366F1] p-4 rounded-t-lg font-bold flex justify-end">
              <span className={`bg-white px-3 py-1 rounded-full text-sm ${student.balance > 0 ? "text-green-500" : "text-red-500"}`}>
                {new Intl.NumberFormat("uz-UZ", {
                  style: "currency",
                  currency: "UZS",
                  minimumFractionDigits: 0,
                }).format(parseFloat(student.balance || 0).toFixed(2))}
              </span>
            </div>

            {/* Profile Content */}
            <div className="p-6 space-y-6">
              {/* User Info */}
              <div className="flex gap-4 items-start">
                <div className="w-16 h-16 bg-[#EEF2FF] text-[#6366F1] rounded-lg flex items-center justify-center text-2xl font-semibold">
                  UM
                </div>
                <div className="space-y-1">
                  <h3 className="text-xl font-medium text-gray-900">
                    {student.studentName}
                  </h3>
                  <span className="inline-flex items-center rounded-full px-2 py-1 text-xs border border-red-200 text-red-500">
                    Baho: 0.00
                  </span>
                  <p className="text-sm text-gray-500">ID: {student.id}</p>
                </div>
              </div>

              {/* Contact Info */}
              <div className="space-y-1">
                <p className="text-sm text-gray-500">Telefon raqam :</p>
                <p className="text-gray-900 text-[18px]">
                  {student.studentNumber}
                </p>
              </div>
              <div className="space-y-1">
                <p className="text-sm text-gray-500">Qo'shilgan sana :</p>
                <p className="text-gray-900 text-[18px]">
                  {student.addedDate || "Ma'lumot mavjud emas"}
                </p>
              </div>


              {/* Action Buttons */}
              <div className="space-y-3">
                <div className="grid gap-3">
                  <Button
                    onClick={() => setIsOpen(true)}
                    className="w-full bg-[#6366F1] hover:bg-[#5558DD] text-white gap-2"
                  >
                    <Plus className="h-5 w-5" />
                    GURUHGA QO'SHISH
                  </Button>
                  <Button
                    variant="outline"
                    className="w-full hover:bg-[#6365f11f] hover:border-[#393cf6] border-[#9193f5] text-[#6366F1]"
                    onClick={() => setIsPaymentModalOpen(true)} // Modalni ochish
                  >
                    TO'LOV QILISH
                  </Button>
                </div>
                <Button
                  variant="outline"
                  className="w-full text-red-500 border-red-300 hover:bg-red-50 hover:border-red-500"
                  onClick={() => setIsRefundModalOpen(true)} // Modalni ochish
                >
                  PUL QAYTARISH
                </Button>
                <div className="grid grid-cols-3 gap-3">
                  <Button
                    variant="outline"
                    className="w-full hover:bg-[#6365f11f] hover:border-[#393cf6]  border-[#9193f5]"
                  >
                    <MessageSquare className="h-5 w-5 text-[#6366F1]" />
                  </Button>
                  <Button
                    variant="outline"
                    className="w-full hover:bg-[#6365f11f] hover:border-[#393cf6] border-[#9193f5]"
                    onClick={() => {
                      setEditingStudent(student);
                      setIsEditModalOpen(true); // Update onClick handler
                    }}
                  >
                    <PenSquare className="h-5 w-5 text-[#6366F1]" />
                  </Button>
                  <Button
                    variant="outline"
                    className="w-full hover:bg-[#6365f11f] hover:border-[#393cf6] border-[#9193f5]"
                    onClick={() => {
                      setOpenDelateModal(true)
                    }}
                  >
                    <FaRegTrashAlt className="h-5 w-5 text-[#6366F1]" />
                  </Button>
                </div>
              </div>
            </div>
          </div>
        </div>
        <div className={style.students}>
          <main className="w-full col-[1/4]">
            <Tabs activeTab={activeTab} setActiveTab={setActiveTab} />
            {activeTab === "groups" && student && <CourseGrid student={student} />}
            {activeTab === "notes" && <Comments />}
            {activeTab === "history" && <StudentHistory student={student} />}
          </main>
        </div>
      </div>
      <Modal
        isOpen={isOpen}
        positionTop={"top-[20%]"}
        onClose={() => setIsOpen(false)}
        title="Guruhga biriktirish"
      >
        <div className="space-y-4">
          <div className="space-y-2">
            <label className="text-sm text-gray-500">Filial</label>
            <Select defaultValue="khan-tech">
              <SelectTrigger>
                <SelectValue placeholder="Filial tanlang" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="khan-tech">Khan tech Filliali</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <label className="text-sm text-gray-500">Guruhni tanlang</label>
            <SelectReact
              options={groupsData.map((group) => ({
                value: group,
                label: `[${group}]-Frontend-(Umarxon Muxtorov)`,
              }))}
              onChange={(selectedOption) => setGroupName(selectedOption.value)}
              placeholder="Guruh tanlang"
              defaultValue={
                groupsData.length > 0
                  ? {
                    value: groupsData[0],
                    label: `[${groupsData[0]}]-Frontend-(Umarxon Muxtorov)`,
                  }
                  : null
              }
            />
          </div>

          <div className="space-y-2">
            <label className="text-sm text-gray-500">Qo'shilish sanasi</label>
            <div className="relative">
              <input
                type="text"
                value={date}
                onChange={(e) => setDate(e.target.value)}
                className="w-full rounded-md border border-[var(--input)] bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
              />
              <Calendar className="absolute right-3 top-2.5 h-4 w-4 text-gray-500" />
            </div>
          </div>

          <div className="space-y-2">
            <label className="text-sm text-gray-500">Izoh</label>
            <Textarea
              placeholder="Izoh kiriting..."
              className="min-h-[100px]"
            />
          </div>

          <div className="mt-6 flex gap-3 justify-center">
            <Button
              className="bg-[#6366F1] hover:bg-[#5558DD] text-white px-8"
              onClick={addStudentToGroup}
            >
              SAQLASH
            </Button>
            <Button
              variant="outline"
              onClick={() => setIsOpen(false)}
              className="px-8"
            >
              ORQAGA
            </Button>
          </div>
        </div>
      </Modal>

      <Modal
        isOpen={isEditModalOpen}
        onClose={() => setIsEditModalOpen(false)}
        title="O'quvchi ma'lumotlarini tahrirlash"
      >
        <div className="space-y-4">
          <div className="space-y-2">
            <label className="text-sm text-gray-500">Ism</label>
            <Input
              type="text"
              value={editingStudent?.studentName || ""}
              onChange={(e) =>
                setEditingStudent({
                  ...editingStudent,
                  studentName: e.target.value,
                })
              }
            />
          </div>
          <div className="space-y-2">
            <label className="text-sm text-gray-500">Telefon raqam</label>
            <Input
              type="text"
              value={editingStudent?.studentNumber || ""}
              onChange={(e) =>
                setEditingStudent({
                  ...editingStudent,
                  studentNumber: e.target.value,
                })
              }
            />
          </div>
          <div className="mt-6 flex gap-3 justify-center">
            <Button
              className="bg-[#6366F1] hover:bg-[#5558DD] text-white px-8"
              onClick={handleAddGroup}
            >
              SAQLASH
            </Button>
            <Button
              variant="outline"
              onClick={() => setIsEditModalOpen(false)}
              className="px-8"
            >
              BEKOR QILISH
            </Button>
          </div>
        </div>
      </Modal>

      <Modal
        isOpen={isPaymentModalOpen}
        onClose={() => setIsPaymentModalOpen(false)}
        title="To'lov qilish"
        positionTop={"top-[35%]"}
      >
        <div className="space-y-4">
          <div className="space-y-2">
            <label className="text-sm text-gray-500">To'lov miqdori</label>
            <Input
              type="text"
              value={paymentAmount}
              onChange={(e) => setPaymentAmount(e.target.value)}
            />
          </div>
          <div className="mt-6 flex gap-3 justify-center">
            <Button
              className="bg-[#6366F1] hover:bg-[#5558DD] text-white px-8"
              onClick={handlePayment}
            >
              TO'LOV QILISH
            </Button>
            <Button
              variant="outline"
              onClick={() => setIsPaymentModalOpen(false)}
              className="px-8"
            >
              BEKOR QILISH
            </Button>
          </div>
        </div>
      </Modal>

      <Modal
        isOpen={isRefundModalOpen}
        onClose={() => setIsRefundModalOpen(false)}
        title="Pul qaytarish"
        positionTop={"top-[35%]"}
      >
        <div className="space-y-4">
          <div className="space-y-2">
            <label className="text-sm text-gray-500">Qaytariladigan miqdor</label>
            <Input
              type="text"
              value={refundAmount}
              onChange={(e) => setRefundAmount(e.target.value)}
            />
          </div>
          <div className="mt-6 flex gap-3 justify-center">
            <Button
              className="bg-[#6366F1] hover:bg-[#5558DD] text-white px-8"
              onClick={handleRefund}
            >
              PUL QAYTARISH
            </Button>
            <Button
              variant="outline"
              onClick={() => setIsRefundModalOpen(false)}
              className="px-8"
            >
              BEKOR QILISH
            </Button>
          </div>
        </div>
      </Modal>
    </>
  );
};

export default StudentDetail;
