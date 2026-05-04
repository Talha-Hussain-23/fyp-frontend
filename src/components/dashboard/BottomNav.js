import { BriefcaseIcon, HomeIcon, LogoutIcon, UsersIcon } from '../dashboard/DashboardIcons';

const BottomNav = ({ activeView, onNavigate, onLogout }) => {
  return (
    <div className="lg:hidden fixed bottom-0 left-0 right-0 bg-white border-t border-gray-100 px-2 py-2 z-50 shadow-[0_-4px_10px_rgba(0,0,0,0.05)]">
      <nav className="flex items-center justify-around">
        <button
          onClick={() => onNavigate('overview')}
          className={`flex flex-col items-center p-2 rounded-xl transition-all duration-200 ${
            activeView === 'overview'
              ? 'text-emerald-600'
              : 'text-gray-400'
          }`}
        >
          <HomeIcon className="h-6 w-6" />
          <span className="text-[10px] font-medium mt-1">Home</span>
        </button>
        
        <button
          onClick={() => onNavigate('jobs')}
          className={`flex flex-col items-center p-2 rounded-xl transition-all duration-200 ${
            activeView === 'jobs'
              ? 'text-emerald-600'
              : 'text-gray-400'
          }`}
        >
          <BriefcaseIcon className="h-6 w-6" />
          <span className="text-[10px] font-medium mt-1">Jobs</span>
        </button>
        
        <button
          onClick={() => onNavigate('candidates')}
          className={`flex flex-col items-center p-2 rounded-xl transition-all duration-200 ${
            activeView === 'candidates'
              ? 'text-emerald-600'
              : 'text-gray-400'
          }`}
        >
          <UsersIcon className="h-6 w-6" />
          <span className="text-[10px] font-medium mt-1">Candidates</span>
        </button>

        <button
          onClick={() => onNavigate('reclaims')}
          className={`flex flex-col items-center p-2 rounded-xl transition-all duration-200 ${
            activeView === 'reclaims'
              ? 'text-emerald-600'
              : 'text-gray-400'
          }`}
        >
          <svg 
            className="h-6 w-6"
            fill="none" 
            stroke="currentColor" 
            viewBox="0 0 24 24"
          >
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
          </svg>
          <span className="text-[10px] font-medium mt-1">Reclaims</span>
        </button>

        <button
          onClick={onLogout}
          className="flex flex-col items-center p-2 rounded-xl text-red-500"
        >
          <LogoutIcon className="h-6 w-6" />
          <span className="text-[10px] font-medium mt-1">Exit</span>
        </button>
      </nav>
    </div>
  );
};

export default BottomNav;
