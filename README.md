# HUMAEIN RCM Frontend

A professional React-based frontend for the Revenue Cycle Management (RCM) validation system.

## Features

- **Authentication**: Secure login with JWT token management
- **Dashboard**: Interactive charts and claims validation results
- **File Upload**: Drag-and-drop file upload for claims data
- **Audit Logs**: Comprehensive audit trail for all system activities
- **Responsive Design**: Mobile-friendly interface with Tailwind CSS
- **Real-time Updates**: Live data refresh and validation status updates

## Tech Stack

- **React 19** - Modern React with hooks
- **React Router 7** - Client-side routing
- **Tailwind CSS** - Utility-first CSS framework
- **Chart.js** - Interactive charts and graphs
- **Axios** - HTTP client for API communication
- **React Hook Form** - Form handling and validation
- **React Toastify** - Toast notifications
- **Heroicons** - Beautiful SVG icons

## Getting Started

### Prerequisites

- Node.js 18+ 
- npm or yarn
- Backend API running on port 5000

### Installation

1. Install dependencies:
```bash
npm install
```

2. Create environment file:
```bash
cp .env.example .env
```

3. Update `.env` with your API URL:
```
REACT_APP_API_URL=http://localhost:5000
```

4. Start development server:
```bash
npm run dev
```

5. Open [http://localhost:5173](http://localhost:5173) in your browser

## Project Structure

```
src/
├── components/          # Reusable UI components
│   ├── Layout.jsx      # Main layout with sidebar/navbar
│   └── ClaimDetailModal.jsx
├── contexts/           # React contexts
│   └── AuthContext.jsx # Authentication state management
├── pages/              # Page components
│   ├── Login.jsx       # Login page
│   ├── Dashboard.jsx   # Main dashboard
│   ├── Upload.jsx      # File upload page
│   └── AuditLogs.jsx   # Audit logs page
├── services/           # API services
│   └── api.js          # Axios configuration and API calls
└── App.jsx             # Main app component with routing
```

## API Integration

The frontend integrates with the following backend endpoints:

- `POST /auth/login` - User authentication
- `POST /claims/upload` - File upload
- `GET /claims/results` - Get claims and chart data
- `POST /claims/validate` - Re-validate specific claims
- `GET /claims/audit` - Get audit logs
- `POST /claims/agent` - AI agent queries

## Features Overview

### Dashboard
- Interactive charts showing claims by error category
- Claims table with filtering and pagination
- Real-time validation status updates
- Detailed claim analysis modal

### Upload
- Drag-and-drop file upload interface
- Support for CSV, XLSX, and XLS files
- Upload progress tracking
- File validation and error handling

### Audit Logs
- Comprehensive audit trail
- Filter by claim ID, action type
- Pagination for large datasets
- Detailed action outcomes

## Styling

The application uses Tailwind CSS for styling with a professional healthcare/finance theme:

- **Primary Colors**: Blue (#3B82F6) for trust and professionalism
- **Status Colors**: Green (valid), Red (invalid), Yellow (warning)
- **Typography**: Clean, readable fonts with proper hierarchy
- **Layout**: Responsive grid system with consistent spacing

## Development

### Available Scripts

- `npm run dev` - Start development server
- `npm run build` - Build for production
- `npm run preview` - Preview production build
- `npm run lint` - Run ESLint

### Code Quality

- ESLint configuration for code quality
- Consistent code formatting
- Component-based architecture
- Proper error handling and loading states

## Deployment

1. Build the application:
```bash
npm run build
```

2. The `dist` folder contains the production build
3. Deploy to your preferred hosting service (Vercel, Netlify, etc.)

## Browser Support

- Chrome 90+
- Firefox 88+
- Safari 14+
- Edge 90+

## Contributing

1. Follow the existing code style
2. Use meaningful component and variable names
3. Add proper error handling
4. Test on multiple screen sizes
5. Ensure accessibility compliance