import { BriefcaseIcon, HomeIcon, LogoutIcon, UsersIcon } from './DashboardIcons';

const Sidebar = ({ activeView, onNavigate, onLogout }) => {
  return (
    <div className="w-64 bg-white shadow-xl z-20 hidden lg:flex flex-col border-r border-gray-100">
      <div className="p-6 border-b border-gray-100">
        <h1 className="text-2xl font-bold bg-gradient-to-r from-emerald-600 to-teal-500 bg-clip-text text-transparent">
          SmartHiring
        </h1>
        <p className="text-xs text-gray-500 mt-1">Recruiter Dashboard</p>
      </div>
      <nav className="flex-1 p-4 space-y-2 overflow-y-auto">
        <button
          onClick={() => onNavigate('overview')}
          className={`w-full flex items-center space-x-3 px-4 py-3 rounded-xl transition-all duration-200 group ${
            activeView === 'overview'
              ? 'bg-emerald-50 text-emerald-700 shadow-sm'
              : 'text-gray-600 hover:bg-gray-50 hover:text-emerald-600'
          }`}
        >
          <HomeIcon className={`h-5 w-5 ${activeView === 'overview' ? 'text-emerald-600' : 'text-gray-400 group-hover:text-emerald-500'}`} />
          <span className="font-medium">Overview</span>
        </button>
        <button
          onClick={() => onNavigate('jobs')}
          className={`w-full flex items-center space-x-3 px-4 py-3 rounded-xl transition-all duration-200 group ${
            activeView === 'jobs'
              ? 'bg-emerald-50 text-emerald-700 shadow-sm'
              : 'text-gray-600 hover:bg-gray-50 hover:text-emerald-600'
          }`}
        >
          <BriefcaseIcon className={`h-5 w-5 ${activeView === 'jobs' ? 'text-emerald-600' : 'text-gray-400 group-hover:text-emerald-500'}`} />
          <span className="font-medium">Jobs</span>
        </button>
        <button
          onClick={() => onNavigate('candidates')}
          className={`w-full flex items-center space-x-3 px-4 py-3 rounded-xl transition-all duration-200 group ${
            activeView === 'candidates'
              ? 'bg-emerald-50 text-emerald-700 shadow-sm'
              : 'text-gray-600 hover:bg-gray-50 hover:text-emerald-600'
          }`}
        >
          <UsersIcon className={`h-5 w-5 ${activeView === 'candidates' ? 'text-emerald-600' : 'text-gray-400 group-hover:text-emerald-500'}`} />
          <span className="font-medium">Candidates</span>
        </button>
        
        {/* Reclaims Menu Item */}
        <button
          onClick={() => onNavigate('reclaims')}
          className={`w-full flex items-center space-x-3 px-4 py-3 rounded-xl transition-all duration-200 group ${
            activeView === 'reclaims'
              ? 'bg-emerald-50 text-emerald-700 shadow-sm'
              : 'text-gray-600 hover:bg-gray-50 hover:text-emerald-600'
          }`}
        >
          <svg 
            className={`h-5 w-5 ${activeView === 'reclaims' ? 'text-emerald-600' : 'text-gray-400 group-hover:text-emerald-500'}`}
            fill="none" 
            stroke="currentColor" 
            viewBox="0 0 24 24"
          >
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
          </svg>
          <span className="font-medium">Reclaims</span>
        </button>
        
        {/* Emails Menu Item */}
        <button
          onClick={() => onNavigate('emails')}
          className={`w-full flex items-center space-x-3 px-4 py-3 rounded-xl transition-all duration-200 group ${
            activeView === 'emails'
              ? 'bg-emerald-50 text-emerald-700 shadow-sm'
              : 'text-gray-600 hover:bg-gray-50 hover:text-emerald-600'
          }`}
        >
          <svg 
            className={`h-5 w-5 ${activeView === 'emails' ? 'text-emerald-600' : 'text-gray-400 group-hover:text-emerald-500'}`}
            fill="none" 
            stroke="currentColor" 
            viewBox="0 0 24 24"
          >
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
          </svg>
          <span className="font-medium">Emails</span>
        </button>
      </nav>
      <div className="p-4 border-t border-gray-100">
        <button
          onClick={onLogout}
          className="w-full flex items-center space-x-3 px-4 py-3 rounded-xl text-red-600 hover:bg-red-50 transition-colors duration-200 group"
        >
          <LogoutIcon className="h-5 w-5 text-red-400 group-hover:text-red-600" />
          <span className="font-medium">Sign Out</span>
        </button>
      </div>
    </div>
  );
};

export default Sidebar;
