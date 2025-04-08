export const reactChallenges = [
  // State Management Challenges
  {
    title: "Counter with Custom Hook",
    description: "Create a counter using a custom hook that handles increment, decrement, and reset functionality.",
    difficulty: "beginner",
    points: 100,
    estimatedTime: "30 mins",
    category: "state",
    completedBy: 0,
    imageUrl: "https://source.unsplash.com/featured/?counter",
    requirements: [
      "Create a custom useCounter hook",
      "Implement increment, decrement, and reset functions",
      "Add minimum and maximum value constraints",
      "Include step size functionality",
      "Add a reset button"
    ],
    testCases: [
      {
        description: "Counter should start at initial value",
        test: "expect(counter).toBe(initialValue)"
      },
      {
        description: "Increment should add step size to counter",
        test: "expect(counter).toBe(previousValue + step)"
      }
    ]
  },
  {
    title: "Todo List with Local Storage",
    description: "Build a todo list that persists data in local storage and includes filtering and sorting options.",
    difficulty: "beginner",
    points: 150,
    estimatedTime: "45 mins",
    category: "state",
    completedBy: 0,
    imageUrl: "https://source.unsplash.com/featured/?todo",
    requirements: [
      "Persist todos in local storage",
      "Add, edit, and delete todos",
      "Mark todos as complete",
      "Filter by status (all/active/completed)",
      "Sort by date/priority",
      "Add due dates to todos"
    ],
    testCases: [
      {
        description: "Todos should persist after page refresh",
        test: "expect(localStorage.getItem('todos')).toBeTruthy()"
      },
      {
        description: "Should filter todos correctly",
        test: "expect(filteredTodos.length).toBe(expectedLength)"
      }
    ]
  },
  {
    title: "Shopping Cart with Context",
    description: "Implement a shopping cart using React Context for state management.",
    difficulty: "intermediate",
    points: 200,
    estimatedTime: "1 hour",
    category: "state",
    completedBy: 0,
    imageUrl: "https://source.unsplash.com/featured/?shopping",
    requirements: [
      "Create a CartContext",
      "Add/remove items from cart",
      "Update item quantities",
      "Calculate total price",
      "Show cart summary",
      "Implement checkout process"
    ],
    testCases: [
      {
        description: "Should add items to cart",
        test: "expect(cartItems.length).toBe(previousLength + 1)"
      },
      {
        description: "Should calculate correct total",
        test: "expect(total).toBe(expectedTotal)"
      }
    ]
  },
  {
    title: "Redux Todo App",
    description: "Build a todo application using Redux Toolkit for state management.",
    difficulty: "intermediate",
    points: 250,
    estimatedTime: "1.5 hours",
    category: "state",
    completedBy: 0,
    imageUrl: "https://source.unsplash.com/featured/?redux",
    requirements: [
      "Set up Redux store with Redux Toolkit",
      "Create todo slice with CRUD operations",
      "Implement async thunks for API calls",
      "Add loading and error states",
      "Include optimistic updates",
      "Add undo/redo functionality"
    ],
    testCases: [
      {
        description: "Should handle async operations",
        test: "expect(loading).toBe(false)"
      },
      {
        description: "Should update state correctly",
        test: "expect(state.todos).toEqual(expectedTodos)"
      }
    ]
  },
  {
    title: "Real-time Chat App",
    description: "Create a real-time chat application using React and WebSocket.",
    difficulty: "expert",
    points: 350,
    estimatedTime: "2 hours",
    category: "state",
    completedBy: 0,
    imageUrl: "https://source.unsplash.com/featured/?chat",
    requirements: [
      "Implement WebSocket connection",
      "Handle real-time message updates",
      "Add typing indicators",
      "Show online/offline status",
      "Implement message history",
      "Add file sharing capability"
    ],
    testCases: [
      {
        description: "Should establish WebSocket connection",
        test: "expect(ws.readyState).toBe(WebSocket.OPEN)"
      },
      {
        description: "Should receive real-time updates",
        test: "expect(messages).toContain(newMessage)"
      }
    ]
  },

  // Hooks Challenges
  {
    title: "Custom useFetch Hook",
    description: "Create a custom hook for handling API requests with loading and error states.",
    difficulty: "intermediate",
    points: 200,
    estimatedTime: "1 hour",
    category: "hooks",
    completedBy: 0,
    imageUrl: "https://source.unsplash.com/featured/?api",
    requirements: [
      "Handle GET, POST, PUT, DELETE requests",
      "Manage loading state",
      "Handle errors gracefully",
      "Implement caching",
      "Add retry mechanism",
      "Support request cancellation"
    ],
    testCases: [
      {
        description: "Should handle successful requests",
        test: "expect(data).toBeTruthy()"
      },
      {
        description: "Should show loading state",
        test: "expect(loading).toBe(true)"
      }
    ]
  },
  {
    title: "useInfiniteScroll Hook",
    description: "Implement a custom hook for infinite scrolling functionality.",
    difficulty: "intermediate",
    points: 250,
    estimatedTime: "1.5 hours",
    category: "hooks",
    completedBy: 0,
    imageUrl: "https://source.unsplash.com/featured/?scroll",
    requirements: [
      "Detect scroll position",
      "Load more data on scroll",
      "Handle loading states",
      "Implement error handling",
      "Add scroll restoration",
      "Support mobile devices"
    ],
    testCases: [
      {
        description: "Should load more data on scroll",
        test: "expect(items.length).toBeGreaterThan(initialLength)"
      },
      {
        description: "Should handle scroll restoration",
        test: "expect(scrollPosition).toBe(previousPosition)"
      }
    ]
  },
  {
    title: "useForm Hook",
    description: "Create a custom hook for form handling with validation.",
    difficulty: "intermediate",
    points: 200,
    estimatedTime: "1 hour",
    category: "hooks",
    completedBy: 0,
    imageUrl: "https://source.unsplash.com/featured/?form",
    requirements: [
      "Handle form state",
      "Implement field validation",
      "Show validation errors",
      "Support nested fields",
      "Add form submission handling",
      "Implement field dependencies"
    ],
    testCases: [
      {
        description: "Should validate form fields",
        test: "expect(isValid).toBe(true)"
      },
      {
        description: "Should show validation errors",
        test: "expect(errors).toBeTruthy()"
      }
    ]
  },
  {
    title: "useLocalStorage Hook",
    description: "Build a custom hook for managing local storage with type safety.",
    difficulty: "beginner",
    points: 150,
    estimatedTime: "45 mins",
    category: "hooks",
    completedBy: 0,
    imageUrl: "https://source.unsplash.com/featured/?storage",
    requirements: [
      "Handle different data types",
      "Implement type safety",
      "Add expiration support",
      "Handle storage errors",
      "Support multiple keys",
      "Add clear functionality"
    ],
    testCases: [
      {
        description: "Should persist data",
        test: "expect(localStorage.getItem(key)).toBeTruthy()"
      },
      {
        description: "Should handle type conversion",
        test: "expect(typeof value).toBe('string')"
      }
    ]
  },
  {
    title: "useDebounce Hook",
    description: "Create a custom hook for debouncing function calls.",
    difficulty: "intermediate",
    points: 200,
    estimatedTime: "1 hour",
    category: "hooks",
    completedBy: 0,
    imageUrl: "https://source.unsplash.com/featured/?debounce",
    requirements: [
      "Implement debounce logic",
      "Handle cleanup",
      "Support different delay times",
      "Add immediate execution option",
      "Handle multiple calls",
      "Support TypeScript"
    ],
    testCases: [
      {
        description: "Should debounce function calls",
        test: "expect(callCount).toBe(1)"
      },
      {
        description: "Should handle cleanup",
        test: "expect(cleanup).toBeCalled()"
      }
    ]
  },

  // Performance Challenges
  {
    title: "Virtualized List",
    description: "Implement a virtualized list component for handling large datasets.",
    difficulty: "expert",
    points: 350,
    estimatedTime: "2 hours",
    category: "performance",
    completedBy: 0,
    imageUrl: "https://source.unsplash.com/featured/?list",
    requirements: [
      "Render only visible items",
      "Handle dynamic item heights",
      "Implement smooth scrolling",
      "Add placeholder loading",
      "Support horizontal scrolling",
      "Handle window resizing"
    ],
    testCases: [
      {
        description: "Should render only visible items",
        test: "expect(renderedItems.length).toBeLessThan(totalItems)"
      },
      {
        description: "Should handle scroll events",
        test: "expect(scrollPosition).toBe(previousPosition)"
      }
    ]
  },
  {
    title: "Memoized Components",
    description: "Optimize a complex component tree using React.memo and useMemo.",
    difficulty: "intermediate",
    points: 250,
    estimatedTime: "1.5 hours",
    category: "performance",
    completedBy: 0,
    imageUrl: "https://source.unsplash.com/featured/?memo",
    requirements: [
      "Identify unnecessary re-renders",
      "Implement React.memo",
      "Use useMemo for expensive calculations",
      "Optimize prop passing",
      "Add performance monitoring",
      "Handle edge cases"
    ],
    testCases: [
      {
        description: "Should prevent unnecessary re-renders",
        test: "expect(renderCount).toBeLessThan(previousCount)"
      },
      {
        description: "Should memoize expensive calculations",
        test: "expect(calculationTime).toBeLessThan(previousTime)"
      }
    ]
  },
  {
    title: "Code Splitting",
    description: "Implement code splitting in a React application using dynamic imports.",
    difficulty: "intermediate",
    points: 200,
    estimatedTime: "1 hour",
    category: "performance",
    completedBy: 0,
    imageUrl: "https://source.unsplash.com/featured/?split",
    requirements: [
      "Split routes into chunks",
      "Implement lazy loading",
      "Add loading states",
      "Handle errors gracefully",
      "Optimize bundle size",
      "Add preloading"
    ],
    testCases: [
      {
        description: "Should load chunks on demand",
        test: "expect(chunkLoaded).toBe(true)"
      },
      {
        description: "Should show loading state",
        test: "expect(loading).toBe(true)"
      }
    ]
  },
  {
    title: "Image Optimization",
    description: "Create an image optimization component with lazy loading and blur placeholder.",
    difficulty: "intermediate",
    points: 200,
    estimatedTime: "1 hour",
    category: "performance",
    completedBy: 0,
    imageUrl: "https://source.unsplash.com/featured/?image",
    requirements: [
      "Implement lazy loading",
      "Add blur placeholder",
      "Handle different image formats",
      "Optimize image sizes",
      "Add error handling",
      "Support responsive images"
    ],
    testCases: [
      {
        description: "Should lazy load images",
        test: "expect(imageLoaded).toBe(false)"
      },
      {
        description: "Should show placeholder",
        test: "expect(placeholderVisible).toBe(true)"
      }
    ]
  },
  {
    title: "Web Workers",
    description: "Implement Web Workers for heavy computations in a React application.",
    difficulty: "expert",
    points: 350,
    estimatedTime: "2 hours",
    category: "performance",
    completedBy: 0,
    imageUrl: "https://source.unsplash.com/featured/?worker",
    requirements: [
      "Set up Web Worker",
      "Handle worker communication",
      "Process large datasets",
      "Implement progress updates",
      "Handle worker errors",
      "Add worker pooling"
    ],
    testCases: [
      {
        description: "Should process data in worker",
        test: "expect(mainThreadBlocked).toBe(false)"
      },
      {
        description: "Should handle worker messages",
        test: "expect(messageReceived).toBe(true)"
      }
    ]
  },

  // Testing Challenges
  {
    title: "Component Testing",
    description: "Write comprehensive tests for a React component using Jest and React Testing Library.",
    difficulty: "intermediate",
    points: 200,
    estimatedTime: "1 hour",
    category: "testing",
    completedBy: 0,
    imageUrl: "https://source.unsplash.com/featured/?test",
    requirements: [
      "Test component rendering",
      "Test user interactions",
      "Test prop changes",
      "Test error states",
      "Test accessibility",
      "Add snapshot testing"
    ],
    testCases: [
      {
        description: "Should render correctly",
        test: "expect(component).toBeInTheDocument()"
      },
      {
        description: "Should handle user input",
        test: "expect(inputValue).toBe(expectedValue)"
      }
    ]
  },
  {
    title: "Hook Testing",
    description: "Create and test a custom React hook using React Testing Library.",
    difficulty: "intermediate",
    points: 250,
    estimatedTime: "1.5 hours",
    category: "testing",
    completedBy: 0,
    imageUrl: "https://source.unsplash.com/featured/?hook",
    requirements: [
      "Test hook initialization",
      "Test state updates",
      "Test side effects",
      "Test cleanup",
      "Test error handling",
      "Add performance tests"
    ],
    testCases: [
      {
        description: "Should initialize correctly",
        test: "expect(initialState).toBe(expectedState)"
      },
      {
        description: "Should handle updates",
        test: "expect(updatedState).toBe(expectedState)"
      }
    ]
  },
  {
    title: "Redux Testing",
    description: "Write tests for Redux actions, reducers, and selectors.",
    difficulty: "intermediate",
    points: 250,
    estimatedTime: "1.5 hours",
    category: "testing",
    completedBy: 0,
    imageUrl: "https://source.unsplash.com/featured/?redux",
    requirements: [
      "Test action creators",
      "Test reducers",
      "Test selectors",
      "Test async actions",
      "Test middleware",
      "Add integration tests"
    ],
    testCases: [
      {
        description: "Should create correct action",
        test: "expect(action).toEqual(expectedAction)"
      },
      {
        description: "Should update state correctly",
        test: "expect(newState).toEqual(expectedState)"
      }
    ]
  },
  {
    title: "Form Testing",
    description: "Write tests for a complex form component with validation.",
    difficulty: "intermediate",
    points: 200,
    estimatedTime: "1 hour",
    category: "testing",
    completedBy: 0,
    imageUrl: "https://source.unsplash.com/featured/?form",
    requirements: [
      "Test form submission",
      "Test validation rules",
      "Test error messages",
      "Test field dependencies",
      "Test form reset",
      "Add accessibility tests"
    ],
    testCases: [
      {
        description: "Should validate form fields",
        test: "expect(isValid).toBe(false)"
      },
      {
        description: "Should show error messages",
        test: "expect(errorMessage).toBeInTheDocument()"
      }
    ]
  },
  {
    title: "API Testing",
    description: "Create tests for API integration in a React application.",
    difficulty: "intermediate",
    points: 250,
    estimatedTime: "1.5 hours",
    category: "testing",
    completedBy: 0,
    imageUrl: "https://source.unsplash.com/featured/?api",
    requirements: [
      "Mock API responses",
      "Test loading states",
      "Test error handling",
      "Test data transformation",
      "Test retry logic",
      "Add integration tests"
    ],
    testCases: [
      {
        description: "Should handle API success",
        test: "expect(data).toEqual(expectedData)"
      },
      {
        description: "Should handle API errors",
        test: "expect(error).toBeTruthy()"
      }
    ]
  },

  // Animation Challenges
  {
    title: "Animated Modal",
    description: "Create a modal component with smooth enter/exit animations.",
    difficulty: "intermediate",
    points: 200,
    estimatedTime: "1 hour",
    category: "animation",
    completedBy: 0,
    imageUrl: "https://source.unsplash.com/featured/?modal",
    requirements: [
      "Implement fade animation",
      "Add scale transition",
      "Handle keyboard events",
      "Add backdrop blur",
      "Support different sizes",
      "Add accessibility"
    ],
    testCases: [
      {
        description: "Should animate on enter",
        test: "expect(animationComplete).toBe(true)"
      },
      {
        description: "Should handle keyboard events",
        test: "expect(escPressed).toBe(true)"
      }
    ]
  },
  {
    title: "Infinite Scroll Animation",
    description: "Implement smooth animations for an infinite scroll list.",
    difficulty: "expert",
    points: 350,
    estimatedTime: "2 hours",
    category: "animation",
    completedBy: 0,
    imageUrl: "https://source.unsplash.com/featured/?scroll",
    requirements: [
      "Add item enter animation",
      "Implement smooth scrolling",
      "Handle scroll position",
      "Add loading animation",
      "Support touch events",
      "Optimize performance"
    ],
    testCases: [
      {
        description: "Should animate new items",
        test: "expect(animationRunning).toBe(true)"
      },
      {
        description: "Should handle scroll events",
        test: "expect(scrollPosition).toBe(previousPosition)"
      }
    ]
  },
  {
    title: "Page Transitions",
    description: "Create smooth page transitions using React Router and Framer Motion.",
    difficulty: "expert",
    points: 350,
    estimatedTime: "2 hours",
    category: "animation",
    completedBy: 0,
    imageUrl: "https://source.unsplash.com/featured/?transition",
    requirements: [
      "Implement route transitions",
      "Add shared element transitions",
      "Handle navigation events",
      "Add loading states",
      "Support different directions",
      "Optimize performance"
    ],
    testCases: [
      {
        description: "Should animate route change",
        test: "expect(transitionComplete).toBe(true)"
      },
      {
        description: "Should handle shared elements",
        test: "expect(sharedElementMoved).toBe(true)"
      }
    ]
  },
  {
    title: "Drag and Drop",
    description: "Create a drag and drop interface with smooth animations.",
    difficulty: "expert",
    points: 350,
    estimatedTime: "2 hours",
    category: "animation",
    completedBy: 0,
    imageUrl: "https://source.unsplash.com/featured/?drag",
    requirements: [
      "Implement drag functionality",
      "Add drop animations",
      "Handle reordering",
      "Support touch devices",
      "Add visual feedback",
      "Optimize performance"
    ],
    testCases: [
      {
        description: "Should handle drag start",
        test: "expect(dragStarted).toBe(true)"
      },
      {
        description: "Should animate drop",
        test: "expect(dropAnimationComplete).toBe(true)"
      }
    ]
  },
  {
    title: "Loading Skeleton",
    description: "Create an animated loading skeleton for content placeholders.",
    difficulty: "intermediate",
    points: 200,
    estimatedTime: "1 hour",
    category: "animation",
    completedBy: 0,
    imageUrl: "https://source.unsplash.com/featured/?loading",
    requirements: [
      "Create skeleton components",
      "Add shimmer effect",
      "Match content layout",
      "Handle different sizes",
      "Add fade transition",
      "Optimize performance"
    ],
    testCases: [
      {
        description: "Should show skeleton while loading",
        test: "expect(skeletonVisible).toBe(true)"
      },
      {
        description: "Should animate shimmer effect",
        test: "expect(animationRunning).toBe(true)"
      }
    ]
  },

  // Advanced React Patterns
  {
    title: "Compound Components",
    description: "Create a flexible form component using the compound components pattern.",
    difficulty: "intermediate",
    points: 250,
    estimatedTime: "1.5 hours",
    category: "patterns",
    completedBy: 0,
    imageUrl: "https://source.unsplash.com/featured/?compound",
    requirements: [
      "Create a Form compound component",
      "Implement Form.Input, Form.Label, Form.Error components",
      "Handle form state internally",
      "Support custom validation",
      "Add accessibility features",
      "Implement context for state sharing"
    ],
    testCases: [
      {
        description: "Should render compound components correctly",
        test: "expect(formComponents).toBeInTheDocument()"
      },
      {
        description: "Should handle form state",
        test: "expect(formState).toEqual(expectedState)"
      }
    ]
  },
  {
    title: "Render Props Pattern",
    description: "Implement a data fetching component using the render props pattern.",
    difficulty: "intermediate",
    points: 200,
    estimatedTime: "1 hour",
    category: "patterns",
    completedBy: 0,
    imageUrl: "https://source.unsplash.com/featured/?render",
    requirements: [
      "Create a DataFetcher component",
      "Implement render prop pattern",
      "Handle loading and error states",
      "Support different data sources",
      "Add caching mechanism",
      "Implement retry logic"
    ],
    testCases: [
      {
        description: "Should render children with data",
        test: "expect(renderedContent).toBeInTheDocument()"
      },
      {
        description: "Should handle loading state",
        test: "expect(loading).toBe(true)"
      }
    ]
  },
  {
    title: "Higher-Order Components",
    description: "Create a HOC for handling authentication and authorization.",
    difficulty: "intermediate",
    points: 250,
    estimatedTime: "1.5 hours",
    category: "patterns",
    completedBy: 0,
    imageUrl: "https://source.unsplash.com/featured/?hoc",
    requirements: [
      "Create withAuth HOC",
      "Handle authentication state",
      "Implement role-based access",
      "Add loading states",
      "Support redirects",
      "Handle error cases"
    ],
    testCases: [
      {
        description: "Should protect routes",
        test: "expect(protectedRoute).toBeInTheDocument()"
      },
      {
        description: "Should handle unauthorized access",
        test: "expect(redirected).toBe(true)"
      }
    ]
  },

  // Server-Side Rendering (SSR)
  {
    title: "Next.js Blog",
    description: "Create a blog application using Next.js with SSR and ISR.",
    difficulty: "expert",
    points: 350,
    estimatedTime: "2 hours",
    category: "ssr",
    completedBy: 0,
    imageUrl: "https://source.unsplash.com/featured/?blog",
    requirements: [
      "Set up Next.js project",
      "Implement SSR for blog posts",
      "Add ISR for dynamic content",
      "Create API routes",
      "Implement image optimization",
      "Add SEO features"
    ],
    testCases: [
      {
        description: "Should render server-side",
        test: "expect(serverRendered).toBe(true)"
      },
      {
        description: "Should handle dynamic routes",
        test: "expect(dynamicContent).toBeInTheDocument()"
      }
    ]
  },
  {
    title: "SSR Authentication",
    description: "Implement authentication with SSR support using Next.js.",
    difficulty: "expert",
    points: 350,
    estimatedTime: "2 hours",
    category: "ssr",
    completedBy: 0,
    imageUrl: "https://source.unsplash.com/featured/?auth",
    requirements: [
      "Set up authentication flow",
      "Handle SSR auth state",
      "Implement protected routes",
      "Add session management",
      "Support multiple providers",
      "Handle token refresh"
    ],
    testCases: [
      {
        description: "Should handle auth state in SSR",
        test: "expect(authState).toBeDefined()"
      },
      {
        description: "Should protect routes",
        test: "expect(protectedRoute).toBeInTheDocument()"
      }
    ]
  },

  // Progressive Web Apps (PWA)
  {
    title: "PWA Weather App",
    description: "Create a weather application with PWA features.",
    difficulty: "expert",
    points: 350,
    estimatedTime: "2 hours",
    category: "pwa",
    completedBy: 0,
    imageUrl: "https://source.unsplash.com/featured/?weather",
    requirements: [
      "Implement service worker",
      "Add offline support",
      "Create manifest file",
      "Add push notifications",
      "Implement caching strategy",
      "Support install prompt"
    ],
    testCases: [
      {
        description: "Should work offline",
        test: "expect(offlineContent).toBeInTheDocument()"
      },
      {
        description: "Should handle push notifications",
        test: "expect(notificationReceived).toBe(true)"
      }
    ]
  },
  {
    title: "PWA E-commerce",
    description: "Build an e-commerce PWA with offline capabilities.",
    difficulty: "expert",
    points: 350,
    estimatedTime: "2 hours",
    category: "pwa",
    completedBy: 0,
    imageUrl: "https://source.unsplash.com/featured/?ecommerce",
    requirements: [
      "Implement offline catalog",
      "Add cart persistence",
      "Handle offline orders",
      "Sync data when online",
      "Add payment processing",
      "Implement background sync"
    ],
    testCases: [
      {
        description: "Should show offline catalog",
        test: "expect(offlineCatalog).toBeInTheDocument()"
      },
      {
        description: "Should sync offline orders",
        test: "expect(ordersSynced).toBe(true)"
      }
    ]
  },

  // Authentication & Authorization
  {
    title: "OAuth Integration",
    description: "Implement OAuth authentication with multiple providers.",
    difficulty: "expert",
    points: 350,
    estimatedTime: "2 hours",
    category: "auth",
    completedBy: 0,
    imageUrl: "https://source.unsplash.com/featured/?oauth",
    requirements: [
      "Support Google, GitHub, Facebook login",
      "Handle token management",
      "Implement refresh tokens",
      "Add session persistence",
      "Handle errors gracefully",
      "Support account linking"
    ],
    testCases: [
      {
        description: "Should handle OAuth flow",
        test: "expect(authSuccess).toBe(true)"
      },
      {
        description: "Should manage tokens",
        test: "expect(tokenValid).toBe(true)"
      }
    ]
  },
  {
    title: "Role-Based Access Control",
    description: "Implement a comprehensive RBAC system.",
    difficulty: "expert",
    points: 350,
    estimatedTime: "2 hours",
    category: "auth",
    completedBy: 0,
    imageUrl: "https://source.unsplash.com/featured/?rbac",
    requirements: [
      "Create role hierarchy",
      "Implement permission system",
      "Add role management UI",
      "Handle role inheritance",
      "Support dynamic permissions",
      "Add audit logging"
    ],
    testCases: [
      {
        description: "Should enforce permissions",
        test: "expect(accessGranted).toBe(true)"
      },
      {
        description: "Should handle role inheritance",
        test: "expect(inheritedPermissions).toBeDefined()"
      }
    ]
  },

  // Internationalization (i18n)
  {
    title: "Multi-language App",
    description: "Create a fully internationalized React application.",
    difficulty: "intermediate",
    points: 250,
    estimatedTime: "1.5 hours",
    category: "i18n",
    completedBy: 0,
    imageUrl: "https://source.unsplash.com/featured/?language",
    requirements: [
      "Implement i18n framework",
      "Add language switcher",
      "Handle RTL support",
      "Format dates and numbers",
      "Support pluralization",
      "Add language detection"
    ],
    testCases: [
      {
        description: "Should switch languages",
        test: "expect(currentLanguage).toBe('es')"
      },
      {
        description: "Should format numbers",
        test: "expect(formattedNumber).toBe('1,234.56')"
      }
    ]
  },

  // Accessibility (a11y)
  {
    title: "Accessible Form Builder",
    description: "Create an accessible form builder with ARIA support.",
    difficulty: "intermediate",
    points: 250,
    estimatedTime: "1.5 hours",
    category: "a11y",
    completedBy: 0,
    imageUrl: "https://source.unsplash.com/featured/?accessibility",
    requirements: [
      "Implement ARIA attributes",
      "Add keyboard navigation",
      "Support screen readers",
      "Handle focus management",
      "Add error announcements",
      "Support high contrast mode"
    ],
    testCases: [
      {
        description: "Should be keyboard accessible",
        test: "expect(keyboardNavigation).toBe(true)"
      },
      {
        description: "Should announce errors",
        test: "expect(errorAnnounced).toBe(true)"
      }
    ]
  },

  // Data Visualization
  {
    title: "Interactive Charts",
    description: "Create interactive data visualization components.",
    difficulty: "expert",
    points: 350,
    estimatedTime: "2 hours",
    category: "visualization",
    completedBy: 0,
    imageUrl: "https://source.unsplash.com/featured/?charts",
    requirements: [
      "Implement line charts",
      "Add bar charts",
      "Support pie charts",
      "Handle real-time updates",
      "Add tooltips and legends",
      "Support data export"
    ],
    testCases: [
      {
        description: "Should render charts",
        test: "expect(chartRendered).toBe(true)"
      },
      {
        description: "Should handle updates",
        test: "expect(dataUpdated).toBe(true)"
      }
    ]
  },

  // Mobile Development
  {
    title: "React Native App",
    description: "Create a cross-platform mobile app using React Native.",
    difficulty: "expert",
    points: 350,
    estimatedTime: "2 hours",
    category: "mobile",
    completedBy: 0,
    imageUrl: "https://source.unsplash.com/featured/?mobile",
    requirements: [
      "Set up React Native project",
      "Implement native features",
      "Handle platform differences",
      "Add offline support",
      "Implement push notifications",
      "Support deep linking"
    ],
    testCases: [
      {
        description: "Should work on both platforms",
        test: "expect(platformCompatible).toBe(true)"
      },
      {
        description: "Should handle deep links",
        test: "expect(deepLinkHandled).toBe(true)"
      }
    ]
  },

  // TypeScript Integration
  {
    title: "TypeScript Utility Types",
    description: "Create a library of TypeScript utility types for React.",
    difficulty: "expert",
    points: 350,
    estimatedTime: "2 hours",
    category: "typescript",
    completedBy: 0,
    imageUrl: "https://source.unsplash.com/featured/?typescript",
    requirements: [
      "Create utility types",
      "Implement type guards",
      "Add type inference",
      "Support generics",
      "Handle conditional types",
      "Add type documentation"
    ],
    testCases: [
      {
        description: "Should infer types correctly",
        test: "expect(typeInferred).toBe(true)"
      },
      {
        description: "Should validate types",
        test: "expect(typeValid).toBe(true)"
      }
    ]
  },

  // GraphQL Integration
  {
    title: "GraphQL Client",
    description: "Create a GraphQL client with React integration.",
    difficulty: "expert",
    points: 350,
    estimatedTime: "2 hours",
    category: "graphql",
    completedBy: 0,
    imageUrl: "https://source.unsplash.com/featured/?graphql",
    requirements: [
      "Implement GraphQL client",
      "Add query/mutation hooks",
      "Handle caching",
      "Support subscriptions",
      "Add error handling",
      "Implement optimistic updates"
    ],
    testCases: [
      {
        description: "Should execute queries",
        test: "expect(queryExecuted).toBe(true)"
      },
      {
        description: "Should handle subscriptions",
        test: "expect(subscriptionActive).toBe(true)"
      }
    ]
  }
]; 