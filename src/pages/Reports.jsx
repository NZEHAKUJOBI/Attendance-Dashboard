import { useEffect, useState } from "react";
import api from "../api/axios";
import Card from "../components/Card";
import LoadingSpinner from "../components/LoadingSpinner";
import jsPDF from "jspdf";
import "jspdf-autotable";

export default function Reports() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [facilitySummary, setFacilitySummary] = useState([]);
  const [facilityReport, setFacilityReport] = useState([]);
  const [userTimesheet, setUserTimesheet] = useState([]);

  // Filter states
  const [selectedFacility, setSelectedFacility] = useState("");
  const [selectedYear, setSelectedYear] = useState(new Date().getFullYear());
  const [selectedMonth, setSelectedMonth] = useState(new Date().getMonth() + 1);
  const [selectedUserId, setSelectedUserId] = useState("");

  // Report type
  const [activeTab, setActiveTab] = useState("facility-summary");

  useEffect(() => {
    fetchFacilitySummary();
  }, []);

  const fetchFacilitySummary = async () => {
    try {
      setLoading(true);
      const response = await api.get("/reports/facility-summary");
      setFacilitySummary(response.data);
    } catch (err) {
      console.error("Error fetching facility summary:", err);
      setError("Failed to load facility summary.");
    } finally {
      setLoading(false);
    }
  };

  const fetchFacilityReport = async () => {
    if (!selectedFacility) {
      setError("Please select a facility first.");
      return;
    }

    try {
      setLoading(true);
      setError(null);
      const response = await api.get(
        `/reports/facility/${encodeURIComponent(
          selectedFacility
        )}/${selectedYear}/${selectedMonth}`
      );
      setFacilityReport(response.data);
    } catch (err) {
      console.error("Error fetching facility report:", err);
      setError("Failed to load facility report.");
    } finally {
      setLoading(false);
    }
  };

  const fetchUserTimesheet = async () => {
    if (!selectedUserId) {
      setError("Please enter a valid User ID.");
      return;
    }

    try {
      setLoading(true);
      setError(null);
      const response = await api.get(
        `/reports/timesheet/${selectedUserId}/${selectedYear}/${selectedMonth}`
      );
      setUserTimesheet(response.data);
    } catch (err) {
      console.error("Error fetching user timesheet:", err);
      setError("Failed to load user timesheet.");
    } finally {
      setLoading(false);
    }
  };

  const downloadUserTimesheetPDF = async () => {
    if (!selectedUserId) {
      setError("Please enter a valid User ID.");
      return;
    }

    try {
      setLoading(true);
      setError(null);
      const response = await api.get(
        `/reports/timesheet-pdf/${selectedUserId}/${selectedYear}/${selectedMonth}`,
        { responseType: "blob" }
      );

      const blob = new Blob([response.data], { type: "application/pdf" });
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `Timesheet_${selectedUserId}_${selectedYear}_${selectedMonth}.pdf`;
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);
    } catch (err) {
      console.error("Error downloading timesheet PDF:", err);
      setError("Failed to download timesheet PDF.");
    } finally {
      setLoading(false);
    }
  };

  const exportFacilitySummaryPDF = () => {
    const doc = new jsPDF();
    doc.text("Facility Summary Report", 14, 10);
    doc.text(`Generated: ${new Date().toLocaleString()}`, 14, 20);

    const tableData = facilitySummary.map((facility) => [
      facility.facility,
      facility.total.toString(),
      facility.success.toString(),
      facility.failed.toString(),
      `${((facility.success / facility.total) * 100).toFixed(1)}%`,
      facility.lastCheckIn
        ? new Date(facility.lastCheckIn).toLocaleString()
        : "N/A",
    ]);

    doc.autoTable({
      head: [
        [
          "Facility",
          "Total",
          "Success",
          "Failed",
          "Success Rate",
          "Last Check-in",
        ],
      ],
      body: tableData,
      startY: 30,
    });

    doc.save(`Facility_Summary_${new Date().toISOString().split("T")[0]}.pdf`);
  };

  const exportFacilityReportPDF = () => {
    if (!facilityReport.length) return;

    const doc = new jsPDF();
    doc.text(`${selectedFacility} - Monthly Report`, 14, 10);
    doc.text(`Period: ${getMonthName(selectedMonth)} ${selectedYear}`, 14, 20);
    doc.text(`Generated: ${new Date().toLocaleString()}`, 14, 30);

    const tableData = facilityReport.map((record) => [
      record.fullName,
      record.designation,
      record.checkInDate
        ? new Date(record.checkInDate).toLocaleDateString()
        : "N/A",
      record.checkIn ? new Date(record.checkIn).toLocaleTimeString() : "N/A",
      record.checkOut ? new Date(record.checkOut).toLocaleTimeString() : "N/A",
      record.success ? "✓" : "✗",
      record.message || "",
    ]);

    doc.autoTable({
      head: [
        [
          "Name",
          "Designation",
          "Date",
          "Check In",
          "Check Out",
          "Success",
          "Message",
        ],
      ],
      body: tableData,
      startY: 40,
    });

    doc.save(`${selectedFacility}_Report_${selectedYear}_${selectedMonth}.pdf`);
  };

  const getMonthName = (month) => {
    const months = [
      "January",
      "February",
      "March",
      "April",
      "May",
      "June",
      "July",
      "August",
      "September",
      "October",
      "November",
      "December",
    ];
    return months[month - 1];
  };

  const tabs = [
    { id: "facility-summary", label: "Facility Summary", icon: "🏢" },
    { id: "facility-report", label: "Facility Report", icon: "📊" },
    { id: "user-timesheet", label: "User Timesheet", icon: "👤" },
  ];

  const years = Array.from(
    { length: 5 },
    (_, i) => new Date().getFullYear() - i
  );
  const months = Array.from({ length: 12 }, (_, i) => ({
    value: i + 1,
    label: getMonthName(i + 1),
  }));

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">Reports</h1>
          <p className="text-gray-600 mt-2">
            Generate and download detailed attendance reports
          </p>
        </div>

        {/* Navigation Tabs */}
        <div className="mb-6">
          <nav className="flex space-x-8" aria-label="Tabs">
            {tabs.map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`${
                  activeTab === tab.id
                    ? "border-blue-500 text-blue-600"
                    : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300"
                } whitespace-nowrap py-2 px-1 border-b-2 font-medium text-sm flex items-center space-x-2`}
              >
                <span>{tab.icon}</span>
                <span>{tab.label}</span>
              </button>
            ))}
          </nav>
        </div>

        {/* Error Display */}
        {error && (
          <div className="mb-6 bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded">
            {error}
          </div>
        )}

        {/* Facility Summary Tab */}
        {activeTab === "facility-summary" && (
          <div className="space-y-6">
            <Card
              title="Facility Summary Report"
              subtitle="Overview of all facilities"
              action={
                <button
                  onClick={exportFacilitySummaryPDF}
                  disabled={!facilitySummary.length}
                  className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 disabled:bg-gray-400"
                >
                  Export PDF
                </button>
              }
            >
              {loading ? (
                <div className="flex justify-center py-8">
                  <LoadingSpinner />
                </div>
              ) : (
                <div className="overflow-x-auto">
                  <table className="min-w-full divide-y divide-gray-200">
                    <thead className="bg-gray-50">
                      <tr>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Facility
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Total
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Success
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Failed
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Success Rate
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Last Check-in
                        </th>
                      </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-200">
                      {facilitySummary.map((facility, index) => (
                        <tr key={index} className="hover:bg-gray-50">
                          <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                            {facility.facility}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                            {facility.total}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-green-600">
                            {facility.success}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-red-600">
                            {facility.failed}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                            <span
                              className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                                (facility.success / facility.total) * 100 >= 90
                                  ? "bg-green-100 text-green-800"
                                  : (facility.success / facility.total) * 100 >=
                                    70
                                  ? "bg-yellow-100 text-yellow-800"
                                  : "bg-red-100 text-red-800"
                              }`}
                            >
                              {(
                                (facility.success / facility.total) *
                                100
                              ).toFixed(1)}
                              %
                            </span>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                            {facility.lastCheckIn
                              ? new Date(facility.lastCheckIn).toLocaleString()
                              : "N/A"}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </Card>
          </div>
        )}

        {/* Facility Report Tab */}
        {activeTab === "facility-report" && (
          <div className="space-y-6">
            <Card
              title="Facility Monthly Report"
              subtitle="Detailed attendance records for a specific facility"
            >
              <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Facility
                  </label>
                  <select
                    value={selectedFacility}
                    onChange={(e) => setSelectedFacility(e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                  >
                    <option value="">Select a facility</option>
                    {facilitySummary.map((facility) => (
                      <option key={facility.facility} value={facility.facility}>
                        {facility.facility}
                      </option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Year
                  </label>
                  <select
                    value={selectedYear}
                    onChange={(e) => setSelectedYear(parseInt(e.target.value))}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
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
                    className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                  >
                    {months.map((month) => (
                      <option key={month.value} value={month.value}>
                        {month.label}
                      </option>
                    ))}
                  </select>
                </div>
                <div className="flex space-x-2 items-end">
                  <button
                    onClick={fetchFacilityReport}
                    disabled={!selectedFacility || loading}
                    className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 disabled:bg-gray-400"
                  >
                    Generate Report
                  </button>
                  {facilityReport.length > 0 && (
                    <button
                      onClick={exportFacilityReportPDF}
                      className="bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700"
                    >
                      Export PDF
                    </button>
                  )}
                </div>
              </div>

              {loading ? (
                <div className="flex justify-center py-8">
                  <LoadingSpinner />
                </div>
              ) : facilityReport.length > 0 ? (
                <div className="overflow-x-auto">
                  <table className="min-w-full divide-y divide-gray-200">
                    <thead className="bg-gray-50">
                      <tr>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Name
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Designation
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Date
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Check In
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Check Out
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Status
                        </th>
                      </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-200">
                      {facilityReport.map((record, index) => (
                        <tr key={index} className="hover:bg-gray-50">
                          <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                            {record.fullName}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                            {record.designation}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                            {record.checkInDate
                              ? new Date(
                                  record.checkInDate
                                ).toLocaleDateString()
                              : "N/A"}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                            {record.checkIn
                              ? new Date(record.checkIn).toLocaleTimeString()
                              : "N/A"}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                            {record.checkOut
                              ? new Date(record.checkOut).toLocaleTimeString()
                              : "N/A"}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                            <span
                              className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                                record.success
                                  ? "bg-green-100 text-green-800"
                                  : "bg-red-100 text-red-800"
                              }`}
                            >
                              {record.success ? "Success" : "Failed"}
                            </span>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              ) : (
                <div className="text-center py-8 text-gray-500">
                  Select a facility and click "Generate Report" to view data
                </div>
              )}
            </Card>
          </div>
        )}

        {/* User Timesheet Tab */}
        {activeTab === "user-timesheet" && (
          <div className="space-y-6">
            <Card
              title="User Timesheet"
              subtitle="Individual user attendance records"
            >
              <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    User ID
                  </label>
                  <input
                    type="text"
                    placeholder="Enter User ID (GUID)"
                    value={selectedUserId}
                    onChange={(e) => setSelectedUserId(e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Year
                  </label>
                  <select
                    value={selectedYear}
                    onChange={(e) => setSelectedYear(parseInt(e.target.value))}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
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
                    className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                  >
                    {months.map((month) => (
                      <option key={month.value} value={month.value}>
                        {month.label}
                      </option>
                    ))}
                  </select>
                </div>
                <div className="flex space-x-2 items-end">
                  <button
                    onClick={fetchUserTimesheet}
                    disabled={!selectedUserId || loading}
                    className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 disabled:bg-gray-400"
                  >
                    Generate
                  </button>
                  <button
                    onClick={downloadUserTimesheetPDF}
                    disabled={!selectedUserId || loading}
                    className="bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 disabled:bg-gray-400"
                  >
                    PDF
                  </button>
                </div>
              </div>

              {loading ? (
                <div className="flex justify-center py-8">
                  <LoadingSpinner />
                </div>
              ) : userTimesheet.length > 0 ? (
                <div className="overflow-x-auto">
                  <table className="min-w-full divide-y divide-gray-200">
                    <thead className="bg-gray-50">
                      <tr>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Date
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Check In
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Check Out
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Status
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Message
                        </th>
                      </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-200">
                      {userTimesheet.map((record, index) => (
                        <tr key={index} className="hover:bg-gray-50">
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                            {record.checkInDate
                              ? new Date(
                                  record.checkInDate
                                ).toLocaleDateString()
                              : "N/A"}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                            {record.checkIn
                              ? new Date(record.checkIn).toLocaleTimeString()
                              : "N/A"}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                            {record.checkOut
                              ? new Date(record.checkOut).toLocaleTimeString()
                              : "N/A"}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                            <span
                              className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                                record.success
                                  ? "bg-green-100 text-green-800"
                                  : "bg-red-100 text-red-800"
                              }`}
                            >
                              {record.success ? "Success" : "Failed"}
                            </span>
                          </td>
                          <td className="px-6 py-4 text-sm text-gray-500">
                            {record.message || "N/A"}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              ) : selectedUserId ? (
                <div className="text-center py-8 text-gray-500">
                  No timesheet data found for this user and period
                </div>
              ) : (
                <div className="text-center py-8 text-gray-500">
                  Enter a User ID and click "Generate" to view timesheet
                </div>
              )}
            </Card>
          </div>
        )}
      </div>
    </div>
  );
}
