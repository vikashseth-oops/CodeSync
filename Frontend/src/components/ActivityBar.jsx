import { 
  Files, 
  Search, 
  Users, 
  Radio, 
  Settings
} from 'lucide-react';
import UserAvatar from './UserAvatar';

export default function ActivityBar({
  activeView,
  onSelectView,
  collaboratorCount = 0,
  currentUser,
  onNavigateHome,
}) {
  const topButtons = [
    { id: 'explorer', label: 'Explorer (files)', icon: Files },
    { id: 'search', label: 'Search in files', icon: Search },
    { id: 'collaborators', label: 'Collaborators', icon: Users, badge: collaboratorCount },
    { id: 'activity', label: 'Live Activity', icon: Radio },
    { id: 'settings', label: 'Settings', icon: Settings },
  ];

  return (
    <aside className="w-10 bg-[#17171a] border-r border-[#2e2e35] flex flex-col justify-between items-center py-2 select-none z-10 flex-shrink-0">
      {/* Top action icons */}
      <div className="flex flex-col items-center gap-0.5 w-full">
        {topButtons.map(btn => {
          const Icon = btn.icon;
          const isActive = activeView === btn.id;
          return (
            <button
              key={btn.id}
              onClick={() => onSelectView(btn.id)}
              title={btn.label}
              className={`relative w-full h-10 flex items-center justify-center transition-colors cursor-pointer group ${
                isActive ? 'text-white' : 'text-[#5c5c6a] hover:text-[#9999a8]'
              }`}
            >
              {/* Active left indicator */}
              {isActive && (
                <span className="absolute left-0 top-2 bottom-2 w-0.5 bg-[#6366f1] rounded-r" />
              )}
              <Icon className={`w-4 h-4 transition-transform ${isActive ? '' : 'group-hover:scale-110'}`} />
              {/* Collaborator badge */}
              {btn.badge !== undefined && btn.badge > 0 && (
                <span className="absolute top-1.5 right-1 w-3.5 h-3.5 rounded-full bg-[#6366f1] text-white text-[8px] font-bold flex items-center justify-center">
                  {btn.badge > 9 ? '9+' : btn.badge}
                </span>
              )}
            </button>
          );
        })}
      </div>

      {/* Bottom: user avatar */}
      <div className="flex flex-col items-center gap-1 w-full">
        <button
          onClick={onNavigateHome}
          title={`${currentUser?.name || 'User'} — Back to Dashboard`}
          className="w-full h-10 flex items-center justify-center cursor-pointer"
        >
          <UserAvatar
            name={currentUser?.name || 'Developer'}
            customColor={currentUser?.color}
            size={24}
            showStatus={true}
            isOnline={true}
          />
        </button>
      </div>
    </aside>
  );
}



