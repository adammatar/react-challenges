# React Challenges

A modern web application for practicing coding challenges with real-time testing and solution validation.

## Features

- **Interactive Coding Environment**
  - Real-time code editing with Monaco Editor
  - Support for both JavaScript and TypeScript
  - Syntax highlighting and code completion

- **Challenge Management**
  - Create and manage coding challenges
  - Define test cases and solutions
  - Track user progress and completion

- **Real-time Testing**
  - Instant test execution
  - Detailed test results
  - Support for multiple test cases

- **User Progress Tracking**
  - Track completed challenges
  - Earn points for successful solutions
  - View progress statistics

- **Admin Dashboard**
  - Create and manage challenges
  - View user statistics
  - Monitor challenge completion rates

## Tech Stack

- **Frontend**
  - React
  - TypeScript
  - Material-UI
  - Monaco Editor
  - Firebase (Authentication & Firestore)

- **Development Tools**
  - Vite
  - ESLint
  - Prettier
  - TypeScript

## Getting Started

### Prerequisites

- Node.js (v14 or higher)
- npm or yarn
- Firebase account

### Installation

1. Clone the repository:
   ```bash
   git clone https://github.com/yourusername/react-challenges.git
   cd react-challenges
   ```

2. Install dependencies:
   ```bash
   npm install
   ```

3. Set up Firebase:
   - Create a new Firebase project
   - Enable Authentication and Firestore
   - Add your Firebase configuration to `src/config/firebase.ts`

4. Start the development server:
   ```bash
   npm run dev
   ```

## Project Structure

```
src/
├── components/         # React components
│   ├── Admin/         # Admin dashboard components
│   └── ChallengeSolver/ # Challenge solving interface
├── config/            # Configuration files
├── contexts/          # React contexts
├── data/             # Challenge data
├── services/         # API and service functions
├── types/            # TypeScript type definitions
└── utils/            # Utility functions
```

## Creating Challenges

1. Access the Admin Dashboard
2. Click "Create New Challenge"
3. Fill in the challenge details:
   - Title and description
   - Difficulty level
   - Points
   - Starter code
   - Test cases
   - Solution

## Contributing

1. Fork the repository
2. Create a feature branch
3. Commit your changes
4. Push to the branch
5. Create a Pull Request

## License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## Acknowledgments

- [Monaco Editor](https://microsoft.github.io/monaco-editor/)
- [Material-UI](https://mui.com/)
- [Firebase](https://firebase.google.com/)

## Developer

Adam Matar - https://linkedin.com/in/adammatar
