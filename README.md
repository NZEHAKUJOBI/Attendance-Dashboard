# Attendance Dashboard

A comprehensive React-based dashboard for monitoring attendance systems, device health, and generating detailed reports.

## 🚀 Features

### Dashboard Overview

- **Real-time Statistics**: Total facilities, devices, attendance records, and success rates
- **Device Health Monitoring**: Live status of all attendance devices across facilities
- **Interactive Charts**: Multiple chart types showing attendance data and trends
- **Auto-refresh**: Dashboard updates automatically every 30 seconds

### Charts & Analytics

- **Multiple Chart Types**: Bar charts, line charts, doughnut charts, and radar charts
- **Interactive Filtering**: Filter data by year and month
- **Performance Metrics**: Success rates, facility comparisons, and trend analysis

### Comprehensive Reports

- **Facility Summary**: Overview of all facilities with attendance statistics
- **Facility Reports**: Detailed monthly reports for specific facilities
- **User Timesheets**: Individual employee attendance records
- **PDF Export**: Generate and download professional PDF reports

### Device Health Monitoring

- **Real-time Status**: Live monitoring of all attendance devices
- **Advanced Filtering**: Filter by status, facility, state, or search terms
- **Status Indicators**: Visual indicators for online/offline/warning states
- **Detailed Information**: IP addresses, last seen times, and facility codes

## 🏗️ Architecture

### Frontend Structure

```
src/
├── components/          # Reusable UI components
│   ├── Card.jsx        # Generic card component
│   ├── StatCard.jsx    # Statistics display card
│   ├── LoadingSpinner.jsx
│   ├── DeviceStatusBadge.jsx
│   └── Layout.jsx      # Main layout with navigation
├── pages/              # Main application pages
│   ├── Dashboard.jsx   # Main dashboard overview
│   ├── Charts.jsx      # Analytics and charts
│   ├── Reports.jsx     # Report generation
│   ├── DeviceHealth.jsx # Device monitoring
│   └── Login.jsx       # Authentication
├── api/                # API integration
│   ├── axios.js        # HTTP client configuration
│   └── apiService.js   # Centralized API calls
├── hooks/              # Custom React hooks
│   └── useApi.js       # API state management hooks
├── utils/              # Utility functions
│   └── helpers.js      # Date, number, and data formatting
└── context/            # React context providers
    └── AuthContext.jsx # Authentication state
```

### Backend Integration

The dashboard integrates with the following backend APIs:

#### Reports API (`/api/reports`)

- `GET /facility-summary` - Facility attendance overview
- `GET /facility/{facility}/{year}/{month}` - Detailed facility reports
- `GET /timesheet/{userId}/{year}/{month}` - User attendance records
- `GET /timesheet-pdf/{userId}/{year}/{month}` - PDF timesheet download
- `GET /analytics/{year}/{month}` - Analytics data for charts
- `POST /receive` - Submit attendance reports

#### Device Health API (`/api/health`)

- `GET /status` - All device statuses and health information
- `POST /ping` - Device health ping endpoint

#### User Management API (`/api/users`)

- `POST /sync` - Synchronize user data

## 🛠️ Technology Stack

### Frontend

- **React 19** - Modern React with hooks and functional components
- **React Router Dom** - Client-side routing
- **Chart.js + React-ChartJS-2** - Interactive charts and visualizations
- **Tailwind CSS** - Utility-first CSS framework
- **Axios** - HTTP client for API calls
- **jsPDF + jsPDF-AutoTable** - PDF generation
- **PropTypes** - Component prop validation

### Backend (.NET)

- **.NET 8/9** - Modern .NET framework
- **Entity Framework Core** - ORM for database operations
- **PostgreSQL** - Primary database
- **ASP.NET Core** - Web API framework
- **QuestPDF** - PDF generation for server-side reports

## 📊 Key Features Explained

### Real-time Dashboard

- Displays live statistics from all connected facilities
- Shows device health status with color-coded indicators
- Provides quick overview cards with key metrics
- Auto-refreshes data every 30 seconds

### Advanced Charts

- **Bar Charts**: Compare attendance across facilities
- **Line Charts**: Track success rate trends over time
- **Doughnut Charts**: Show distribution and proportions
- **Radar Charts**: Multi-dimensional facility performance view

### Report Generation

- **Facility Summary Reports**: Export comprehensive facility data to PDF
- **Monthly Facility Reports**: Detailed employee attendance for specific facilities
- **Individual Timesheets**: Personal attendance records with PDF download
- **Custom Date Ranges**: Filter reports by year and month

### Device Monitoring

- **Live Status Tracking**: Real-time device online/offline status
- **Smart Status Detection**: Automatic offline detection based on last ping time
- **Geographic Organization**: Filter by state, LGA, and facility
- **Search Functionality**: Find devices by name, facility, or location

## 🔧 Configuration

### API Configuration

Update the base URL in `src/api/axios.js`:

```javascript
const api = axios.create({
  baseURL: "http://localhost:5000/api", // Your backend URL
  timeout: 10000,
});
```

### Environment Variables

Create a `.env` file in the root directory:

```env
VITE_API_BASE_URL=http://localhost:5000/api
VITE_REFRESH_INTERVAL=30000
```

## 🚀 Getting Started

### Prerequisites

- Node.js 18+ and npm
- .NET 8/9 SDK
- PostgreSQL database

### Frontend Setup

```bash
# Install dependencies
npm install

# Start development server
npm run dev

# Build for production
npm run build
```

### Backend Setup

```bash
# Navigate to backend directory
cd AttendanceReportService

# Restore packages
dotnet restore

# Update database
dotnet ef database update

# Run the application
dotnet run
```

## 📱 Responsive Design

The dashboard is fully responsive and works seamlessly across:

- **Desktop** - Full feature set with sidebar navigation
- **Tablet** - Responsive grid layouts and touch-friendly controls
- **Mobile** - Collapsible navigation and optimized data tables

## 🔐 Security Features

- **JWT Authentication** - Secure token-based authentication
- **Route Protection** - Private routes requiring authentication
- **Automatic Token Refresh** - Seamless session management
- **Secure HTTP Headers** - CORS and security headers configured

## 📈 Performance Optimizations

- **Lazy Loading** - Components and routes loaded on demand
- **Data Caching** - Intelligent caching of API responses
- **Optimized Re-renders** - React memo and useCallback optimizations
- **Bundle Splitting** - Code splitting for faster initial loads

## 🧪 Testing

```bash
# Run tests
npm test

# Run tests with coverage
npm run test:coverage

# Run E2E tests
npm run test:e2e
```

## 📦 Deployment

### Frontend Deployment

```bash
# Build the application
npm run build

# Deploy to your hosting provider
# The build folder contains the production-ready files
```

### Backend Deployment

```bash
# Publish the application
dotnet publish -c Release

# Deploy to your server or cloud provider
```

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## 📄 License

This project is licensed under the MIT License - see the LICENSE file for details.

## 🆘 Support

For support and questions:

- Create an issue in the GitHub repository
- Check the documentation in the `/docs` folder
- Review the API documentation at `/api/swagger`

---

**Built with ❤️ for efficient attendance management**
