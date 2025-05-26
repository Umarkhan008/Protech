import { HiOutlineCurrencyDollar } from "react-icons/hi2";
import { MdOutlineCurrencyExchange } from "react-icons/md";
import { IoStatsChartSharp } from "react-icons/io5";
import { GrMoney } from "react-icons/gr";
import React, { useState, useEffect } from "react";
import style from './Sidebar.module.css'
import { Link } from 'react-router-dom';

export function SidebarPanel() {
  const [isCollapsed, setIsCollapsed] = useState(true);
  const [activeDropdown, setactiveDropdown] = useState(null);
  const [ActiveDropdown, setActiveDropdown] = useState(false);

  const toggleSidebar = () => {
    setIsCollapsed(!isCollapsed);
  };

  const toggleDropdown = (index) => {
    setactiveDropdown(activeDropdown === index ? null : index);
  };

  useEffect(() => {
    document.documentElement.style.setProperty("--sidebar-width", isCollapsed ? "80px" : "250px")
  }, [isCollapsed])

  const toggledropDown = () => {
    setActiveDropdown(!ActiveDropdown)
  }

  return (
    <>
      <div
        className={style.toggleBtn}
        onClick={() => {
          toggleSidebar()
          setActiveDropdown(false)
          setactiveDropdown(null)
        }}
        style={{
          marginLeft: "var(--sidebar-width, 250px)",
          transition: "all 0.5s ease, background 0.3s ease, width 0.5s ease",
        }}
      >
        <i
          className={`fas ${isCollapsed ? "fa-chevron-right" : "fa-chevron-left"
            } ${style.toggleIcon}`}
        ></i>
      </div>
      <div className={`${style.sidebar} ${isCollapsed ? style.collapsed : ""}`}>
        <div className={style.sidebarHeader}>
          <h3 className={style.brand}>
            <i className="fas fa-anchor"></i>
            <span>MyApp</span>
          </h3>
        </div>
        <ul className={style.navLinks}>
          <li>
            <Link to="/panel" className={style.navItem}>
              <span className={style.navIcon}>
                <i className="fas fa-home"></i>
              </span>
              <span>Home</span>
            </Link>
          </li>
          <li>
            <Link to="/control" className={style.navItem}>
              <span className={style.navIcon}>
                <i className="fa-solid fa-sliders"></i>
              </span>
              <span>Boshqaruv</span>
            </Link>
          </li>
          <li>
            <Link to="/groups" className={style.navItem}>
              <span className={style.navIcon}>
                <i className="fas fa-users"></i>
              </span>
              <span>Guruhlar</span>
            </Link>
          </li>
          <li>
            <Link to="/students" className={style.navItem}>
              <span className={style.navIcon}>
                <i className="fas fa-user"></i>
              </span>
              <span>Talabalar</span>
            </Link>
          </li>
          <li
            className={`${style.dropdown} ${ActiveDropdown ? style.active : ""}`}
          >
            <a
              href="#"
              className={`${style.navItem} ${style.dropdownToggle}`}
              onClick={() => {
                if (isCollapsed) {
                  setIsCollapsed(false)
                  toggledropDown()
                } else {
                  toggledropDown()
                }
              }}
            >
              <div>
                <span className={style.navIcon}>
                  <i className="fa-solid fa-chart-line"></i>
                </span>
                <span>Dashboard</span>
              </div>
              <i
                className={`fas ${ActiveDropdown ? "fa-chevron-down" : "fa-chevron-right"} ${style.dropdownIcon}`}
              ></i>
            </a>
            <ul className={`${style.dropdownMenu}`}>
              <li>
                <Link to="/expenses" className={style.dropdownItem}>
                  <GrMoney />
                  Xarajatlar
                </Link>
              </li>
              <li>
                <Link to="/inputAndOutput" className={style.dropdownItem}>
                  <MdOutlineCurrencyExchange className="text-[20px]" />
                  Kirim va chiqim
                </Link>
              </li>
              <li>
                <Link to="/debtadStudents" className={style.dropdownItem}>
                  <HiOutlineCurrencyDollar className="text-[25px]" />
                  Qarzdorlar
                </Link>
              </li>
            </ul>
          </li>
          <li
            className={`
            ${style.dropdown} 
            ${activeDropdown === 0 ? style.active : ""}
            ${ActiveDropdown ? style.dropDownOpen : style.dropDownClose}
            `}
          >
            <a
              href="#"
              className={`${style.navItem} ${style.dropdownToggle}`}
              onClick={() => {
                if (isCollapsed) {
                  // Agar sidebar collapsed bo'lsa, avval uni ochamiz
                  setIsCollapsed(false);
                  setTimeout(() => toggleDropdown(0), 500); // Sidebar ochilgandan keyin dropdownni ochish
                } else {
                  toggleDropdown(0); // Agar sidebar ochiq bo'lsa, faqat dropdownni boshqarish
                }
              }}
            >
              <div>
                <span className={style.navIcon}>
                  <i className="fas fa-cogs"></i>
                </span>
                <span>Sozlamalar</span>
              </div>
              <i
                className={`fas ${activeDropdown === 0 ? "fa-chevron-down" : "fa-chevron-right"} ${style.dropdownIcon}`}
              ></i>
            </a>
            <ul className={style.dropdownMenu}>
              <li>
                <Link to="/course" className={style.dropdownItem}>
                  <i className="fa-regular fa-gem"></i>
                  Kurslar
                </Link>
              </li>
              <li>
                <Link to="/rooms" className={style.dropdownItem}>
                  <i className="fa-solid fa-table-cells-large"></i>
                  Xonalar
                </Link>
              </li>
              <li>
                <Link to="/users" className={style.dropdownItem}>
                  <i className="fa-solid fa-user-group"></i>
                  Xodimlar
                </Link>
              </li>
            </ul>
          </li>
        </ul>
      </div>
    </>
  );
}
