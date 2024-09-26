// src/components/Modal.js
import React from "react";

const Modal = ({ title, onConfirm, onClose }) => {
  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-[#5A00EE] rounded-lg shadow-lg p-8 w-96">
        <h2 className="text-xl font-semibold mb-4">{title}</h2>
        <div className="flex justify-end gap-4">
          <button
            onClick={onClose}
            className="bg-gray-300 hover:bg-gray-400 text-gray-800 font-semibold py-2 px-4 rounded"
          >
            Cancel
          </button>
          <button
            onClick={onConfirm}
            className="bg-red-500 hover:bg-red-600 text-white font-semibold py-2 px-4 rounded"
          >
            Confirm
          </button>
        </div>
      </div>
    </div>
  );
};

export default Modal;
