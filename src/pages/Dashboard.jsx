import { useEffect, useState } from "react";
import api from "../api/axios";
import jsPDF from "jspdf";
import "jspdf-autotable";
import Card from "../components/Card";
import StatCard from "../components/StatCard";
import LoadingSpinner from "../components/LoadingSpinner";
import DeviceStatusBadge from "../components/DeviceStatusBadge";
import { Bar, Doughnut, Line } from "react-chartjs-2";
import {
  Chart,
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend,
  ArcElement,
  PointElement,
  LineElement,
} from "chart.js";

Chart.register(
  CategoryScale,
  LinearScale,
  BarElement,
  ArcElement,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend
);

export default function Dashboard() {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Data states
  const [facilitySummary, setFacilitySummary] = useState([]);
  const [deviceStatus, setDeviceStatus] = useState([]);
  const [analytics, setAnalytics] = useState(null);
  const [dashboardStats, setDashboardStats] = useState({
    totalFacilities: 0,
    totalDevices: 0,
    onlineDevices: 0,
    totalStaff: 0,
    attendedToday: 0,
    attendanceRate: 0,
    totalAttendanceRecords: 0,
  });

  // Date state for analytics
  const currentDate = new Date();
  const [selectedYear] = useState(currentDate.getFullYear());
  const [selectedMonth] = useState(currentDate.getMonth() + 1);

  useEffect(() => {
    const fetchDashboardData = async () => {
      try {
        setLoading(true);
        setError(null);

        // Fetch all data in parallel
        const [facilityRes, healthRes, analyticsRes] = await Promise.all([
          api.get("/reports/facility-today-summary"),
          api.get("/health/status"),
          api.get(`/reports/analytics/${selectedYear}/${selectedMonth}`),
        ]);

        const facilityData = facilityRes.data;
        const healthData = healthRes.data;
        const analyticsData = analyticsRes.data;

        setFacilitySummary(facilityData);
        setDeviceStatus(healthData);
        setAnalytics(analyticsData);

        // Calculate dashboard statistics with new data structure
        const totalFacilities = facilityData.length;
        const totalDevices = healthData.length;
        const onlineDevices = healthData.filter(
          (device) => device.isOnline
        ).length;

        // New calculations based on updated backend (facility-today-summary)
        const totalStaff = facilityData.reduce(
          (sum, facility) => sum + facility.total, // Total staff from Staff table
          0
        );

        const attendedToday = facilityData.reduce(
          (sum, facility) => sum + facility.checkedIn, // Unique users who checked in today
          0
        );

        const totalAttendanceRecords = facilityData.reduce(
          (sum, facility) => sum + facility.totalCheckIns, // Total check-in attempts (including multiple per user)
          0
        );

        // Attendance rate: (Attended today / Total staff) * 100
        const attendanceRate =
          totalStaff > 0 ? ((attendedToday / totalStaff) * 100).toFixed(1) : 0;

        setDashboardStats({
          totalFacilities,
          totalDevices,
          onlineDevices,
          totalStaff,
          attendedToday,
          attendanceRate,
          totalAttendanceRecords,
        });
      } catch (err) {
        console.error("Error fetching dashboard data:", err);
        setError("Failed to load dashboard data. Please try again.");
      } finally {
        setLoading(false);
      }
    };

    fetchDashboardData();

    // Set up auto-refresh every 30 seconds
    const interval = setInterval(fetchDashboardData, 30000);
    return () => clearInterval(interval);
  }, [selectedYear, selectedMonth]);

  const exportFacilityPDF = () => {
    const doc = new jsPDF();
    doc.text("Staff Attendance Summary Report", 14, 10);
    doc.text(`Generated: ${new Date().toLocaleString()}`, 14, 20);

    const tableData = facilitySummary.map((facility) => [
      facility.facility,
      facility.total.toString(),
      facility.checkedIn.toString(),
      facility.notCheckedIn.toString(),
      `${facility.attendanceRate}%`,
      facility.lastCheckIn
        ? new Date(facility.lastCheckIn).toLocaleString()
        : "N/A",
    ]);

    doc.autoTable({
      head: [
        [
          "Facility",
          "Total Staff",
          "Attended Today",
          "Missed Today",
          "Attendance Rate",
          "Last Check-in",
        ],
      ],
      body: tableData,
      startY: 30,
    });

    doc.save(`Staff_Attendance_${new Date().toISOString().split("T")[0]}.pdf`);
  };

  const exportDeviceStatusPDF = () => {
    const doc = new jsPDF();
    doc.text("Device Status Report", 14, 10);
    doc.text(`Generated: ${new Date().toLocaleString()}`, 14, 20);

    const tableData = deviceStatus.map((device) => [
      device.deviceName,
      device.facility,
      device.facilityState,
      device.facilityLga,
      device.ipAddress || "N/A",
      device.isOnline ? "Online" : "Offline",
      device.lastSeen,
    ]);

    doc.autoTable({
      head: [
        [
          "Device",
          "Facility",
          "State",
          "LGA",
          "IP Address",
          "Status",
          "Last Seen",
        ],
      ],
      body: tableData,
      startY: 30,
    });

    doc.save(`Device_Status_${new Date().toISOString().split("T")[0]}.pdf`);
  };

  // Chart configurations
  const facilityChartData = {
    labels: facilitySummary.map((f) => f.facility),
    datasets: [
      {
        label: "Total Staff",
        data: facilitySummary.map((f) => f.total),
        backgroundColor: "#3B82F6",
        borderColor: "#1D4ED8",
        borderWidth: 1,
      },
      {
        label: "Attended Today",
        data: facilitySummary.map((f) => f.checkedIn),
        backgroundColor: "#10B981",
        borderColor: "#059669",
        borderWidth: 1,
      },
      {
        label: "Not Checked In",
        data: facilitySummary.map((f) => f.notCheckedIn),
        backgroundColor: "#EF4444",
        borderColor: "#DC2626",
        borderWidth: 1,
      },
    ],
  };

  const successRateData = {
    labels: ["Checked In Today", "Not Checked In"],
    datasets: [
      {
        data: [
          facilitySummary.reduce((sum, f) => sum + f.checkedIn, 0),
          facilitySummary.reduce((sum, f) => sum + f.notCheckedIn, 0),
        ],
        backgroundColor: ["#10B981", "#EF4444"],
        borderColor: ["#059669", "#DC2626"],
        borderWidth: 2,
      },
    ],
  };

  const deviceStatusData = {
    labels: ["Online", "Offline"],
    datasets: [
      {
        data: [
          deviceStatus.filter((d) => d.isOnline).length,
          deviceStatus.filter((d) => !d.isOnline).length,
        ],
        backgroundColor: ["#10B981", "#EF4444"],
        borderColor: ["#059669", "#DC2626"],
        borderWidth: 2,
      },
    ],
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <LoadingSpinner size="large" />
          <p className="mt-4 text-gray-600">Loading dashboard...</p>
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
            Attendance Dashboard
          </h1>
          <p className="text-gray-600 mt-2">
            Real-time monitoring of attendance systems and device health
          </p>
        </div>

        {/* Statistics Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-6 mb-8">
          <StatCard
            title="Total Facilities"
            value={dashboardStats.totalFacilities}
            icon={<span className="text-2xl">🏢</span>}
            color="blue"
          />
          <StatCard
            title="Total Devices"
            value={dashboardStats.totalDevices}
            icon={<span className="text-2xl">📱</span>}
            color="purple"
          />
          <StatCard
            title="Online Devices"
            value={`${dashboardStats.onlineDevices}/${dashboardStats.totalDevices}`}
            subtitle={`${(
              (dashboardStats.onlineDevices / dashboardStats.totalDevices) *
                100 || 0
            ).toFixed(1)}% uptime`}
            icon={<span className="text-2xl">🟢</span>}
            color="green"
          />
          <StatCard
            title="Total Staff"
            value={dashboardStats.totalStaff.toLocaleString()}
            subtitle="Registered staff"
            icon={<span className="text-2xl">👥</span>}
            color="blue"
          />
          <StatCard
            title="Attended Today"
            value={`${dashboardStats.attendedToday}/${dashboardStats.totalStaff}`}
            subtitle={`${dashboardStats.attendanceRate}% attendance rate`}
            icon={<span className="text-2xl">✅</span>}
            color="green"
          />
        </div>

        {/* Charts Row */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
          <div className="lg:col-span-2">
            <Card
              title="Staff Attendance by Facility"
              subtitle="Total staff vs daily attendance per facility"
              action={
                <button
                  onClick={exportFacilityPDF}
                  className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 text-sm"
                >
                  Export PDF
                </button>
              }
            >
              {facilitySummary.length > 0 ? (
                <Bar
                  data={facilityChartData}
                  options={{
                    responsive: true,
                    plugins: {
                      legend: {
                        position: "top",
                      },
                    },
                    scales: {
                      y: {
                        beginAtZero: true,
                      },
                    },
                  }}
                />
              ) : (
                <div className="h-64 flex items-center justify-center text-gray-500">
                  No data available
                </div>
              )}
            </Card>
          </div>

          <div className="space-y-6">
            <Card
              title="Today's Attendance Rate"
              subtitle="Staff attendance breakdown"
            >
              {facilitySummary.length > 0 ? (
                <Doughnut
                  data={successRateData}
                  options={{
                    responsive: true,
                    plugins: {
                      legend: {
                        position: "bottom",
                      },
                    },
                  }}
                />
              ) : (
                <div className="h-48 flex items-center justify-center text-gray-500">
                  No data available
                </div>
              )}
            </Card>

            <Card title="Device Status" subtitle="System health monitoring">
              {deviceStatus.length > 0 ? (
                <Doughnut
                  data={deviceStatusData}
                  options={{
                    responsive: true,
                    plugins: {
                      legend: {
                        position: "bottom",
                      },
                    },
                  }}
                />
              ) : (
                <div className="h-48 flex items-center justify-center text-gray-500">
                  No devices found
                </div>
              )}
            </Card>
          </div>
        </div>

        {/* Facility Details Table */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
          <Card
            title="Facility Performance"
            subtitle="Staff count and daily attendance"
          >
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Facility
                    </th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Total Staff
                    </th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Attended Today
                    </th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Attendance Rate
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {facilitySummary.map((facility, index) => (
                    <tr key={index} className="hover:bg-gray-50">
                      <td className="px-4 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                        {facility.facility}
                      </td>
                      <td className="px-4 py-4 whitespace-nowrap text-sm text-gray-500">
                        {facility.total}
                      </td>
                      <td className="px-4 py-4 whitespace-nowrap text-sm text-gray-500">
                        {facility.checkedIn}
                      </td>
                      <td className="px-4 py-4 whitespace-nowrap text-sm text-gray-500">
                        <span
                          className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                            facility.attendanceRate >= 90
                              ? "bg-green-100 text-green-800"
                              : facility.attendanceRate >= 70
                              ? "bg-yellow-100 text-yellow-800"
                              : "bg-red-100 text-red-800"
                          }`}
                        >
                          {facility.attendanceRate.toFixed(1)}%
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </Card>

          <Card
            title="Device Status Monitor"
            subtitle="Real-time device health"
            action={
              <button
                onClick={exportDeviceStatusPDF}
                className="bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 text-sm"
              >
                Export Report
              </button>
            }
          >
            <div className="space-y-3 max-h-96 overflow-y-auto">
              {deviceStatus.length > 0 ? (
                deviceStatus.map((device, index) => (
                  <div
                    key={index}
                    className="flex items-center justify-between p-3 bg-gray-50 rounded-lg"
                  >
                    <div className="flex-1">
                      <p className="font-medium text-gray-900">
                        {device.deviceName}
                      </p>
                      <p className="text-sm text-gray-600">{device.facility}</p>
                      <p className="text-xs text-gray-500">
                        {device.facilityState}, {device.facilityLga}
                      </p>
                    </div>
                    <div className="text-right">
                      <DeviceStatusBadge
                        isOnline={device.isOnline}
                        lastSeen={device.lastSeen}
                      />
                      <p className="text-xs text-gray-500 mt-1">
                        {device.ipAddress || "No IP"}
                      </p>
                    </div>
                  </div>
                ))
              ) : (
                <div className="text-center py-8 text-gray-500">
                  No devices registered
                </div>
              )}
            </div>
          </Card>
        </div>

        {/* Footer */}
        <Card className="text-center">
          <p className="text-sm text-gray-500">
            Last updated: {new Date().toLocaleString()} • Auto-refresh every 30
            seconds
          </p>
        </Card>
      </div>
    </div>
  );
}
