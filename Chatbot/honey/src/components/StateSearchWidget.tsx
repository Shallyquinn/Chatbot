import React, { useState, useEffect } from "react";
import { ActionProviderInterface } from "../chatbot/ActionProvider";
import { searchStates } from "../data/nigerianStates";

interface StateSearchWidgetProps {
  states: string[];
  actionProvider: ActionProviderInterface;
  onStateSelect: (state: string) => void;
}

const StateSearchWidget: React.FC<StateSearchWidgetProps> = ({
  states,
  actionProvider,
  onStateSelect,
}) => {
  const [searchTerm, setSearchTerm] = useState("");
  const [filteredStates, setFilteredStates] = useState(states);
  const [isOpen, setIsOpen] = useState(false);

  useEffect(() => {
    if (searchTerm.trim() === "") {
      setFilteredStates(states);
    } else {
      const searchResults = searchStates(searchTerm);
      setFilteredStates(searchResults.map((result) => result.name));
    }
  }, [searchTerm, states]);

  const handleStateSelect = (state: string) => {
    setSearchTerm(state);
    setIsOpen(false);
    onStateSelect(state);
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchTerm(e.target.value);
    setIsOpen(true);
  };

  const handleInputFocus = () => {
    setIsOpen(true);
  };

  const handleInputBlur = () => {
    // Delay hiding to allow for state selection
    setTimeout(() => setIsOpen(false), 200);
  };

  return (
    <div className="location-search-widget flex !justify-start w-full max-w-sm relative bg-white rounded-2xl shadow-2xs">
      <div className="search-filter-container">
        <div className="mb-2">
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Please select a state first to see .
          </label>
          <div className="mt-3 text-xs text-gray-500">
            💡 You can type the full name or part of your state name to find it
            quickly
          </div>
          <input
            type="text"
            value={searchTerm}
            onChange={handleInputChange}
            onFocus={handleInputFocus}
            onBlur={handleInputBlur}
            placeholder="Type to search states..."
            className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-emerald-600 focus:border-emerald-600"
          />
        </div>

        {isOpen && filteredStates.length > 0 && (
          <div className="absolute z-10 w-full bg-white border border-gray-300 rounded-md shadow-lg max-h-50 overflow-y-auto">
            {filteredStates.slice(0, 10).map((state, index) => (
              <button
                key={index}
                onMouseDown={(e) => {
                  e.preventDefault(); // Prevent the input from losing focus
                  handleStateSelect(state);
                }}
                className="w-full px-3 py-2 text-left hover:bg-emerald-50 hover:text-emerald-800 border-b border-gray-100 last:border-b-0 transition-colors duration-150"
              >
                {state}
              </button>
            ))}
            {filteredStates.length > 10 && (
              <div className="px-3 py-2 text-sm text-gray-500 bg-gray-50">
                Showing 10 of {filteredStates.length} results. Continue typing
                to narrow down.
              </div>
            )}
          </div>
        )}

        {isOpen && filteredStates.length === 0 && searchTerm.trim() !== "" && (
          <div className="absolute z-10 w-full bg-white border border-gray-300 rounded-md shadow-lg p-3 text-gray-500">
            No states found matching "{searchTerm}"
          </div>
        )}
      </div>
    </div>
  );
};

export default StateSearchWidget;
