const StatCard = ({ title, value, icon: Icon, change, changeType = "positive" }) => (
  <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
    <div className="flex items-center justify-between">
      <div>
        <p className="text-sm font-medium text-gray-600">{title}</p>
        <p className="text-2xl font-bold text-gray-900">{value}</p>
        {change && (
          <div className="flex items-center mt-2">
            <span className={`text-sm font-medium ${
              changeType === "positive" ? "text-green-600" : "text-red-600"
            }`}>
              {changeType === "positive" ? "+" : "-"}{change}
            </span>
            <span className="text-sm text-gray-500 ml-1">from last month</span>
          </div>
        )}
      </div>
      <div className={`p-3 rounded-full ${
        changeType === "positive" ? "bg-green-100" : "bg-red-100"
      }`}>
        <Icon className={`w-6 h-6 ${
          changeType === "positive" ? "text-green-600" : "text-red-600"
        }`} />
      </div>
    </div>
  </div>
);

export default StatCard;


