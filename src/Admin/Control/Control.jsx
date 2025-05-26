import React, { useState } from "react";
import style from "./Control.module.css";
import { Link } from "react-router-dom";
import { initializeApp } from "https://www.gstatic.com/firebasejs/11.0.2/firebase-app.js";
import { getAnalytics } from "https://www.gstatic.com/firebasejs/11.0.2/firebase-analytics.js";
import {
  getDatabase,
  ref,
  set,
  push,
} from "https://www.gstatic.com/firebasejs/11.0.2/firebase-database.js";
import { SidebarPanel } from "../../Sidebar";

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
const analytics = getAnalytics(app);
const database = getDatabase(app);

function Control() {
  const [secretPass, setSecretPass] = useState("");
  const [name, setName] = useState("");
  const [addBall, setAddBall] = useState("");
  const [isCollapsed, setIsCollapsed] = useState(false);
  const [activeDropdown, setActiveDropdown] = useState(null);

  const toggleSidebar = () => {
    setIsCollapsed(!isCollapsed);
  };

  const toggleDropdown = (index) => {
    setActiveDropdown(activeDropdown === index ? null : index);
  };

  const handleSubmit = (e) => {
    e.preventDefault();

    const secretPassRef = ref(database, "secretPass");

    const newSecretPassRef = push(secretPassRef);
    set(newSecretPassRef, {
      secretPass: secretPass,
      isUsed: false,
      open: true,
    })
      .then(() => {
        alert("SecretPass added successfully");
        setSecretPass("");
      })
      .catch((error) => {
        console.error("Error adding secretPass: ", error);
      });
  };

  const save = () => {
    if (name && addBall) {
      set(ref(database, "Users/" + name + addBall), {
        name: name,
        ball: addBall,
      })
        .then(() => {
          alert("User saved successfully");
          setName("");
          setAddBall("");
        })
        .catch((error) => {
          console.error("Error saving data: ", error);
        });
    } else {
      alert("Please enter a valid name and ball.");
    }
  };

  return (
    <div className="control">
      <SidebarPanel />
      <div
        className={style.mainControl}
        style={{
          marginLeft: "var(--sidebar-width, 250px)",
          width: "var(--sidebar-width), 100%",
          transition: "all 0.5s ease, background 0.3s ease, width 0.5s ease",
        }}
      >
        <h2>Control Panel</h2>

        <div className={style.formGroup}>
          <div className={style.userAdd}>
            <label htmlFor="name">Name:</label>
            <input
              type="text"
              id="name"
              value={name}
              onChange={(e) => setName(e.target.value)}
            />
            <label htmlFor="addBall">Ball:</label>
            <input
              type="text"
              id="addBall"
              value={addBall}
              onChange={(e) => setAddBall(e.target.value)}
            />
            <button onClick={save}>Save User</button>
          </div>
          <form className={style.secretPassAdd} onSubmit={handleSubmit}>
            <label htmlFor="secretPass">Secret Pass:</label>
            <input
              type="text"
              id="secretPass"
              value={secretPass}
              onChange={(e) => setSecretPass(e.target.value)}
            />
            <button type="submit">Add Secret Pass</button>
          </form>
        </div>
            <h1 className="text-2xl font-bold">
              Hello world
            </h1>
      </div>
    </div>
  );
}

export default Control;
