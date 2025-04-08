export const initialChallenges = [
  {
    title: "Counter App",
    description: "Create a simple counter application with increment and decrement buttons using React state.",
    difficulty: "beginner",
    points: 100,
    estimatedTime: "30 mins",
    category: "state",
    completedBy: 0,
    imageUrl: "https://source.unsplash.com/featured/?coding",
    requirements: [
      "Implement a counter display",
      "Add increment button",
      "Add decrement button",
      "Prevent counter from going below 0",
      "Add a reset button"
    ],
    testCases: [
      {
        description: "Counter should start at 0",
        test: "expect(counter).toBe(0)"
      },
      {
        description: "Increment should add 1 to counter",
        test: "expect(counter).toBe(previousValue + 1)"
      },
      {
        description: "Decrement should subtract 1 from counter",
        test: "expect(counter).toBe(previousValue - 1)"
      }
    ]
  },
  {
    title: "Todo List",
    description: "Build a todo list application with the ability to add, complete, and delete tasks.",
    difficulty: "beginner",
    points: 150,
    estimatedTime: "45 mins",
    category: "state",
    completedBy: 0,
    imageUrl: "https://source.unsplash.com/featured/?todo",
    requirements: [
      "Add new tasks",
      "Mark tasks as complete",
      "Delete tasks",
      "Display total number of tasks",
      "Filter tasks by status"
    ],
    testCases: [
      {
        description: "Should add new task to list",
        test: "expect(todos.length).toBe(previousLength + 1)"
      },
      {
        description: "Should mark task as complete",
        test: "expect(todo.completed).toBe(true)"
      }
    ]
  },
  {
    title: "API Data Fetching",
    description: "Create a component that fetches and displays data from an API using React hooks.",
    difficulty: "intermediate",
    points: 200,
    estimatedTime: "1 hour",
    category: "api",
    completedBy: 0,
    imageUrl: "https://source.unsplash.com/featured/?api",
    requirements: [
      "Fetch data from provided API",
      "Display loading state",
      "Handle errors",
      "Display data in a list/grid",
      "Implement search/filter functionality"
    ],
    testCases: [
      {
        description: "Should show loading state while fetching",
        test: "expect(loading).toBe(true)"
      },
      {
        description: "Should display error message on failure",
        test: "expect(error).toBeTruthy()"
      }
    ]
  },
  {
    title: "Form Validation",
    description: "Implement a form with validation using React hooks and custom validation logic.",
    difficulty: "intermediate",
    points: 250,
    estimatedTime: "1.5 hours",
    category: "forms",
    completedBy: 0,
    imageUrl: "https://source.unsplash.com/featured/?form",
    requirements: [
      "Create registration form",
      "Validate email format",
      "Validate password strength",
      "Show validation errors",
      "Enable/disable submit based on validation"
    ],
    testCases: [
      {
        description: "Should validate email format",
        test: "expect(isValidEmail).toBe(true)"
      },
      {
        description: "Should check password strength",
        test: "expect(isStrongPassword).toBe(true)"
      }
    ]
  },
  {
    title: "State Management",
    description: "Build a complex application using React Context or Redux for state management.",
    difficulty: "expert",
    points: 350,
    estimatedTime: "2 hours",
    category: "state",
    completedBy: 0,
    imageUrl: "https://source.unsplash.com/featured/?state",
    requirements: [
      "Implement global state management",
      "Create multiple reducers",
      "Handle async actions",
      "Implement optimistic updates",
      "Add error handling and rollback"
    ],
    testCases: [
      {
        description: "Should update global state",
        test: "expect(state).toEqual(expectedState)"
      },
      {
        description: "Should handle async actions",
        test: "expect(asyncResult).toBeTruthy()"
      }
    ]
  }
]; 