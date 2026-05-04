import React, { useState } from 'react';

const SearchIcon = ({ className }) => (
  <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
  </svg>
);

const XIcon = ({ className }) => (
  <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
  </svg>
);

function AdvancedSearchFilters({ 
  type = 'jobs', // 'jobs' or 'candidates'
  onSearch,
  onClear,
  initialFilters = {}
}) {
  const [filters, setFilters] = useState({
    keyword: initialFilters.keyword || '',
    location: initialFilters.location || '',
    category: initialFilters.category || '',
    dateRange: initialFilters.dateRange || '',
    status: initialFilters.status || '',
    sortBy: initialFilters.sortBy || (type === 'jobs' ? 'createdAt' : 'score'),
    // Candidate-specific filters
    skills: initialFilters.skills || '',
    experienceMin: initialFilters.experienceMin || '',
    experienceMax: initialFilters.experienceMax || '',
    matchScoreMin: initialFilters.matchScoreMin || '',
    matchScoreMax: initialFilters.matchScoreMax || '',
    appliedAfter: initialFilters.appliedAfter || '',
    ...initialFilters
  });

  const [isExpanded, setIsExpanded] = useState(false);

  const handleFilterChange = (key, value) => {
    setFilters(prev => ({ ...prev, [key]: value }));
  };

  const handleSearch = () => {
    const cleanFilters = Object.fromEntries(
      Object.entries(filters).filter(([_, v]) => v !== '' && v !== null)
    );
    onSearch(cleanFilters);
  };

  const handleClear = () => {
    const clearedFilters = {
      keyword: '',
      location: '',
      category: '',
      dateRange: '',
      status: type === 'jobs' ? 'open' : '', // Default to 'open' for jobs, empty for candidates
      sortBy: type === 'jobs' ? 'createdAt' : 'score',
      skills: '',
      experienceMin: '',
      experienceMax: '',
      matchScoreMin: '',
      matchScoreMax: '',
      appliedAfter: ''
    };
    setFilters(clearedFilters);
    onClear();
  };

  const activeFiltersCount = Object.values(filters).filter(v => v !== '' && v !== null).length - 1; // -1 for sortBy

  return (
    <div className="bg-white rounded-lg shadow-md p-4 mb-6">
      {/* Search Bar */}
      <div className="flex items-center space-x-2 mb-4">
        <div className="flex-1 relative">
          <SearchIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
          <input
            type="text"
            placeholder={type === 'jobs' ? 'Search jobs by title, description...' : 'Search candidates by name, skills...'}
            value={filters.keyword}
            onChange={(e) => handleFilterChange('keyword', e.target.value)}
            onKeyPress={(e) => e.key === 'Enter' && handleSearch()}
            className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
          />
        </div>
        <button
          onClick={handleSearch}
          className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 transition-colors"
        >
          Search
        </button>
        {activeFiltersCount > 0 && (
          <button
            onClick={handleClear}
            className="px-4 py-2 text-gray-600 border border-gray-300 rounded-lg hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-blue-500 transition-colors"
          >
            Clear
          </button>
        )}
        <button
          onClick={() => setIsExpanded(!isExpanded)}
          className="px-4 py-2 text-gray-600 border border-gray-300 rounded-lg hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-blue-500 transition-colors"
        >
          {isExpanded ? 'Less' : 'More'} Filters
        </button>
      </div>

      {/* Active Filters Badges */}
      {activeFiltersCount > 0 && (
        <div className="flex flex-wrap gap-2 mb-4">
          {Object.entries(filters).map(([key, value]) => {
            if (value === '' || value === null || key === 'sortBy') return null;
            return (
              <span
                key={key}
                className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-blue-100 text-blue-800"
              >
                {key}: {value}
                <button
                  onClick={() => handleFilterChange(key, '')}
                  className="ml-2 text-blue-600 hover:text-blue-800"
                >
                  <XIcon className="w-4 h-4" />
                </button>
              </span>
            );
          })}
        </div>
      )}

      {/* Expanded Filters */}
      {isExpanded && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 pt-4 border-t border-gray-200">
          {type === 'jobs' ? (
            <>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Location</label>
                <input
                  type="text"
                  value={filters.location}
                  onChange={(e) => handleFilterChange('location', e.target.value)}
                  placeholder="e.g., NYC, Remote"
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Category</label>
                <select
                  value={filters.category}
                  onChange={(e) => handleFilterChange('category', e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                >
                  <option value="">All Categories</option>
                  <option value="AI">AI</option>
                  <option value="Web">Web Development</option>
                  <option value="HR">HR</option>
                  <option value="Data">Data Science</option>
                  <option value="Mobile">Mobile Development</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Date Range</label>
                <select
                  value={filters.dateRange}
                  onChange={(e) => handleFilterChange('dateRange', e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                >
                  <option value="">All Time</option>
                  <option value="7d">Last 7 days</option>
                  <option value="30d">Last 30 days</option>
                  <option value="90d">Last 90 days</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Status</label>
                <select
                  value={filters.status}
                  onChange={(e) => handleFilterChange('status', e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                >
                  <option value="open">Open Jobs</option>
                  <option value="all">All Jobs (Including Closed)</option>
                </select>
              </div>
            </>
          ) : (
            <>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Skills (comma-separated)</label>
                <input
                  type="text"
                  value={filters.skills}
                  onChange={(e) => handleFilterChange('skills', e.target.value)}
                  placeholder="e.g., Python, ML, React"
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Experience (Years)</label>
                <div className="flex space-x-2">
                  <input
                    type="number"
                    value={filters.experienceMin}
                    onChange={(e) => handleFilterChange('experienceMin', e.target.value)}
                    placeholder="Min"
                    min="0"
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  />
                  <input
                    type="number"
                    value={filters.experienceMax}
                    onChange={(e) => handleFilterChange('experienceMax', e.target.value)}
                    placeholder="Max"
                    min="0"
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Match Score</label>
                <div className="flex space-x-2">
                  <input
                    type="number"
                    value={filters.matchScoreMin}
                    onChange={(e) => handleFilterChange('matchScoreMin', e.target.value)}
                    placeholder="Min"
                    min="0"
                    max="100"
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  />
                  <input
                    type="number"
                    value={filters.matchScoreMax}
                    onChange={(e) => handleFilterChange('matchScoreMax', e.target.value)}
                    placeholder="Max"
                    min="0"
                    max="100"
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Applied After</label>
                <input
                  type="date"
                  value={filters.appliedAfter}
                  onChange={(e) => handleFilterChange('appliedAfter', e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Status</label>
                <select
                  value={filters.status}
                  onChange={(e) => handleFilterChange('status', e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                >
                  <option value="">All Status</option>
                  <option value="New">New</option>
                  <option value="Review">Review</option>
                  <option value="Interview">Interview</option>
                  <option value="Rejected">Rejected</option>
                  <option value="Hired">Hired</option>
                </select>
              </div>
            </>
          )}

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Sort By</label>
            <select
              value={filters.sortBy}
              onChange={(e) => handleFilterChange('sortBy', e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            >
              {type === 'jobs' ? (
                <>
                  <option value="createdAt">Newest First</option>
                  <option value="relevance">Relevance</option>
                  <option value="applicants">Most Applicants</option>
                </>
              ) : (
                <>
                  <option value="score">Match Score</option>
                  <option value="recency">Most Recent</option>
                  <option value="name">Name A-Z</option>
                </>
              )}
            </select>
          </div>
        </div>
      )}
    </div>
  );
}

export default AdvancedSearchFilters;

