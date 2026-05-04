
const KPICard = ({ title, value, subtitle, icon, color }) => {
  const colorClasses = {
    blue: 'bg-blue-500',
    purple: 'bg-purple-500',
    green: 'bg-green-500',
    emerald: 'bg-emerald-600'
  };

  return (
    <div className="bg-white rounded-2xl shadow-xl p-6 border-l-4 border-emerald-500">
      <div className="flex items-center justify-between">
        <div className="flex-1">
          <p className="text-sm font-medium text-gray-600 mb-1">{title}</p>
          <p className="text-3xl font-bold text-gray-900">{value}</p>
          {subtitle && (
            <p className="text-xs text-gray-500 mt-1">{subtitle}</p>
          )}
        </div>
        <div className={`${colorClasses[color] || 'bg-gray-500'} text-white p-3 rounded-lg`}>
          {icon}
        </div>
      </div>
    </div>
  );
};

export default KPICard;
