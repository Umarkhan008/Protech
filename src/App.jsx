import React from "react";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import Register from '../src/Register&Login/Register.jsx'
import Basic from '../src/Basic/Basic.jsx'
import Panel from '../src/Panel/Panel.jsx'
import Templates from '../src/Templates.jsx'
import Control from '../src/Admin/Control/Control.jsx'
import Message from "../src/Message/Message.jsx";
import Expenses from '../src/Admin/Dashboard/Expenses.jsx'
import Groups from '../src/Admin/Groups/Groups.jsx'
import Students from '../src/Admin/Students/Students.jsx'
import StudentDetail from '../src/Admin/Students/StudentDetail.jsx';
import GroupDetails from "../src/Admin/Groups/GroupDetails.jsx";
import Leads from "../src/Panel/Leads.jsx"
import "./index.css";
import Course from "./Admin/Course/Course.jsx";
import CourseInfo from "./Admin/Course/CourseInfo.jsx";
import Rooms from "./Admin/Rooms/Rooms.jsx";
import Users from "./Admin/Users/Users.jsx";
import UserInfo from "./Admin/Users/UserInfo.jsx";
import PaymentArchive from "./Admin/PaymentArchive/PaymentArchive.jsx";
import DebtadStudents from "./Admin/DebtadStudents/DebtadStudents.jsx";
import InputAndOutput from "./Admin/Dashboard/InputAndOutput.jsx";
import "./Panel/Toast.css"

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<Register />}></Route>
        <Route path="/templates" element={<Templates />}></Route>
        <Route path="/panel" element={<Panel />}></Route>
        <Route path="/expenses" element={<Expenses />}></Route>
        <Route path="/inputAndOutput" element={<InputAndOutput />}></Route>
        <Route path="/control" element={<Control />}></Route>
        <Route path="/course" element={<Course />}></Route>
        <Route path="/rooms" element={<Rooms />}></Route>
        <Route path="/users" element={<Users />}></Route>
        <Route path="/chat" element={<Message />}></Route>
        <Route path="/groups" element={<Groups />}></Route>
        <Route path="/students" element={<Students />}></Route>
        <Route path="/leads" element={<Leads />}></Route>
        <Route path="/paymentArchive" element={<PaymentArchive />}></Route>
        <Route path="/debtadStudents" element={<DebtadStudents />}></Route>
        <Route path="/student/:id" element={<StudentDetail />} />
        <Route path="/group/:id" element={<GroupDetails />} />
        <Route path="/course/:id" element={<CourseInfo />} />
        <Route path="/users/:id" element={<UserInfo />} />
      </Routes>
    </Router>
  )
}

export default App

