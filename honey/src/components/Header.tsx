import React, { useState, useEffect, useRef } from 'react';
import ThemeDropdown from './ThemeDropdown';
import { Search, X, MessageSquare, FileText, Users, TrendingUp } from 'lucide-react';

interface HeaderProps {
  /** Custom class name for additional styling */
  className?: string;
  /** Path to the profile image */
  profileImage?: string;
  /** Whether to show the search button */
  showSearch?: boolean;
  /** Callback when search is clicked */
  onSearchClick?: () => void;
}

interface SearchResult {
  id: string;
  type: 'conversation' | 'topic' | 'user' | 'statistic';
  title: string;
  description: string;
  icon: React.ComponentType<{ className?: string }>;
}

const Header: React.FC<HeaderProps> = ({
  className = '',
  profileImage = './Honey_profile_pic.png',
  showSearch = true,
  onSearchClick,
}) => {
  const [imageError, setImageError] = useState(false);
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState<SearchResult[]>([]);
  const [isSearching, setIsSearching] = useState(false);
  const searchRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  // Mock search data - In production, this would come from your API
  const allSearchableItems: SearchResult[] = [
    {
      id: '1',
      type: 'conversation',
      title: 'Recent Chat: Family Planning Methods',
      description: 'Discussion about contraceptive options',
      icon: MessageSquare,
    },
    {
      id: '2',
      type: 'topic',
      title: 'Prevent Pregnancy',
      description: 'Information about pregnancy prevention methods',
      icon: FileText,
    },
    {
      id: '3',
      type: 'topic',
      title: 'Get Pregnant',
      description: 'Guidance on conception and fertility',
      icon: FileText,
    },
    {
      id: '4',
      type: 'topic',
      title: 'Emergency Contraception',
      description: 'Information about morning-after pills',
      icon: FileText,
    },
    {
      id: '5',
      type: 'user',
      title: 'Active Users',
      description: 'View currently active users',
      icon: Users,
    },
    {
      id: '6',
      type: 'statistic',
      title: 'Dashboard Metrics',
      description: 'View analytics and statistics',
      icon: TrendingUp,
    },
    {
      id: '7',
      type: 'conversation',
      title: 'Chat History',
      description: 'Browse past conversations',
      icon: MessageSquare,
    },
    {
      id: '8',
      type: 'topic',
      title: 'Birth Control Pills',
      description: 'Information about oral contraceptives',
      icon: FileText,
    },
    {
      id: '9',
      type: 'topic',
      title: 'IUD Information',
      description: 'Details about intrauterine devices',
      icon: FileText,
    },
    {
      id: '10',
      type: 'topic',
      title: 'Condom Usage',
      description: 'Guide on proper condom use',
      icon: FileText,
    },
  ];

  // Handle search
  useEffect(() => {
    if (searchQuery.trim() === '') {
      setSearchResults([]);
      setIsSearching(false);
      return;
    }

    setIsSearching(true);
    const timer = setTimeout(() => {
      const filtered = allSearchableItems.filter(
        (item) =>
          item.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
          item.description.toLowerCase().includes(searchQuery.toLowerCase())
      );
      setSearchResults(filtered);
      setIsSearching(false);
    }, 300); // Debounce search

    return () => clearTimeout(timer);
  }, [searchQuery]);

  // Close search on outside click
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (searchRef.current && !searchRef.current.contains(event.target as Node)) {
        setIsSearchOpen(false);
      }
    };

    if (isSearchOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [isSearchOpen]);

  // Focus input when search opens
  useEffect(() => {
    if (isSearchOpen && inputRef.current) {
      inputRef.current.focus();
    }
  }, [isSearchOpen]);

  const handleSearchClick = () => {
    setIsSearchOpen(!isSearchOpen);
    if (!isSearchOpen) {
      onSearchClick?.();
    }
  };

  const handleResultClick = (result: SearchResult) => {
    console.log('Selected:', result);
    setIsSearchOpen(false);
    setSearchQuery('');
    // In production, navigate to the selected item
  };

  const getTypeColor = (type: string) => {
    switch (type) {
      case 'conversation':
        return 'bg-blue-100 text-blue-700';
      case 'topic':
        return 'bg-green-100 text-green-700';
      case 'user':
        return 'bg-purple-100 text-purple-700';
      case 'statistic':
        return 'bg-orange-100 text-orange-700';
      default:
        return 'bg-gray-100 text-gray-700';
    }
  };

  return (
    <div
      className={`flex flex-row items-center bg-[#006045] dark:bg-emerald-900 justify-between px-3 sm:px-4 py-3 transition-colors duration-300 ${className}`}
      data-component="header"
    >
      <div className="flex justify-between w-full flex-1">
        <div className="flex-row flex">
          {/* Profile Image */}
          <div className="w-15 h-15 sm:h-20 sm:w-20 rounded-full flex items-center justify-center mr-2 sm:mr-3 overflow-hidden">
            {!imageError ? (
              <img
                alt="Honey Chatbot Profile"
                className="w-full h-full object-cover"
                src={'/Honey_profile_pic.png'}
                onError={() => setImageError(true)}
              />
            ) : (
              <div className="flex items-center justify-center w-full h-full text-emerald-800 text-2xl font-semibold">
                H
              </div>
            )}
          </div>

          {/* Title and Subtitle */}
          <div className="flex flex-col items-start">
            <span className="text-white text-base sm:text-lg font-semibold mb-0">
              Honey Chatbot
            </span>
            <span className="text-white text-opacity-80 text-xs sm:text-sm">
              Family Planning Assistant
            </span>
          </div>
        </div>

        {/* Right section: Icons */}
        <div className="flex items-center space-x-4 sm:space-x-2 relative">
          {showSearch && (
            <div className="relative" ref={searchRef}>
              <button
                onClick={handleSearchClick}
                className="p-1 sm:p-1.5 text-white hover:bg-emerald-700 rounded-full transition focus:outline-none focus:ring-2 focus:ring-white focus:ring-opacity-50"
                aria-label="Search"
                title="Search"
              >
                {isSearchOpen ? (
                  <X className="md:h-8 md:w-8 sm:h-6 sm:w-6" />
                ) : (
                  <Search className="md:h-8 md:w-8 sm:h-6 sm:w-6" />
                )}
              </button>

              {/* Search Modal */}
              {isSearchOpen && (
                <div className="absolute right-0 top-full mt-2 w-96 max-w-[90vw] bg-white rounded-lg shadow-2xl border border-gray-200 z-50">
                  {/* Search Input */}
                  <div className="p-4 border-b border-gray-200">
                    <div className="relative">
                      <Search className="absolute right-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
                      <input
                        ref={inputRef}
                        type="text"
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        placeholder="Search conversations, topics, users..."
                        className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 text-gray-900 placeholder-gray-500"
                      />
                      {searchQuery && (
                        <button
                          onClick={() => setSearchQuery('')}
                          className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
                          aria-label="Clear search"
                          title="Clear search"
                        >
                          <X className="h-4 w-4" />
                        </button>
                      )}
                    </div>
                  </div>

                  {/* Search Results */}
                  <div className="max-h-96 overflow-y-auto">
                    {isSearching ? (
                      <div className="p-8 text-center">
                        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-emerald-600 mx-auto"></div>
                        <p className="text-gray-500 text-sm mt-2">Searching...</p>
                      </div>
                    ) : searchQuery && searchResults.length === 0 ? (
                      <div className="p-8 text-center">
                        <FileText className="h-12 w-12 text-gray-300 mx-auto mb-2" />
                        <p className="text-gray-500 text-sm">No results found for "{searchQuery}"</p>
                      </div>
                    ) : searchResults.length > 0 ? (
                      <div className="py-2">
                        {searchResults.map((result) => {
                          const IconComponent = result.icon;
                          return (
                            <button
                              key={result.id}
                              onClick={() => handleResultClick(result)}
                              className="w-full px-4 py-3 hover:bg-gray-50 transition-colors text-left flex items-start gap-3"
                            >
                              <div className={`p-2 rounded-lg ${getTypeColor(result.type)}`}>
                                <IconComponent className="h-4 w-4" />
                              </div>
                              <div className="flex-1 min-w-0">
                                <p className="text-sm font-medium text-gray-900 truncate">
                                  {result.title}
                                </p>
                                <p className="text-xs text-gray-500 truncate">
                                  {result.description}
                                </p>
                              </div>
                            </button>
                          );
                        })}
                      </div>
                    ) : (
                      <div className="p-8 text-center">
                        <Search className="h-12 w-12 text-gray-300 mx-auto mb-2" />
                        <p className="text-gray-500 text-sm">Start typing to search...</p>
                        <p className="text-gray-400 text-xs mt-1">
                          Try searching for topics, conversations, or users
                        </p>
                      </div>
                    )}
                  </div>
                </div>
              )}
            </div>
          )}
          <ThemeDropdown />
        </div>
      </div>
    </div>
  );
};

export default Header;
