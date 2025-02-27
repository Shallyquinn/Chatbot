import React, { useState } from "react";
import { supabase } from "../supabaseClient";
import PropTypes from "prop-types";

const CustomButton = ({ options, questionId, userId, category }) => {
  const [selectedOption, setSelectedOption] = useState(null);
  const [showOptions, setShowOptions] = useState(false);

  const handleOptionSelect = async (option) => {
    setSelectedOption(option);
    setShowOptions(false);

    const tableName = category === "demographics" ? "user_demographics" : "user_interactions";

    const { data, error } = await supabase
      .from(tableName)
      .upsert([{ user_id: userId, question_id: questionId, selected_option: option }]);

    if (error) {
      console.error("Error saving selection:", error);
    } else {
      console.log("Selection saved successfully:", data);
    }
  };

  return (
    <div className="relative inline-block">
      <button
        className="px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-700 focus:outline-none"
        onClick={() => setShowOptions(!showOptions)}
      >
        {selectedOption || "Select an option"}
      </button>
      {showOptions && (
        <div className="absolute bg-white shadow-md rounded-lg mt-2 w-full">
          {options.map((option, index) => (
            <button
              key={index}
              className="block w-full text-left px-4 py-2 hover:bg-gray-200"
              onClick={() => handleOptionSelect(option)}
            >
              {option}
            </button>
          ))}
        </div>
      )}
    </div>
  );
};


CustomButton.propTypes = {
  options: PropTypes.arrayOf(PropTypes.string).isRequired,
  questionId: PropTypes.oneOfType([PropTypes.string, PropTypes.number]).isRequired,
  userId: PropTypes.oneOfType([PropTypes.string, PropTypes.number]).isRequired,
  category: PropTypes.string.isRequired,
};

export default CustomButton;