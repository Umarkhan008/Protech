import style from "./Rooms.module.css"
import { SidebarPanel } from "../../Sidebar"
import { Button } from "../../components/ui/button"
import { FaPlus } from "react-icons/fa"
import { GrEdit } from "react-icons/gr";
import { FiTrash2 } from "react-icons/fi"

import { initializeApp } from "https://www.gstatic.com/firebasejs/11.0.2/firebase-app.js";
import { getAnalytics } from "https://www.gstatic.com/firebasejs/11.0.2/firebase-analytics.js";
import {
  getDatabase,
  ref,
  set,
  onValue,
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

import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow
} from "@/components/ui/table";
import { useEffect, useState } from "react";
import { Sidebar, SidebarHeader, SidebarContent, SidebarProvider } from "../../components/ui/sidebar";
import { Label } from "../../components/ui/label";
import { Input } from "../../components/ui/input";
import { X } from "lucide-react";
import { Modal } from "../../components/ui/modal";

const Rooms = () => {
  const [TakeRooms, setTakeRooms] = useState([]);
  const [TakeKeys, setTakeKeys] = useState([]);
  const [isOpen, setIsOpen] = useState(false);
  const [ChengeOpen, setChengeOpen] = useState(false);
  const [OpenMadal, setOpenModal] = useState(false);
  const [addRoom, setaddRoom] = useState({
    name: "",
    people: ""
  });

  const [ChengeRoom, setChengeRoom] = useState({
    name: "",
    people: ""
  });

  const [chengeId, setChengeId] = useState(Number);
  const [delateId, setDelateId] = useState(Number);

  useEffect(() => {
    const roomsRef = ref(database, "Rooms");

    onValue(roomsRef, (snapshot) => {
      const data = snapshot.val();

      setTakeKeys(Object.keys(data || {}));
      setTakeRooms(Object.values(data || {}));
    });

  }, []);

  const toggleSidebar = () => {
    setIsOpen(false);
    setChengeOpen(false);
  };

  const handleAddRoom = () => {
    if (addRoom.name === "" || addRoom.people === "") {
      alert("Iltimos barcha maydonlarni to'ldiring!");
      return;
    }

    set(ref(database, `Rooms/Room${TakeRooms.length + 1}`), {
      id: TakeRooms.length + 1,
      name: addRoom.name,
      people: addRoom.people
    })
      .then(() => {
        alert("Room added successfully!");
        setaddRoom({ name: "", people: "" });
      })
      .catch((error) => {
        console.log("Error adding room: ", error);
      });
  }

  const chengeRoom = (id) => {
    const firstRoom = TakeRooms.find(room => room.id === id);

    if (firstRoom) {
      setChengeRoom({ name: firstRoom.name, people: firstRoom.people });
    }
  }

  const handleChengeRoom = () => {
    const foundKey = TakeKeys.find((key, index) => TakeRooms[index]?.id?.toString() === chengeId.toString());

    if (foundKey) {
      set(ref(database, `Rooms/${foundKey}`), {
        id: chengeId,
        name: ChengeRoom.name,
        people: ChengeRoom.people
      })
        .then(() => {
          setChengeOpen(false)
          alert("Room updated successfully!");
          setChengeRoom({ name: "", people: "" });
        })
        .catch((error) => {
          console.log("Error updating room: ", error);
        });
    }
  }

  const handleDeleteRoom = () => {
    const foundKey = TakeKeys.find((key, index) => TakeRooms[index]?.id?.toString() === delateId.toString());

    const leadRef = ref(database, `Rooms/${foundKey}`);

    remove(leadRef)
      .then(() => {
        setOpenModal(false);
      })
      .catch((error) => {
        console.log("Error deleting room: ", error);
      });
  }

  return (
    <>
      {
        OpenMadal && (
          <Modal
            isOpen={OpenMadal}
            onClose={() => setOpenModal(false)}
            positionTop="top-[40px]"
            title={"Xonani o'chirish"}
            children={
              <div className="flex justify-center items-center gap-16">
                <Button
                  className="bg-red-600 text-white px-4 py-2 rounded-md hover:opacity-70"
                  onClick={handleDeleteRoom}
                >
                  O'chirish
                </Button>
                <Button
                  className="bg-gray-300 text-black px-4 py-2 rounded-md hover:opacity-70"
                  onClick={() => setOpenModal(false)}
                >
                  Bekor qilish
                </Button>
              </div>
            }
          />
        )
      }

      <SidebarProvider>
        {(isOpen || ChengeOpen) && (
          <div2
            className="fixed w-full h-[100vh] bg-black/50 backdrop-blur-[2px] z-30 inset-0 transition-all duration-900 ease-in-out"
            onClick={toggleSidebar}
          ></div2>
        )}
        <Sidebar
          className={`fixed inset-y-0 right-0 z-50 w-[400px] border-l border-gray-300 bg-white transition-transform duration-300 ease-in-out ${isOpen || ChengeOpen ? "translate-x-0" : "translate-x-full"}`}
          side="right"
          collapsible="none"
        >
          <SidebarHeader className="flex items-center justify-between border border-gray-300 p-4">
            <h2 className="text-lg font-normal">
              {
                isOpen ? "Xona qo'shish" :
                  ChengeOpen ? "Xona ma'lumotlarini o'zgartirish" :
                    "Xona ma'lumotlari"
              }
            </h2>
            <Button
              onClick={toggleSidebar}
              className="rounded-full hover:bg-gray-100"
            >
              <X className="h-5 w-5" />
            </Button>
          </SidebarHeader>
          <SidebarContent>
            <form className="space-y-6 p-6 text-left">
              <div className="flex flex-col gap-3">
                <Label htmlFor="courseSelect" className="text-xs text-gray-500">Xona nomi</Label>
                <Input
                  id="courseSelect"
                  type="text"
                  className={`${style.inputSearch}`}
                  placeholder="Xona nomi"
                  value={isOpen ? addRoom.name : ChengeOpen ? ChengeRoom.name : ""}
                  onChange={(e) => {
                    isOpen ? setaddRoom((prevState) => ({
                      ...prevState,
                      name: e.target.value,
                    })) :
                      ChengeOpen ? setChengeRoom((prevState) => ({
                        ...prevState,
                        name: e.target.value,
                      })) : null
                  }}
                />
              </div>
              <div className="flex flex-col gap-3">
                <Label htmlFor="coursePrice" className="text-xs text-gray-500">Xona sig'imi</Label>
                <Input
                  id="coursePrice"
                  placeholder="Xona sigimi"
                  className={`${style.inputSearch}`}
                  type="text"
                  value={isOpen ? addRoom.people : ChengeOpen ? ChengeRoom.people : ""}
                  onChange={(e) => {
                    isOpen ? setaddRoom((prevState) => ({
                      ...prevState,
                      people: e.target.value,
                    })) :
                      ChengeOpen ? setChengeRoom((prevState) => ({
                        ...prevState,
                        people: e.target.value,
                      })) : null
                  }}
                />
              </div>
              {
                isOpen ?
                  <Button
                    className="bg-blue-950 hover:opacity-80 text-white px-4 py-2 rounded-md"
                    onClick={(e) => {
                      e.preventDefault();
                      handleAddRoom();
                      toggleSidebar();
                    }}
                  >
                    Qo'shish
                  </Button> :
                  ChengeOpen ?
                    <Button
                      className="bg-blue-950 hover:opacity-80 text-white px-4 py-2 rounded-md"
                      onClick={(e) => {
                        e.preventDefault();
                        handleChengeRoom();
                        toggleSidebar();
                      }}
                    >
                      O'zgartirish
                    </Button> : null
              }
            </form>
          </SidebarContent>
        </Sidebar>
      </SidebarProvider>

      <div className="Rooms">
        <SidebarPanel />

        <div
          className={`${style.rooms} px-10`}
          style={{
            marginLeft: "var(--sidebar-width, 250px)",
            width: "var(--sidebar-width), 100%",
            transition: "all 0.5s ease, background 0.3s ease, width 0.5s ease",
          }}
        >
          <nav className="flex justify-between pt-8 self-start w-full items-center pb-6 rounded-lg">
            <h2 className="text-3xl font-normal">Xonalar</h2>
            <Button
              className="bg-blue-950 flex gap-1 text-white"
              onClick={() => setIsOpen(true)}
            >
              Yangi xona qo'shish
              <FaPlus />
            </Button>
          </nav>

          <Table className={`${style.table}`}>
            <TableHeader>
              <TableRow>
                <TableHead>ID</TableHead>
                <TableHead>Ism</TableHead>
                <TableHead>Xona sig'imi</TableHead>
                <TableHead>Amallar</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {TakeRooms.map((room) => (
                <TableRow>
                  <TableCell>{room.id ? room.id : "Noma'lum"}</TableCell>
                  <TableCell>{room.name ? room.name : "Noma'lum"}</TableCell>
                  <TableCell>{room.people ? room.people : "Noma'lum"}</TableCell>
                  <TableCell className="flex gap-1 items-center">
                    <div
                      className={`${style.icon}`}
                      onClick={() => {
                        setChengeOpen(true)
                        chengeRoom(room.id);
                        setChengeId(room.id)
                      }}
                    >
                      <GrEdit />
                    </div>
                    <div
                      className={`${style.icon}`}
                      onClick={() => {
                        setOpenModal(true)
                        setDelateId(room.id);
                      }}
                    >
                      <FiTrash2 className="text-red-600" />
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      </div>
    </>
  )
}

export default Rooms;