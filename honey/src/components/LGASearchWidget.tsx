import React, { useState, useEffect } from 'react';
import { ActionProviderInterface } from '../chatbot/ActionProvider';
import { getLGAsByState } from '../data/nigerianStates';

interface LGASearchWidgetProps {
  selectedState: string;
  actionProvider: ActionProviderInterface;
  onLGASelect: (lga: string) => void;
}

const LGASearchWidget: React.FC<LGASearchWidgetProps> = ({
  selectedState,
  actionProvider,
  onLGASelect,
}) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [filteredLGAs, setFilteredLGAs] = useState<string[]>([]);
  const [allLGAs, setAllLGAs] = useState<string[]>([]);
  const [isOpen, setIsOpen] = useState(false);

  useEffect(() => {
    if (selectedState) {
      const stateLGAs = getLGAsByState(selectedState);
      const lgaNames = stateLGAs.map((lga) => lga.name);
      setAllLGAs(lgaNames);
      setFilteredLGAs(lgaNames);
    }
  }, [selectedState]);

  useEffect(() => {
    if (searchTerm.trim() === '') {
      setFilteredLGAs(allLGAs);
    } else {
      const filtered = allLGAs.filter((lga) =>
        lga.toLowerCase().includes(searchTerm.toLowerCase()),
      );
      setFilteredLGAs(filtered);
    }
  }, [searchTerm, allLGAs]);

  const handleLGASelect = (lga: string) => {
    setSearchTerm(lga);
    setIsOpen(false);
    onLGASelect(lga);
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchTerm(e.target.value);
    setIsOpen(true);
  };

  const handleInputFocus = () => {
    setIsOpen(true);
  };

  const handleInputBlur = () => {
    // Delay hiding to allow for LGA selection
    setTimeout(() => setIsOpen(false), 200);
  };

  if (!selectedState) {
    return (
      <div className="lga-search-widget w-full max-w-sm">
        <div className="text-gray-500 text-sm">
          Search and select your LGAs from the available list:
        </div>
      </div>
    );
  }

  return (
    <div className="location-search-widget !justify-start w-full max-w-sm relative bg-white rounded-2xl shadow-2xs">
      <div className="mb-2">
        <label className="block text-sm font-medium text-gray-700 mb-1">
          Search and select your LGA in {selectedState}:
        </label>
        <input
          type="text"
          value={searchTerm}
          onChange={handleInputChange}
          onFocus={handleInputFocus}
          onBlur={handleInputBlur}
          placeholder="Type to search LGAs..."
          className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-emerald-600 focus:border-emerald-600"
        />
      </div>

      {isOpen && filteredLGAs.length > 0 && (
        <div className="absolute z-10 w-full bg-white border border-gray-300 rounded-md shadow-lg max-h-60 overflow-y-auto">
          {filteredLGAs.slice(0, 15).map((lga, index) => (
            <button
              key={index}
              onMouseDown={(e) => {
                e.preventDefault(); // Prevent the input from losing focus
                handleLGASelect(lga);
              }}
              className="w-full px-3 py-2 text-left hover:bg-emerald-50 hover:text-emerald-700 border-b border-gray-100 last:border-b-0 transition-colors duration-150"
            >
              {lga}
            </button>
          ))}
          {filteredLGAs.length > 15 && (
            <div className="px-3 py-2 text-sm text-gray-500 bg-gray-50">
              Showing 15 of {filteredLGAs.length} results. Continue typing to
              narrow down.
            </div>
          )}
        </div>
      )}

      {isOpen && filteredLGAs.length === 0 && searchTerm.trim() !== '' && (
        <div className="absolute z-10 w-full bg-white border border-gray-300 rounded-md shadow-lg p-3 text-gray-500">
          No LGAs found matching "{searchTerm}" in {selectedState}
        </div>
      )}

      <div className="mt-3 text-xs text-gray-500">
        💡 Found {allLGAs.length} LGAs in {selectedState}. Type to search
        quickly!
      </div>

      {allLGAs.length === 0 && (
        <div className="mt-2 text-sm text-red-500">
          No LGAs found for {selectedState}. Please contact support.
        </div>
      )}
    </div>
  );
};

export default LGASearchWidget;
