# Job Application Tracker

A full-stack web application for tracking job applications, managing interviews, and organizing your job search process.

## Features

- Track job applications with detailed information
- Manage application sources (LinkedIn, Indeed, etc.)
- Tag system for better organization
- Interview scheduling with Google Calendar integration
- Email reminders for upcoming interviews
- Export applications to Excel
- Dark mode support
- Responsive design for mobile and desktop

## Tech Stack

### Frontend
- React
- Vite
- Tailwind CSS
- React Testing Library
- Vitest
- Lucide React Icons

### Backend
- Node.js
- Express
- MongoDB
- Passport (Google OAuth)
- Node-cron
- Nodemailer

## Getting Started

### Prerequisites
- Node.js (v18 or higher)
- MongoDB
- Google Cloud Console project with Calendar and Gmail APIs enabled

### Installation

1. Clone the repository
```bash
git clone https://github.com/FabienDostieIT/JobTracker
cd JobTracker
```

2. Install dependencies
```bash
# Install backend dependencies
cd backend
npm install

# Install frontend dependencies
cd ../frontend
npm install
```

3. Configure environment variables
```bash
# In backend directory, create .env file
cp .env.example .env
# Edit .env with your configuration
```

4. Start the development servers
```bash
# Start backend server (from backend directory)
npm run dev

# Start frontend server (from frontend directory)
npm run dev
```

The application will be available at http://localhost:5173

## Testing

```bash
# Run frontend tests
cd frontend
npm test

# Run frontend tests with coverage
npm run test:coverage
```

## Contributing

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit your changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

## License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.
