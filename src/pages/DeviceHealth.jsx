import { useEffect, useState } from "react";
import api from "../api/axios";
import Card from "../components/Card";
import StatCard from "../components/StatCard";
import LoadingSpinner from "../components/LoadingSpinner";
import DeviceStatusBadge from "../components/DeviceStatusBadge";

export default function DeviceHealth() {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [devices, setDevices] = useState([]);
  const [filteredDevices, setFilteredDevices] = useState([]);
  const [filters, setFilters] = useState({
    status: "all", // all, online, offline
    facility: "all",
    state: "all",
  });
  const [searchTerm, setSearchTerm] = useState("");

  useEffect(() => {
    const fetchDevices = async () => {
      try {
        setLoading(true);
        setError(null);
        const response = await api.get("/health/status");
        setDevices(response.data);
        setFilteredDevices(response.data);
      } catch (err) {
        console.error("Error fetching device health:", err);
        setError("Failed to load device health data. Please try again.");
      } finally {
        setLoading(false);
      }
    };

    fetchDevices();

    // Auto-refresh every 15 seconds
    const interval = setInterval(fetchDevices, 15000);
    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    let filtered = devices;

    // Filter by status
    if (filters.status !== "all") {
      filtered = filtered.filter((device) =>
        filters.status === "online" ? device.isOnline : !device.isOnline
      );
    }

    // Filter by facility
    if (filters.facility !== "all") {
      filtered = filtered.filter(
        (device) => device.facility === filters.facility
      );
    }

    // Filter by state
    if (filters.state !== "all") {
      filtered = filtered.filter(
        (device) => device.facilityState === filters.state
      );
    }

    // Filter by search term
    if (searchTerm) {
      filtered = filtered.filter(
        (device) =>
          device.deviceName.toLowerCase().includes(searchTerm.toLowerCase()) ||
          device.facility.toLowerCase().includes(searchTerm.toLowerCase()) ||
          device.facilityState
            .toLowerCase()
            .includes(searchTerm.toLowerCase()) ||
          device.facilityLga.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    setFilteredDevices(filtered);
  }, [devices, filters, searchTerm]);

  // Calculate statistics
  const stats = {
    totalDevices: devices.length,
    onlineDevices: devices.filter((d) => d.isOnline).length,
    offlineDevices: devices.filter((d) => !d.isOnline).length,
    uniqueFacilities: new Set(devices.map((d) => d.facility)).size,
    uniqueStates: new Set(devices.map((d) => d.facilityState)).size,
  };

  const getUniqueValues = (key) => {
    return [...new Set(devices.map((device) => device[key]))].sort();
  };

  const getDeviceStatusColor = (device) => {
    if (!device.isOnline) return "border-red-200 bg-red-50";

    const now = new Date();
    const lastSeen = new Date(device.lastSeen);
    const diffMinutes = (now - lastSeen) / (1000 * 60);

    if (diffMinutes < 5) return "border-green-200 bg-green-50";
    if (diffMinutes < 30) return "border-yellow-200 bg-yellow-50";
    return "border-red-200 bg-red-50";
  };

  const formatLastSeen = (lastSeen) => {
    const now = new Date();
    const lastSeenDate = new Date(lastSeen);
    const diffMinutes = Math.floor((now - lastSeenDate) / (1000 * 60));

    if (diffMinutes < 1) return "Just now";
    if (diffMinutes < 60) return `${diffMinutes}m ago`;
    if (diffMinutes < 1440) return `${Math.floor(diffMinutes / 60)}h ago`;
    return `${Math.floor(diffMinutes / 1440)}d ago`;
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <LoadingSpinner size="large" />
          <p className="mt-4 text-gray-600">Loading device health data...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="text-red-500 text-xl mb-4">⚠️</div>
          <p className="text-red-600 mb-4">{error}</p>
          <button
            onClick={() => window.location.reload()}
            className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700"
          >
            Retry
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">
            Device Health Monitor
          </h1>
          <p className="text-gray-600 mt-2">
            Real-time monitoring of attendance system devices across all
            facilities
          </p>
        </div>

        {/* Statistics Cards */}
        <div className="grid grid-cols-1 md:grid-cols-5 gap-6 mb-8">
          <StatCard
            title="Total Devices"
            value={stats.totalDevices}
            icon={<span className="text-2xl">📱</span>}
            color="blue"
          />
          <StatCard
            title="Online Devices"
            value={stats.onlineDevices}
            subtitle={`${(
              (stats.onlineDevices / Math.max(stats.totalDevices, 1)) *
              100
            ).toFixed(1)}%`}
            icon={<span className="text-2xl">🟢</span>}
            color="green"
          />
          <StatCard
            title="Offline Devices"
            value={stats.offlineDevices}
            subtitle={`${(
              (stats.offlineDevices / Math.max(stats.totalDevices, 1)) *
              100
            ).toFixed(1)}%`}
            icon={<span className="text-2xl">🔴</span>}
            color="red"
          />
          <StatCard
            title="Facilities"
            value={stats.uniqueFacilities}
            icon={<span className="text-2xl">🏢</span>}
            color="purple"
          />
          <StatCard
            title="States"
            value={stats.uniqueStates}
            icon={<span className="text-2xl">🗺️</span>}
            color="yellow"
          />
        </div>

        {/* Filters and Search */}
        <Card title="Filters" className="mb-6">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Search
              </label>
              <input
                type="text"
                placeholder="Search devices, facilities..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Status
              </label>
              <select
                value={filters.status}
                onChange={(e) =>
                  setFilters({ ...filters, status: e.target.value })
                }
                className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
              >
                <option value="all">All Devices</option>
                <option value="online">Online Only</option>
                <option value="offline">Offline Only</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Facility
              </label>
              <select
                value={filters.facility}
                onChange={(e) =>
                  setFilters({ ...filters, facility: e.target.value })
                }
                className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
              >
                <option value="all">All Facilities</option>
                {getUniqueValues("facility").map((facility) => (
                  <option key={facility} value={facility}>
                    {facility}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                State
              </label>
              <select
                value={filters.state}
                onChange={(e) =>
                  setFilters({ ...filters, state: e.target.value })
                }
                className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
              >
                <option value="all">All States</option>
                {getUniqueValues("facilityState").map((state) => (
                  <option key={state} value={state}>
                    {state}
                  </option>
                ))}
              </select>
            </div>
          </div>
          <div className="mt-4 flex justify-between items-center">
            <p className="text-sm text-gray-600">
              Showing {filteredDevices.length} of {devices.length} devices
            </p>
            <button
              onClick={() => {
                setFilters({ status: "all", facility: "all", state: "all" });
                setSearchTerm("");
              }}
              className="text-sm text-blue-600 hover:text-blue-800"
            >
              Clear Filters
            </button>
          </div>
        </Card>

        {/* Device Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredDevices.length > 0 ? (
            filteredDevices.map((device, index) => (
              <div
                key={index}
                className={`border-2 rounded-lg p-6 transition-all duration-200 hover:shadow-lg ${getDeviceStatusColor(
                  device
                )}`}
              >
                <div className="flex items-start justify-between mb-4">
                  <div className="flex-1">
                    <h3 className="text-lg font-semibold text-gray-900 mb-1">
                      {device.deviceName}
                    </h3>
                    <p className="text-sm text-gray-600">{device.facility}</p>
                  </div>
                  <DeviceStatusBadge
                    isOnline={device.isOnline}
                    lastSeen={device.lastSeen}
                  />
                </div>

                <div className="space-y-2">
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-600">State:</span>
                    <span className="text-gray-900">
                      {device.facilityState}
                    </span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-600">LGA:</span>
                    <span className="text-gray-900">{device.facilityLga}</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-600">IP Address:</span>
                    <span className="text-gray-900 font-mono">
                      {device.ipAddress || "Not available"}
                    </span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-600">Last Seen:</span>
                    <span className="text-gray-900">
                      {formatLastSeen(device.lastSeen)}
                    </span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-600">Facility Code:</span>
                    <span className="text-gray-900 font-mono">
                      {device.facilityCode || "N/A"}
                    </span>
                  </div>
                </div>

                <div className="mt-4 pt-4 border-t border-gray-200">
                  <p className="text-xs text-gray-500">
                    Last updated: {new Date(device.lastSeen).toLocaleString()}
                  </p>
                </div>
              </div>
            ))
          ) : (
            <div className="col-span-full">
              <Card className="text-center py-12">
                <div className="text-gray-400 text-6xl mb-4">📱</div>
                <h3 className="text-lg font-medium text-gray-900 mb-2">
                  No devices found
                </h3>
                <p className="text-gray-600">
                  {devices.length === 0
                    ? "No devices have been registered yet."
                    : "No devices match your current filters."}
                </p>
                {devices.length > 0 && (
                  <button
                    onClick={() => {
                      setFilters({
                        status: "all",
                        facility: "all",
                        state: "all",
                      });
                      setSearchTerm("");
                    }}
                    className="mt-4 bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700"
                  >
                    Clear Filters
                  </button>
                )}
              </Card>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="mt-8">
          <Card className="text-center">
            <p className="text-sm text-gray-500">
              Auto-refresh every 15 seconds • Last updated:{" "}
              {new Date().toLocaleString()}
            </p>
          </Card>
        </div>
      </div>
    </div>
  );
}
