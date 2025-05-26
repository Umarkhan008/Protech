import { toast } from "react-toastify"
import { RiDeleteBin6Line } from "react-icons/ri"
import { FiPlusCircle } from "react-icons/fi"
import { LuFilePenLine } from "react-icons/lu";

const DelateNotify = ({ DelateTitle, Icon }) => {
    toast.success(
        <div className="flex items-center justify-between w-full">
            {!Icon ? <RiDeleteBin6Line size={25} color="#ff0000" /> : <Icon size={25} color="#ff0000" />}
            <span className="text-xl" style={{ color: "#ff0000" }}>{DelateTitle || "O‘chirildi!"}</span>
        </div>,
        {
            autoClose: 3000,
            hideProgressBar: false,
            closeOnClick: true,
            closeButton: false,
            icon: false,
            position: "top-right",
            progressClassName: "progressRedBackground"
        }
    );
};

const AddNotify = ({ AddTitle }) => {
    toast.success(
        <div className="flex items-center justify-between w-full">
            <FiPlusCircle size={25} color="#078625" />
            <span className="text-xl" style={{ color: "#078625" }}>{AddTitle || "Qo‘shildi!"}</span>
        </div>,
        {
            autoClose: 3000,
            hideProgressBar: false,
            closeOnClick: true,
            closeButton: false,
            icon: false,
            position: "top-right",
            progressClassName: "progressGreenBackground"
        }
    );
};

const ChengeNotify = ({ ChengeTitle }) => {
    toast.success(
        <div className="flex items-center justify-between w-full">
            <LuFilePenLine size={25} color="#5f54fe" />
            <span className="text-xl" style={{ color: "#5f54fe" }}>{ChengeTitle || "O‘zgartirildi"}!</span>
        </div>,
        {
            autoClose: 3000,
            hideProgressBar: false,
            closeOnClick: true,
            closeButton: false,
            icon: false,
            position: "top-right",
            progressClassName: "progressBlueBackground"
        }
    );
};

const CompletedNotify = () => {
    toast.success(
        <div className="flex items-center justify-between w-full">
            <FiPlusCircle size={25} color="#078625" />
            <span className="text-xl" style={{ color: "#078625" }}>Tugatildi!</span>
        </div>,
        {
            autoClose: 3000,
            hideProgressBar: false,
            closeOnClick: true,
            closeButton: false,
            icon: false,
            position: "top-right",
            progressClassName: "progressGreenBackground"
        }
    );
};

export { DelateNotify, AddNotify, ChengeNotify, CompletedNotify }