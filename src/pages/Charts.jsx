import { useEffect, useState } from "react";
import api from "../api/axios";
import { Bar, Line, Doughnut, Radar } from "react-chartjs-2";
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
  RadialLinearScale,
} from "chart.js";
import Card from "../components/Card";
import LoadingSpinner from "../components/LoadingSpinner";

Chart.register(
  CategoryScale,
  LinearScale,
  BarElement,
  ArcElement,
  PointElement,
  LineElement,
  RadialLinearScale,
  Title,
  Tooltip,
  Legend
);

export default function Charts() {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [facilitySummary, setFacilitySummary] = useState([]);
  const [analytics, setAnalytics] = useState([]);
  const [selectedYear, setSelectedYear] = useState(new Date().getFullYear());
  const [selectedMonth, setSelectedMonth] = useState(new Date().getMonth() + 1);

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        setError(null);

        const [summaryRes, analyticsRes] = await Promise.all([
          api.get("/reports/facility-summary"),
          api.get(`/reports/analytics/${selectedYear}/${selectedMonth}`),
        ]);

        setFacilitySummary(summaryRes.data);
        setAnalytics(analyticsRes.data);
      } catch (err) {
        console.error("Error fetching chart data:", err);
        setError("Failed to load chart data. Please try again.");
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [selectedYear, selectedMonth]);

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <LoadingSpinner size="large" />
          <p className="mt-4 text-gray-600">Loading charts...</p>
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

  // Chart Data Configurations
  const barChartData = {
    labels: facilitySummary.map((d) => d.facility),
    datasets: [
      {
        label: "Total Attendance",
        data: facilitySummary.map((d) => d.total),
        backgroundColor: "#3B82F6",
        borderColor: "#1D4ED8",
        borderWidth: 1,
      },
      {
        label: "Successful",
        data: facilitySummary.map((d) => d.success),
        backgroundColor: "#10B981",
        borderColor: "#059669",
        borderWidth: 1,
      },
      {
        label: "Failed",
        data: facilitySummary.map((d) => d.failed),
        backgroundColor: "#EF4444",
        borderColor: "#DC2626",
        borderWidth: 1,
      },
    ],
  };

  const lineChartData = {
    labels: facilitySummary.map((d) => d.facility),
    datasets: [
      {
        label: "Success Rate (%)",
        data: facilitySummary.map((d) =>
          d.total > 0 ? ((d.success / d.total) * 100).toFixed(1) : 0
        ),
        borderColor: "#10B981",
        backgroundColor: "rgba(16, 185, 129, 0.1)",
        borderWidth: 2,
        fill: true,
        tension: 0.4,
      },
    ],
  };

  const doughnutData = {
    labels: facilitySummary.map((d) => d.facility),
    datasets: [
      {
        label: "Total Attendance",
        data: facilitySummary.map((d) => d.total),
        backgroundColor: [
          "#3B82F6",
          "#10B981",
          "#F59E0B",
          "#EF4444",
          "#8B5CF6",
          "#06B6D4",
          "#84CC16",
          "#F97316",
          "#EC4899",
          "#6B7280",
        ],
        borderWidth: 2,
        borderColor: "#FFFFFF",
      },
    ],
  };

  const radarData = {
    labels: facilitySummary.slice(0, 6).map((d) => d.facility), // Limit to 6 for better visualization
    datasets: [
      {
        label: "Total Attendance",
        data: facilitySummary.slice(0, 6).map((d) => d.total),
        backgroundColor: "rgba(59, 130, 246, 0.2)",
        borderColor: "#3B82F6",
        borderWidth: 2,
        pointBackgroundColor: "#3B82F6",
        pointBorderColor: "#1D4ED8",
        pointHoverBackgroundColor: "#1D4ED8",
        pointHoverBorderColor: "#3B82F6",
      },
      {
        label: "Successful",
        data: facilitySummary.slice(0, 6).map((d) => d.success),
        backgroundColor: "rgba(16, 185, 129, 0.2)",
        borderColor: "#10B981",
        borderWidth: 2,
        pointBackgroundColor: "#10B981",
        pointBorderColor: "#059669",
        pointHoverBackgroundColor: "#059669",
        pointHoverBorderColor: "#10B981",
      },
    ],
  };

  const chartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        position: "top",
      },
      title: {
        display: false,
      },
    },
  };

  const months = [
    { value: 1, label: "January" },
    { value: 2, label: "February" },
    { value: 3, label: "March" },
    { value: 4, label: "April" },
    { value: 5, label: "May" },
    { value: 6, label: "June" },
    { value: 7, label: "July" },
    { value: 8, label: "August" },
    { value: 9, label: "September" },
    { value: 10, label: "October" },
    { value: 11, label: "November" },
    { value: 12, label: "December" },
  ];

  const years = Array.from(
    { length: 5 },
    (_, i) => new Date().getFullYear() - i
  );

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">
            Analytics & Charts
          </h1>
          <p className="text-gray-600 mt-2">
            Visual representation of attendance data and system performance
          </p>
        </div>

        {/* Date Selector */}
        <Card className="mb-8">
          <div className="flex flex-wrap gap-4 items-center">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Year
              </label>
              <select
                value={selectedYear}
                onChange={(e) => setSelectedYear(parseInt(e.target.value))}
                className="block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
              >
                {years.map((year) => (
                  <option key={year} value={year}>
                    {year}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Month
              </label>
              <select
                value={selectedMonth}
                onChange={(e) => setSelectedMonth(parseInt(e.target.value))}
                className="block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
              >
                {months.map((month) => (
                  <option key={month.value} value={month.value}>
                    {month.label}
                  </option>
                ))}
              </select>
            </div>
            <div className="mt-6">
              <button
                onClick={() => window.location.reload()}
                className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700"
              >
                Refresh Data
              </button>
            </div>
          </div>
        </Card>

        {/* Charts Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
          {/* Bar Chart */}
          <Card
            title="Attendance Overview"
            subtitle="Total, successful, and failed attendance by facility"
          >
            <div className="h-80">
              {facilitySummary.length > 0 ? (
                <Bar data={barChartData} options={chartOptions} />
              ) : (
                <div className="h-full flex items-center justify-center text-gray-500">
                  No data available for the selected period
                </div>
              )}
            </div>
          </Card>

          {/* Line Chart */}
          <Card
            title="Success Rate Trend"
            subtitle="Percentage of successful attendance by facility"
          >
            <div className="h-80">
              {facilitySummary.length > 0 ? (
                <Line data={lineChartData} options={chartOptions} />
              ) : (
                <div className="h-full flex items-center justify-center text-gray-500">
                  No data available for the selected period
                </div>
              )}
            </div>
          </Card>

          {/* Doughnut Chart */}
          <Card
            title="Attendance Distribution"
            subtitle="Total attendance per facility"
          >
            <div className="h-80">
              {facilitySummary.length > 0 ? (
                <Doughnut
                  data={doughnutData}
                  options={{
                    ...chartOptions,
                    plugins: {
                      ...chartOptions.plugins,
                      legend: {
                        position: "right",
                      },
                    },
                  }}
                />
              ) : (
                <div className="h-full flex items-center justify-center text-gray-500">
                  No data available for the selected period
                </div>
              )}
            </div>
          </Card>

          {/* Radar Chart */}
          <Card
            title="Performance Radar"
            subtitle="Multi-dimensional view of top 6 facilities"
          >
            <div className="h-80">
              {facilitySummary.length > 0 ? (
                <Radar
                  data={radarData}
                  options={{
                    ...chartOptions,
                    scales: {
                      r: {
                        beginAtZero: true,
                        ticks: {
                          stepSize: 1,
                        },
                      },
                    },
                  }}
                />
              ) : (
                <div className="h-full flex items-center justify-center text-gray-500">
                  No data available for the selected period
                </div>
              )}
            </div>
          </Card>
        </div>

        {/* Summary Statistics */}
        <Card
          title="Summary Statistics"
          subtitle={`Data for ${
            months.find((m) => m.value === selectedMonth)?.label
          } ${selectedYear}`}
        >
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div className="text-center p-4 bg-blue-50 rounded-lg">
              <p className="text-2xl font-bold text-blue-600">
                {facilitySummary.length}
              </p>
              <p className="text-sm text-blue-800">Active Facilities</p>
            </div>
            <div className="text-center p-4 bg-green-50 rounded-lg">
              <p className="text-2xl font-bold text-green-600">
                {facilitySummary
                  .reduce((sum, f) => sum + f.total, 0)
                  .toLocaleString()}
              </p>
              <p className="text-sm text-green-800">Total Attendance</p>
            </div>
            <div className="text-center p-4 bg-yellow-50 rounded-lg">
              <p className="text-2xl font-bold text-yellow-600">
                {facilitySummary
                  .reduce((sum, f) => sum + f.success, 0)
                  .toLocaleString()}
              </p>
              <p className="text-sm text-yellow-800">Successful Records</p>
            </div>
            <div className="text-center p-4 bg-red-50 rounded-lg">
              <p className="text-2xl font-bold text-red-600">
                {(
                  (facilitySummary.reduce((sum, f) => sum + f.success, 0) /
                    Math.max(
                      facilitySummary.reduce((sum, f) => sum + f.total, 0),
                      1
                    )) *
                  100
                ).toFixed(1)}
                %
              </p>
              <p className="text-sm text-red-800">Overall Success Rate</p>
            </div>
          </div>
        </Card>
      </div>
    </div>
  );
}
