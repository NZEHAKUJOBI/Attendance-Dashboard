import { useEffect, useState } from "react";
import api from "../api/axios";
import Card from "../components/Card";
import LoadingSpinner from "../components/LoadingSpinner";

export default function AdHocManagement() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [activeTab, setActiveTab] = useState("comprehensive-analysis");

  // Data states
  const [comprehensiveAnalysis, setComprehensiveAnalysis] = useState(null);
  const [stateBreakdown, setStateBreakdown] = useState([]);
  const [designationBreakdown, setDesignationBreakdown] = useState([]);
  const [designationByState, setDesignationByState] = useState([]);
  const [staffContacts, setStaffContacts] = useState([]);
  const [stateContacts, setStateContacts] = useState(null);

  // Filter states
  const [selectedState, setSelectedState] = useState("");
  const [selectedDesignation, setSelectedDesignation] = useState("");
  const [selectedFacility, setSelectedFacility] = useState("");
  const [contactState, setContactState] = useState("");

  // Available options for filters
  const [states, setStates] = useState([]);
  const [designations, setDesignations] = useState([]);
  const [facilities, setFacilities] = useState([]);

  useEffect(() => {
    fetchComprehensiveAnalysis();
    fetchStates();
    fetchDesignations();
    fetchFacilities();
  }, []);

  useEffect(() => {
    // Clear error when tab changes
    setError(null);
  }, [activeTab]);

  const fetchComprehensiveAnalysis = async () => {
    try {
      setLoading(true);
      setError(null);
      const response = await api.get("/users/analysis/comprehensive");
      setComprehensiveAnalysis(response.data);
    } catch (err) {
      console.error("Error fetching comprehensive analysis:", err);
      setError(
        `Failed to load comprehensive analysis: ${
          err.response?.data?.message || err.message
        }`
      );
    } finally {
      setLoading(false);
    }
  };

  const fetchStates = async () => {
    try {
      const analysisResponse = await api.get("/users/analysis/state-breakdown");
      setStateBreakdown(analysisResponse.data);
      setStates(analysisResponse.data.map((item) => item.state));
    } catch (err) {
      console.error("Error fetching states:", err);
    }
  };

  const fetchDesignations = async () => {
    try {
      const analysisResponse = await api.get(
        "/users/analysis/designation-breakdown"
      );
      setDesignationBreakdown(analysisResponse.data);
      setDesignations(analysisResponse.data.map((item) => item.designation));
    } catch (err) {
      console.error("Error fetching designations:", err);
    }
  };

  const fetchFacilities = async () => {
    try {
      const response = await api.get("/users/facilities");
      setFacilities(response.data);
    } catch (err) {
      console.error("Error fetching facilities:", err);
    }
  };

  const fetchDesignationByState = async () => {
    try {
      setLoading(true);
      setError(null);
      const response = await api.get("/users/analysis/designation-by-state");
      setDesignationByState(response.data);
    } catch (err) {
      console.error("Error fetching designation by state:", err);
      setError(
        `Failed to load designation by state analysis: ${
          err.response?.data?.message || err.message
        }`
      );
    } finally {
      setLoading(false);
    }
  };

  const fetchStaffContacts = async () => {
    try {
      setLoading(true);
      setError(null);
      const params = new URLSearchParams();
      if (selectedState) params.append("state", selectedState);
      if (selectedDesignation)
        params.append("designation", selectedDesignation);
      if (selectedFacility) params.append("facility", selectedFacility);

      const response = await api.get(`/users/contacts?${params.toString()}`);
      setStaffContacts(response.data);

      if (response.data.length === 0) {
        setError("No staff contacts found with the selected filters.");
      }
    } catch (err) {
      console.error("Error fetching staff contacts:", err);
      setError(
        `Failed to load staff contacts: ${
          err.response?.data?.message || err.message
        }`
      );
    } finally {
      setLoading(false);
    }
  };

  const fetchStateContacts = async () => {
    if (!contactState) {
      setError("Please select a state first.");
      return;
    }

    try {
      setLoading(true);
      setError(null);
      const response = await api.get(
        `/users/contacts/state/${encodeURIComponent(contactState)}`
      );
      setStateContacts(response.data);

      if (response.data.totalStaffWithContacts === 0) {
        setError(`No staff contacts found for ${contactState}.`);
      }
    } catch (err) {
      console.error("Error fetching state contacts:", err);
      setError(
        `Failed to load state contacts: ${
          err.response?.data?.message || err.message
        }`
      );
    } finally {
      setLoading(false);
    }
  };

  const tabs = [
    {
      id: "comprehensive-analysis",
      label: "Comprehensive Analysis",
      icon: "📊",
    },
    { id: "state-breakdown", label: "State Breakdown", icon: "🗺️" },
    { id: "designation-breakdown", label: "Designation Breakdown", icon: "👔" },
    { id: "designation-by-state", label: "Designation by State", icon: "📋" },
    { id: "staff-contacts", label: "Staff Contacts", icon: "📞" },
    { id: "state-contacts", label: "State Contacts", icon: "🏛️" },
  ];

  const exportToCSV = (data, filename) => {
    const csvContent = "data:text/csv;charset=utf-8," + data;
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", filename);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const exportContactsToCSV = () => {
    if (!staffContacts.length) return;

    const headers = "Full Name,Phone Number,State,Designation,Facility,LGA\n";
    const csvData = staffContacts
      .map(
        (contact) =>
          `"${contact.fullName}","${contact.phoneNumber}","${contact.state}","${contact.designation}","${contact.facility}","${contact.lga}"`
      )
      .join("\n");

    exportToCSV(
      headers + csvData,
      `staff_contacts_${new Date().toISOString().split("T")[0]}.csv`
    );
  };

  const exportStateContactsToCSV = () => {
    if (!stateContacts || !stateContacts.designationBreakdown.length) return;

    const headers = "Designation,Full Name,Phone Number,Facility,LGA\n";
    const csvData = stateContacts.designationBreakdown
      .flatMap((designation) =>
        designation.contacts.map(
          (contact) =>
            `"${designation.designation}","${contact.fullName}","${contact.phoneNumber}","${contact.facility}","${contact.lga}"`
        )
      )
      .join("\n");

    exportToCSV(
      headers + csvData,
      `${stateContacts.state}_contacts_${
        new Date().toISOString().split("T")[0]
      }.csv`
    );
  };

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">
            Ad Hoc Management
          </h1>
          <p className="text-gray-600 mt-2">
            Comprehensive staff analysis and contact management
          </p>
        </div>

        {/* Navigation Tabs */}
        <div className="mb-6">
          <nav className="flex space-x-8 overflow-x-auto" aria-label="Tabs">
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

        {/* Comprehensive Analysis Tab */}
        {activeTab === "comprehensive-analysis" && (
          <div className="space-y-6">
            {/* Header with refresh button */}
            <div className="flex justify-between items-center">
              <div>
                <h2 className="text-2xl font-bold text-gray-900">
                  Comprehensive Analysis
                </h2>
                <p className="text-gray-600">
                  Overall staff statistics and analysis
                </p>
              </div>
              <button
                onClick={fetchComprehensiveAnalysis}
                disabled={loading}
                className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 disabled:bg-gray-400 text-sm flex items-center space-x-2"
              >
                <span>🔄</span>
                <span>Refresh Data</span>
              </button>
            </div>

            {loading ? (
              <div className="flex justify-center py-8">
                <LoadingSpinner />
              </div>
            ) : comprehensiveAnalysis ? (
              <>
                {/* Overall Summary Cards */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  <Card title="Total Staff" className="bg-blue-50">
                    <div className="text-3xl font-bold text-blue-600">
                      {comprehensiveAnalysis.overallSummary.totalStaff.toLocaleString()}
                    </div>
                    <p className="text-sm text-gray-600 mt-2">
                      {comprehensiveAnalysis.overallSummary.uniqueStates} States
                      • {comprehensiveAnalysis.overallSummary.uniqueFacilities}{" "}
                      Facilities
                    </p>
                  </Card>

                  <Card title="Contact Coverage" className="bg-green-50">
                    <div className="text-3xl font-bold text-green-600">
                      {
                        comprehensiveAnalysis.overallSummary
                          .contactCoveragePercentage
                      }
                      %
                    </div>
                    <p className="text-sm text-gray-600 mt-2">
                      {comprehensiveAnalysis.overallSummary.staffWithContacts.toLocaleString()}{" "}
                      of{" "}
                      {comprehensiveAnalysis.overallSummary.totalStaff.toLocaleString()}{" "}
                      staff
                    </p>
                  </Card>

                  <Card title="Unique Designations" className="bg-purple-50">
                    <div className="text-3xl font-bold text-purple-600">
                      {comprehensiveAnalysis.overallSummary.uniqueDesignations}
                    </div>
                    <p className="text-sm text-gray-600 mt-2">
                      Different job roles
                    </p>
                  </Card>
                </div>

                {/* State Breakdown Table */}
                <Card
                  title="State Analysis"
                  subtitle="Staff distribution and contact coverage by state"
                >
                  <div className="overflow-x-auto">
                    <table className="min-w-full divide-y divide-gray-200">
                      <thead className="bg-gray-50">
                        <tr>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                            State
                          </th>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                            Total Staff
                          </th>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                            With Contacts
                          </th>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                            Contact %
                          </th>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                            Designations
                          </th>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                            Facilities
                          </th>
                        </tr>
                      </thead>
                      <tbody className="bg-white divide-y divide-gray-200">
                        {comprehensiveAnalysis.stateBreakdown.map(
                          (state, index) => (
                            <tr key={index} className="hover:bg-gray-50">
                              <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                                {state.state}
                              </td>
                              <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                {state.totalStaff.toLocaleString()}
                              </td>
                              <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                {state.staffWithContacts.toLocaleString()}
                              </td>
                              <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                <span
                                  className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                                    state.contactPercentage >= 80
                                      ? "bg-green-100 text-green-800"
                                      : state.contactPercentage >= 60
                                      ? "bg-yellow-100 text-yellow-800"
                                      : "bg-red-100 text-red-800"
                                  }`}
                                >
                                  {state.contactPercentage}%
                                </span>
                              </td>
                              <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                {state.uniqueDesignations}
                              </td>
                              <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                {state.uniqueFacilities}
                              </td>
                            </tr>
                          )
                        )}
                      </tbody>
                    </table>
                  </div>
                </Card>

                {/* Designation Breakdown Table */}
                <Card
                  title="Designation Analysis"
                  subtitle="Staff distribution and contact coverage by designation"
                >
                  <div className="overflow-x-auto">
                    <table className="min-w-full divide-y divide-gray-200">
                      <thead className="bg-gray-50">
                        <tr>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                            Designation
                          </th>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                            Total Staff
                          </th>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                            With Contacts
                          </th>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                            Contact %
                          </th>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                            States
                          </th>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                            Facilities
                          </th>
                        </tr>
                      </thead>
                      <tbody className="bg-white divide-y divide-gray-200">
                        {comprehensiveAnalysis.designationBreakdown.map(
                          (designation, index) => (
                            <tr key={index} className="hover:bg-gray-50">
                              <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                                {designation.designation}
                              </td>
                              <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                {designation.totalStaff.toLocaleString()}
                              </td>
                              <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                {designation.staffWithContacts.toLocaleString()}
                              </td>
                              <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                <span
                                  className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                                    designation.contactPercentage >= 80
                                      ? "bg-green-100 text-green-800"
                                      : designation.contactPercentage >= 60
                                      ? "bg-yellow-100 text-yellow-800"
                                      : "bg-red-100 text-red-800"
                                  }`}
                                >
                                  {designation.contactPercentage}%
                                </span>
                              </td>
                              <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                {designation.uniqueStates}
                              </td>
                              <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                {designation.uniqueFacilities}
                              </td>
                            </tr>
                          )
                        )}
                      </tbody>
                    </table>
                  </div>
                </Card>
              </>
            ) : (
              <div className="text-center py-8 text-gray-500">
                Failed to load comprehensive analysis. Please try refreshing.
              </div>
            )}
          </div>
        )}

        {/* State Breakdown Tab */}
        {activeTab === "state-breakdown" && (
          <div className="space-y-6">
            <Card
              title="State Breakdown Analysis"
              subtitle="Detailed analysis of staff distribution by state"
              action={
                <button
                  onClick={() => setActiveTab("comprehensive-analysis")}
                  className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 text-sm"
                >
                  View All Data
                </button>
              }
            >
              {loading ? (
                <div className="flex justify-center py-8">
                  <LoadingSpinner />
                </div>
              ) : (
                <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6">
                  {stateBreakdown.map((state, index) => (
                    <div
                      key={index}
                      className="bg-white border rounded-lg p-6 shadow-sm"
                    >
                      <h3 className="text-lg font-semibold text-gray-900 mb-4">
                        {state.state}
                      </h3>
                      <div className="space-y-3">
                        <div className="flex justify-between items-center">
                          <span className="text-sm text-gray-600">
                            Total Staff:
                          </span>
                          <span className="font-medium">
                            {state.totalStaff.toLocaleString()}
                          </span>
                        </div>
                        <div className="flex justify-between items-center">
                          <span className="text-sm text-gray-600">
                            Contact Coverage:
                          </span>
                          <span
                            className={`font-medium ${
                              state.contactPercentage >= 80
                                ? "text-green-600"
                                : state.contactPercentage >= 60
                                ? "text-yellow-600"
                                : "text-red-600"
                            }`}
                          >
                            {state.contactPercentage}%
                          </span>
                        </div>
                        {state.topDesignation && (
                          <div>
                            <span className="text-sm text-gray-600">
                              Top Designation:
                            </span>
                            <div className="text-sm font-medium">
                              {state.topDesignation.designation} (
                              {state.topDesignation.count})
                            </div>
                          </div>
                        )}
                        <div className="pt-3 border-t">
                          <h4 className="text-sm font-medium text-gray-700 mb-2">
                            Designations:
                          </h4>
                          <div className="space-y-1">
                            {state.designations
                              .slice(0, 3)
                              .map((designation, dIndex) => (
                                <div
                                  key={dIndex}
                                  className="flex justify-between text-xs"
                                >
                                  <span className="text-gray-600">
                                    {designation.designation}:
                                  </span>
                                  <span>
                                    {designation.count} (
                                    {designation.percentage}%)
                                  </span>
                                </div>
                              ))}
                            {state.designations.length > 3 && (
                              <div className="text-xs text-gray-400">
                                +{state.designations.length - 3} more...
                              </div>
                            )}
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </Card>
          </div>
        )}

        {/* Designation Breakdown Tab */}
        {activeTab === "designation-breakdown" && (
          <div className="space-y-6">
            <Card
              title="Designation Breakdown Analysis"
              subtitle="Detailed analysis of staff distribution by designation"
            >
              {loading ? (
                <div className="flex justify-center py-8">
                  <LoadingSpinner />
                </div>
              ) : (
                <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6">
                  {designationBreakdown.map((designation, index) => (
                    <div
                      key={index}
                      className="bg-white border rounded-lg p-6 shadow-sm"
                    >
                      <h3 className="text-lg font-semibold text-gray-900 mb-4">
                        {designation.designation}
                      </h3>
                      <div className="space-y-3">
                        <div className="flex justify-between items-center">
                          <span className="text-sm text-gray-600">
                            Total Staff:
                          </span>
                          <span className="font-medium">
                            {designation.totalStaff.toLocaleString()}
                          </span>
                        </div>
                        <div className="flex justify-between items-center">
                          <span className="text-sm text-gray-600">
                            Contact Coverage:
                          </span>
                          <span
                            className={`font-medium ${
                              designation.contactPercentage >= 80
                                ? "text-green-600"
                                : designation.contactPercentage >= 60
                                ? "text-yellow-600"
                                : "text-red-600"
                            }`}
                          >
                            {designation.contactPercentage}%
                          </span>
                        </div>
                        {designation.topState && (
                          <div>
                            <span className="text-sm text-gray-600">
                              Top State:
                            </span>
                            <div className="text-sm font-medium">
                              {designation.topState.state} (
                              {designation.topState.count})
                            </div>
                          </div>
                        )}
                        <div className="pt-3 border-t">
                          <h4 className="text-sm font-medium text-gray-700 mb-2">
                            States:
                          </h4>
                          <div className="space-y-1">
                            {designation.states
                              .slice(0, 3)
                              .map((state, sIndex) => (
                                <div
                                  key={sIndex}
                                  className="flex justify-between text-xs"
                                >
                                  <span className="text-gray-600">
                                    {state.state}:
                                  </span>
                                  <span>
                                    {state.count} ({state.percentage}%)
                                  </span>
                                </div>
                              ))}
                            {designation.states.length > 3 && (
                              <div className="text-xs text-gray-400">
                                +{designation.states.length - 3} more...
                              </div>
                            )}
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </Card>
          </div>
        )}

        {/* Designation by State Tab */}
        {activeTab === "designation-by-state" && (
          <div className="space-y-6">
            <Card
              title="Designation by State Analysis"
              subtitle="Cross-analysis of designations across states"
              action={
                <button
                  onClick={fetchDesignationByState}
                  disabled={loading}
                  className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 disabled:bg-gray-400 text-sm"
                >
                  Refresh Data
                </button>
              }
            >
              {loading ? (
                <div className="flex justify-center py-8">
                  <LoadingSpinner />
                </div>
              ) : designationByState.length > 0 ? (
                <div className="overflow-x-auto">
                  <table className="min-w-full divide-y divide-gray-200">
                    <thead className="bg-gray-50">
                      <tr>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          State
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Designation
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Count
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Staff
                        </th>
                      </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-200">
                      {designationByState.map((item, index) => (
                        <tr key={index} className="hover:bg-gray-50">
                          <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                            {item.state}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                            {item.designation}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                            <span className="inline-flex px-2 py-1 text-xs font-semibold rounded-full bg-blue-100 text-blue-800">
                              {item.count}
                            </span>
                          </td>
                          <td className="px-6 py-4 text-sm text-gray-500">
                            <div className="max-h-20 overflow-y-auto">
                              {item.staff
                                .slice(0, 3)
                                .map((staff, staffIndex) => (
                                  <div key={staffIndex} className="text-xs">
                                    {staff.fullName} ({staff.facility})
                                  </div>
                                ))}
                              {item.staff.length > 3 && (
                                <div className="text-xs text-gray-400">
                                  +{item.staff.length - 3} more...
                                </div>
                              )}
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              ) : (
                <div className="text-center py-8 text-gray-500">
                  Click "Refresh Data" to load designation by state analysis
                </div>
              )}
            </Card>
          </div>
        )}

        {/* Staff Contacts Tab */}
        {activeTab === "staff-contacts" && (
          <div className="space-y-6">
            <Card
              title="Staff Contact Information"
              subtitle="Search and filter staff contacts"
              action={
                staffContacts.length > 0 && (
                  <button
                    onClick={exportContactsToCSV}
                    className="bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 text-sm"
                  >
                    Export CSV
                  </button>
                )
              }
            >
              {/* Filters */}
              <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    State
                  </label>
                  <select
                    value={selectedState}
                    onChange={(e) => setSelectedState(e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                  >
                    <option value="">All States</option>
                    {states.map((state) => (
                      <option key={state} value={state}>
                        {state}
                      </option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Designation
                  </label>
                  <select
                    value={selectedDesignation}
                    onChange={(e) => setSelectedDesignation(e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                  >
                    <option value="">All Designations</option>
                    {designations.map((designation) => (
                      <option key={designation} value={designation}>
                        {designation}
                      </option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Facility
                  </label>
                  <select
                    value={selectedFacility}
                    onChange={(e) => setSelectedFacility(e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                  >
                    <option value="">All Facilities</option>
                    {facilities.map((facility) => (
                      <option key={facility} value={facility}>
                        {facility}
                      </option>
                    ))}
                  </select>
                </div>
                <div className="flex items-end">
                  <button
                    onClick={fetchStaffContacts}
                    disabled={loading}
                    className="w-full bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 disabled:bg-gray-400"
                  >
                    Search Contacts
                  </button>
                </div>
              </div>

              {/* Results */}
              {loading ? (
                <div className="flex justify-center py-8">
                  <LoadingSpinner />
                </div>
              ) : staffContacts.length > 0 ? (
                <div className="overflow-x-auto">
                  <table className="min-w-full divide-y divide-gray-200">
                    <thead className="bg-gray-50">
                      <tr>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Name
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Phone
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          State
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Designation
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Facility
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          LGA
                        </th>
                      </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-200">
                      {staffContacts.map((contact, index) => (
                        <tr key={index} className="hover:bg-gray-50">
                          <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                            {contact.fullName}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                            <a
                              href={`tel:${contact.phoneNumber}`}
                              className="text-blue-600 hover:text-blue-800"
                            >
                              {contact.phoneNumber}
                            </a>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                            {contact.state}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                            {contact.designation}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                            {contact.facility}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                            {contact.lga}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              ) : (
                <div className="text-center py-8 text-gray-500">
                  Use the filters above to search for staff contacts
                </div>
              )}
            </Card>
          </div>
        )}

        {/* State Contacts Tab */}
        {activeTab === "state-contacts" && (
          <div className="space-y-6">
            <Card
              title="State Contact Analysis"
              subtitle="Detailed contact information grouped by designation for a specific state"
              action={
                stateContacts &&
                stateContacts.designationBreakdown.length > 0 && (
                  <button
                    onClick={exportStateContactsToCSV}
                    className="bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 text-sm"
                  >
                    Export CSV
                  </button>
                )
              }
            >
              {/* State Selection */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Select State
                  </label>
                  <select
                    value={contactState}
                    onChange={(e) => setContactState(e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                  >
                    <option value="">Choose a state</option>
                    {states.map((state) => (
                      <option key={state} value={state}>
                        {state}
                      </option>
                    ))}
                  </select>
                </div>
                <div className="flex items-end">
                  <button
                    onClick={fetchStateContacts}
                    disabled={loading || !contactState}
                    className="w-full bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 disabled:bg-gray-400"
                  >
                    Get State Contacts
                  </button>
                </div>
              </div>

              {/* Results */}
              {loading ? (
                <div className="flex justify-center py-8">
                  <LoadingSpinner />
                </div>
              ) : stateContacts ? (
                <div className="space-y-6">
                  {/* Summary */}
                  <div className="bg-blue-50 p-4 rounded-lg">
                    <h3 className="text-lg font-semibold text-blue-900 mb-2">
                      {stateContacts.state}
                    </h3>
                    <p className="text-sm text-blue-700">
                      Total Staff with Contacts:{" "}
                      {stateContacts.totalStaffWithContacts.toLocaleString()}
                    </p>
                  </div>

                  {/* Designation Breakdown */}
                  <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                    {stateContacts.designationBreakdown.map(
                      (designation, index) => (
                        <div
                          key={index}
                          className="bg-white border rounded-lg p-6 shadow-sm"
                        >
                          <h4 className="text-lg font-semibold text-gray-900 mb-3">
                            {designation.designation}
                            <span className="text-sm font-normal text-gray-500 ml-2">
                              ({designation.count} contacts)
                            </span>
                          </h4>
                          <div className="space-y-2 max-h-60 overflow-y-auto">
                            {designation.contacts.map(
                              (contact, contactIndex) => (
                                <div
                                  key={contactIndex}
                                  className="flex justify-between items-center py-2 border-b border-gray-100"
                                >
                                  <div>
                                    <div className="text-sm font-medium text-gray-900">
                                      {contact.fullName}
                                    </div>
                                    <div className="text-xs text-gray-500">
                                      {contact.facility} • {contact.lga}
                                    </div>
                                  </div>
                                  <a
                                    href={`tel:${contact.phoneNumber}`}
                                    className="text-blue-600 hover:text-blue-800 text-sm"
                                  >
                                    {contact.phoneNumber}
                                  </a>
                                </div>
                              )
                            )}
                          </div>
                        </div>
                      )
                    )}
                  </div>
                </div>
              ) : (
                <div className="text-center py-8 text-gray-500">
                  Select a state to view detailed contact information
                </div>
              )}
            </Card>
          </div>
        )}
      </div>
    </div>
  );
}
