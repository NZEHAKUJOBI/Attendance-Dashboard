import PropTypes from "prop-types";

const DeviceStatusBadge = ({ isOnline, lastSeen }) => {
  const getStatusColor = () => {
    if (!isOnline) return "bg-red-100 text-red-800";

    const now = new Date();
    const lastSeenDate = new Date(lastSeen);
    const diffMinutes = (now - lastSeenDate) / (1000 * 60);

    if (diffMinutes < 5) return "bg-green-100 text-green-800";
    if (diffMinutes < 30) return "bg-yellow-100 text-yellow-800";
    return "bg-red-100 text-red-800";
  };

  const getStatusText = () => {
    if (!isOnline) return "Offline";

    const now = new Date();
    const lastSeenDate = new Date(lastSeen);
    const diffMinutes = (now - lastSeenDate) / (1000 * 60);

    if (diffMinutes < 5) return "Online";
    if (diffMinutes < 30) return "Warning";
    return "Offline";
  };

  return (
    <span
      className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getStatusColor()}`}
    >
      <span
        className={`w-2 h-2 rounded-full mr-1 ${
          isOnline ? "bg-current" : "bg-current"
        }`}
      ></span>
      {getStatusText()}
    </span>
  );
};

DeviceStatusBadge.propTypes = {
  isOnline: PropTypes.bool.isRequired,
  lastSeen: PropTypes.string.isRequired,
};

export default DeviceStatusBadge;
