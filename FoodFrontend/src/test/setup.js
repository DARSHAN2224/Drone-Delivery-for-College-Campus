import { vi } from 'vitest';
import '@testing-library/jest-dom';

// Mock environment variables
vi.mock('vite', () => ({
  env: {
    VITE_API_BASE_URL: 'http://localhost:8000',
    VITE_SOCKET_URL: 'http://localhost:8000'
  }
}));

// Mock localStorage
const localStorageMock = {
  getItem: vi.fn(),
  setItem: vi.fn(),
  removeItem: vi.fn(),
  clear: vi.fn(),
  length: 0,
  key: vi.fn()
};
global.localStorage = localStorageMock;

// Mock sessionStorage
const sessionStorageMock = {
  getItem: vi.fn(),
  setItem: vi.fn(),
  removeItem: vi.fn(),
  clear: vi.fn(),
  length: 0,
  key: vi.fn()
};
global.sessionStorage = sessionStorageMock;

// Mock window.matchMedia
Object.defineProperty(window, 'matchMedia', {
  writable: true,
  value: vi.fn().mockImplementation(query => ({
    matches: false,
    media: query,
    onchange: null,
    addListener: vi.fn(), // deprecated
    removeListener: vi.fn(), // deprecated
    addEventListener: vi.fn(),
    removeEventListener: vi.fn(),
    dispatchEvent: vi.fn(),
  })),
});

// Mock IntersectionObserver
global.IntersectionObserver = vi.fn().mockImplementation(() => ({
  observe: vi.fn(),
  unobserve: vi.fn(),
  disconnect: vi.fn(),
}));

// Mock ResizeObserver
global.ResizeObserver = vi.fn().mockImplementation(() => ({
  observe: vi.fn(),
  unobserve: vi.fn(),
  disconnect: vi.fn(),
}));

// Mock fetch
global.fetch = vi.fn();

// Mock WebSocket
global.WebSocket = vi.fn().mockImplementation(() => ({
  addEventListener: vi.fn(),
  removeEventListener: vi.fn(),
  send: vi.fn(),
  close: vi.fn(),
  readyState: 1, // OPEN
  CONNECTING: 0,
  OPEN: 1,
  CLOSING: 2,
  CLOSED: 3
}));

// Mock Socket.IO
global.io = vi.fn().mockImplementation(() => ({
  on: vi.fn(),
  emit: vi.fn(),
  connect: vi.fn(),
  disconnect: vi.fn(),
  connected: true
}));

// Mock Leaflet (for maps)
global.L = {
  map: vi.fn().mockReturnValue({
    setView: vi.fn().mockReturnThis(),
    addLayer: vi.fn().mockReturnThis(),
    removeLayer: vi.fn().mockReturnThis(),
    on: vi.fn().mockReturnThis(),
    off: vi.fn().mockReturnThis(),
    getContainer: vi.fn().mockReturnValue({
      getBoundingClientRect: vi.fn().mockReturnValue({ width: 100, height: 100 })
    })
  }),
  tileLayer: vi.fn().mockReturnValue({
    addTo: vi.fn().mockReturnThis()
  }),
  marker: vi.fn().mockReturnValue({
    addTo: vi.fn().mockReturnThis(),
    bindPopup: vi.fn().mockReturnThis(),
    setLatLng: vi.fn().mockReturnThis()
  }),
  icon: vi.fn().mockReturnValue({}),
  divIcon: vi.fn().mockReturnValue({}),
  popup: vi.fn().mockReturnValue({
    setLatLng: vi.fn().mockReturnThis(),
    setContent: vi.fn().mockReturnThis(),
    openOn: vi.fn().mockReturnThis()
  }),
  latLng: vi.fn().mockReturnValue({ lat: 0, lng: 0 }),
  latLngBounds: vi.fn().mockReturnValue({
    extend: vi.fn().mockReturnThis(),
    getCenter: vi.fn().mockReturnValue({ lat: 0, lng: 0 })
  })
};

// Mock QR Scanner
global.navigator.mediaDevices = {
  getUserMedia: vi.fn().mockResolvedValue({
    getTracks: () => [{ stop: vi.fn() }]
  }),
  enumerateDevices: vi.fn().mockResolvedValue([])
};

// Mock File API
global.File = vi.fn().mockImplementation((content, filename, options) => ({
  name: filename,
  size: content.length,
  type: options?.type || 'text/plain',
  lastModified: Date.now(),
  slice: vi.fn(),
  stream: vi.fn(),
  text: vi.fn().mockResolvedValue(content),
  arrayBuffer: vi.fn().mockResolvedValue(new ArrayBuffer(content.length))
}));

global.FileReader = vi.fn().mockImplementation(() => ({
  readAsDataURL: vi.fn(),
  readAsText: vi.fn(),
  readAsArrayBuffer: vi.fn(),
  addEventListener: vi.fn(),
  removeEventListener: vi.fn(),
  result: null,
  readyState: 0,
  error: null
}));

// Mock FormData
global.FormData = vi.fn().mockImplementation(() => ({
  append: vi.fn(),
  delete: vi.fn(),
  get: vi.fn(),
  getAll: vi.fn(),
  has: vi.fn(),
  set: vi.fn(),
  entries: vi.fn(),
  keys: vi.fn(),
  values: vi.fn(),
  forEach: vi.fn()
}));

// Mock URLSearchParams
global.URLSearchParams = vi.fn().mockImplementation(() => ({
  append: vi.fn(),
  delete: vi.fn(),
  get: vi.fn(),
  getAll: vi.fn(),
  has: vi.fn(),
  set: vi.fn(),
  toString: vi.fn().mockReturnValue(''),
  entries: vi.fn(),
  keys: vi.fn(),
  values: vi.fn(),
  forEach: vi.fn()
}));

// Mock console methods to reduce noise in tests
const originalConsoleError = console.error;
const originalConsoleWarn = console.warn;
const originalConsoleLog = console.log;

beforeEach(() => {
  // Suppress console errors/warnings during tests unless explicitly needed
  console.error = vi.fn();
  console.warn = vi.fn();
  console.log = vi.fn();
  
  // Clear all mocks
  vi.clearAllMocks();
  
  // Reset localStorage and sessionStorage
  localStorageMock.getItem.mockClear();
  localStorageMock.setItem.mockClear();
  localStorageMock.removeItem.mockClear();
  localStorageMock.clear.mockClear();
  
  sessionStorageMock.getItem.mockClear();
  sessionStorageMock.setItem.mockClear();
  sessionStorageMock.removeItem.mockClear();
  sessionStorageMock.clear.mockClear();
  
  // Reset fetch mock
  fetch.mockClear();
  
  // Reset WebSocket mock
  global.WebSocket.mockClear();
  
  // Reset Socket.IO mock
  global.io.mockClear();
});

afterEach(() => {
  // Restore console methods
  console.error = originalConsoleError;
  console.warn = originalConsoleWarn;
  console.log = originalConsoleLog;
});

// Global test utilities
global.testUtils = {
  // Mock API responses
  mockApiResponse: (url, response, status = 200) => {
    fetch.mockImplementation((requestUrl) => {
      if (requestUrl.includes(url)) {
        return Promise.resolve({
          ok: status >= 200 && status < 300,
          status,
          json: () => Promise.resolve(response),
          text: () => Promise.resolve(JSON.stringify(response)),
          headers: new Map([['content-type', 'application/json']])
        });
      }
      return Promise.resolve({
        ok: false,
        status: 404,
        json: () => Promise.resolve({ error: 'Not found' })
      });
    });
  },
  
  // Mock API error
  mockApiError: (url, error = 'Internal Server Error', status = 500) => {
    fetch.mockImplementation((requestUrl) => {
      if (requestUrl.includes(url)) {
        return Promise.resolve({
          ok: false,
          status,
          json: () => Promise.resolve({ error }),
          text: () => Promise.resolve(JSON.stringify({ error }))
        });
      }
      return Promise.resolve({
        ok: false,
        status: 404,
        json: () => Promise.resolve({ error: 'Not found' })
      });
    });
  },
  
  // Mock localStorage
  mockLocalStorage: (data = {}) => {
    Object.keys(data).forEach(key => {
      localStorageMock.getItem.mockImplementation((k) => {
        if (k === key) return JSON.stringify(data[key]);
        return null;
      });
    });
  },
  
  // Mock sessionStorage
  mockSessionStorage: (data = {}) => {
    Object.keys(data).forEach(key => {
      sessionStorageMock.getItem.mockImplementation((k) => {
        if (k === key) return JSON.stringify(data[key]);
        return null;
      });
    });
  },
  
  // Mock WebSocket events
  mockWebSocketEvent: (event, data) => {
    const mockSocket = global.io();
    const eventHandler = mockSocket.on.mock.calls.find(call => call[0] === event);
    if (eventHandler && eventHandler[1]) {
      eventHandler[1](data);
    }
  },
  
  // Mock router navigation
  mockRouter: {
    push: vi.fn(),
    replace: vi.fn(),
    goBack: vi.fn(),
    goForward: vi.fn(),
    go: vi.fn(),
    canGo: vi.fn().mockReturnValue(true),
    canGoBack: vi.fn().mockReturnValue(true),
    canGoForward: vi.fn().mockReturnValue(true)
  },
  
  // Mock router location
  mockLocation: {
    pathname: '/',
    search: '',
    hash: '',
    state: null,
    key: 'default'
  },
  
  // Mock router params
  mockParams: {},
  
  // Mock router query
  mockQuery: {},
  
  // Create test user data
  createTestUser: () => ({
    _id: 'test-user-id',
    username: 'testuser',
    email: 'test@example.com',
    fullName: 'Test User',
    phone: '+1234567890',
    isEmailVerified: true,
    isActive: true
  }),
  
  // Create test seller data
  createTestSeller: () => ({
    _id: 'test-seller-id',
    username: 'testseller',
    email: 'seller@example.com',
    fullName: 'Test Seller',
    phone: '+1234567890',
    businessName: 'Test Business',
    businessType: 'restaurant',
    isEmailVerified: true,
    isActive: true,
    isApproved: true
  }),
  
  // Create test admin data
  createTestAdmin: () => ({
    _id: 'test-admin-id',
    username: 'testadmin',
    email: 'admin@example.com',
    fullName: 'Test Admin',
    phone: '+1234567890',
    role: 'admin',
    isEmailVerified: true,
    isActive: true
  }),
  
  // Create test shop data
  createTestShop: () => ({
    _id: 'test-shop-id',
    name: 'Test Shop',
    description: 'A test shop for testing purposes',
    address: '123 Test Street',
    city: 'Test City',
    state: 'Test State',
    zipCode: '12345',
    phone: '+1234567890',
    category: 'restaurant',
    rating: 4.5,
    reviewCount: 10,
    isApproved: true
  }),
  
  // Create test product data
  createTestProduct: () => ({
    _id: 'test-product-id',
    name: 'Test Product',
    description: 'A test product for testing purposes',
    price: 9.99,
    category: 'food',
    available: true,
    image: 'https://test-image-url.com/test.jpg',
    stock: 100,
    rating: 4.0,
    reviewCount: 5,
    isApproved: true
  }),
  
  // Create test order data
  createTestOrder: () => ({
    _id: 'test-order-id',
    user: 'test-user-id',
    shop: 'test-shop-id',
    items: [
      {
        product: 'test-product-id',
        quantity: 2,
        price: 9.99
      }
    ],
    totalAmount: 19.98,
    deliveryAddress: '123 Test Street, Test City, TS 12345',
    deliveryType: 'regular',
    status: 'pending',
    paymentStatus: 'paid',
    createdAt: new Date().toISOString()
  }),
  
  // Wait for async operations
  wait: (ms) => new Promise(resolve => setTimeout(resolve, ms)),
  
  // Wait for element to appear
  waitForElement: async (callback, timeout = 5000) => {
    const startTime = Date.now();
    while (Date.now() - startTime < timeout) {
      try {
        const result = callback();
        if (result) return result;
      } catch (error) {
        // Element not found yet, continue waiting
      }
      await new Promise(resolve => setTimeout(resolve, 100));
    }
    throw new Error('Element not found within timeout');
  }
};

// Mock React Router
vi.mock('react-router-dom', () => ({
  BrowserRouter: ({ children }) => children,
  Routes: ({ children }) => children,
  Route: ({ children }) => children,
  useNavigate: () => global.testUtils.mockRouter.push,
  useLocation: () => global.testUtils.mockLocation,
  useParams: () => global.testUtils.mockParams,
  useSearchParams: () => [new URLSearchParams(global.testUtils.mockQuery), vi.fn()],
  Link: ({ children, to, ...props }) => <a href={to} {...props}>{children}</a>,
  NavLink: ({ children, to, ...props }) => <a href={to} {...props}>{children}</a>,
  Outlet: () => <div data-testid="outlet" />,
  Navigate: ({ to }) => <div data-testid={`navigate-to-${to}`} />
}));

// Mock Socket.IO client
vi.mock('socket.io-client', () => ({
  io: () => global.io()
}));

// Mock Leaflet React components
vi.mock('react-leaflet', () => ({
  MapContainer: ({ children, ...props }) => <div data-testid="map-container" {...props}>{children}</div>,
  TileLayer: (props) => <div data-testid="tile-layer" {...props} />,
  Marker: ({ children, ...props }) => <div data-testid="marker" {...props}>{children}</div>,
  Popup: ({ children, ...props }) => <div data-testid="popup" {...props}>{children}</div>,
  useMap: () => ({
    setView: vi.fn(),
    getCenter: vi.fn().mockReturnValue({ lat: 0, lng: 0 }),
    getZoom: vi.fn().mockReturnValue(10),
    flyTo: vi.fn(),
    on: vi.fn(),
    off: vi.fn()
  }),
  useMapEvents: () => ({
    onClick: vi.fn(),
    onMouseMove: vi.fn(),
    onZoom: vi.fn()
  })
}));

// Mock QR Scanner
vi.mock('jsqr', () => ({
  default: vi.fn().mockReturnValue({
    data: 'test-qr-data',
    location: { topLeftCorner: { x: 0, y: 0 } }
  })
}));

// Mock Formik
vi.mock('formik', () => ({
  Formik: ({ children, initialValues, onSubmit, validationSchema }) => {
    const formikProps = {
      values: initialValues,
      errors: {},
      touched: {},
      isSubmitting: false,
      isValid: true,
      dirty: false,
      handleChange: vi.fn(),
      handleBlur: vi.fn(),
      handleSubmit: vi.fn((e) => {
        e.preventDefault();
        onSubmit(initialValues, { setSubmitting: vi.fn() });
      }),
      setFieldValue: vi.fn(),
      setFieldTouched: vi.fn(),
      setValues: vi.fn(),
      setTouched: vi.fn(),
      setErrors: vi.fn(),
      setSubmitting: vi.fn(),
      resetForm: vi.fn(),
      validateForm: vi.fn().mockResolvedValue({}),
      submitForm: vi.fn(),
      setStatus: vi.fn(),
      getFieldProps: vi.fn((name) => ({
        name,
        value: initialValues[name] || '',
        onChange: vi.fn(),
        onBlur: vi.fn()
      }))
    };
    
    return children(formikProps);
  },
  useFormik: vi.fn().mockReturnValue({
    values: {},
    errors: {},
    touched: {},
    isSubmitting: false,
    isValid: true,
    dirty: false,
    handleChange: vi.fn(),
    handleBlur: vi.fn(),
    handleSubmit: vi.fn(),
    setFieldValue: vi.fn(),
    setFieldTouched: vi.fn(),
    setValues: vi.fn(),
    setTouched: vi.fn(),
    setErrors: vi.fn(),
    setSubmitting: vi.fn(),
    resetForm: vi.fn(),
    validateForm: vi.fn().mockResolvedValue({}),
    submitForm: vi.fn(),
    setStatus: vi.fn()
  })
}));

// Mock Yup
vi.mock('yup', () => ({
  object: vi.fn().mockReturnValue({
    shape: vi.fn().mockReturnValue({
      validate: vi.fn().mockResolvedValue({}),
      validateSync: vi.fn().mockReturnValue({}),
      validateAt: vi.fn().mockResolvedValue({}),
      validateSyncAt: vi.fn().mockReturnValue({})
    })
  }),
  string: vi.fn().mockReturnValue({
    required: vi.fn().mockReturnThis(),
    email: vi.fn().mockReturnThis(),
    min: vi.fn().mockReturnThis(),
    max: vi.fn().mockReturnThis(),
    matches: vi.fn().mockReturnThis(),
    test: vi.fn().mockReturnThis()
  }),
  number: vi.fn().mockReturnValue({
    required: vi.fn().mockReturnThis(),
    positive: vi.fn().mockReturnThis(),
    min: vi.fn().mockReturnThis(),
    max: vi.fn().mockReturnThis(),
    integer: vi.fn().mockReturnThis()
  }),
  boolean: vi.fn().mockReturnValue({
    required: vi.fn().mockReturnThis(),
    oneOf: vi.fn().mockReturnThis()
  }),
  array: vi.fn().mockReturnValue({
    of: vi.fn().mockReturnThis(),
    min: vi.fn().mockReturnThis(),
    max: vi.fn().mockReturnThis()
  })
}));

// Mock Zustand stores
vi.mock('../../stores/authStore', () => ({
  useAuthStore: vi.fn().mockReturnValue({
    user: null,
    isAuthenticated: false,
    isLoading: false,
    login: vi.fn(),
    logout: vi.fn(),
    register: vi.fn(),
    updateProfile: vi.fn(),
    clearError: vi.fn()
  })
}));

vi.mock('../../stores/appStore', () => ({
  useAppStore: vi.fn().mockReturnValue({
    theme: 'light',
    language: 'en',
    sidebarOpen: false,
    setTheme: vi.fn(),
    setLanguage: vi.fn(),
    toggleSidebar: vi.fn(),
    setSidebarOpen: vi.fn()
  })
}));

vi.mock('../../stores/notificationStore', () => ({
  useNotificationStore: vi.fn().mockReturnValue({
    notifications: [],
    addNotification: vi.fn(),
    removeNotification: vi.fn(),
    clearNotifications: vi.fn(),
    markAsRead: vi.fn()
  })
}));

// Mock Axios
vi.mock('axios', () => ({
  default: {
    create: vi.fn(() => ({
      get: vi.fn(),
      post: vi.fn(),
      put: vi.fn(),
      patch: vi.fn(),
      delete: vi.fn(),
      interceptors: {
        request: { use: vi.fn() },
        response: { use: vi.fn() }
      }
    })),
    get: vi.fn(),
    post: vi.fn(),
    put: vi.fn(),
    patch: vi.fn(),
    delete: vi.fn(),
    interceptors: {
      request: { use: vi.fn() },
      response: { use: vi.fn() }
    }
  }
}));

// Mock Lucide React icons
vi.mock('lucide-react', () => ({
  User: vi.fn(() => <div data-testid="user-icon" />),
  ShoppingCart: vi.fn(() => <div data-testid="cart-icon" />),
  Home: vi.fn(() => <div data-testid="home-icon" />),
  Settings: vi.fn(() => <div data-testid="settings-icon" />),
  LogOut: vi.fn(() => <div data-testid="logout-icon" />),
  Plus: vi.fn(() => <div data-testid="plus-icon" />),
  Edit: vi.fn(() => <div data-testid="edit-icon" />),
  Trash: vi.fn(() => <div data-testid="trash-icon" />),
  Search: vi.fn(() => <div data-testid="search-icon" />),
  Filter: vi.fn(() => <div data-testid="filter-icon" />),
  Star: vi.fn(() => <div data-testid="star-icon" />),
  Heart: vi.fn(() => <div data-testid="heart-icon" />),
  MapPin: vi.fn(() => <div data-testid="map-pin-icon" />),
  Clock: vi.fn(() => <div data-testid="clock-icon" />),
  Phone: vi.fn(() => <div data-testid="phone-icon" />),
  Mail: vi.fn(() => <div data-testid="mail-icon" />),
  Eye: vi.fn(() => <div data-testid="eye-icon" />),
  EyeOff: vi.fn(() => <div data-testid="eye-off-icon" />),
  Check: vi.fn(() => <div data-testid="check-icon" />),
  X: vi.fn(() => <div data-testid="x-icon" />),
  AlertCircle: vi.fn(() => <div data-testid="alert-circle-icon" />),
  Info: vi.fn(() => <div data-testid="info-icon" />),
  ChevronDown: vi.fn(() => <div data-testid="chevron-down-icon" />),
  ChevronUp: vi.fn(() => <div data-testid="chevron-up-icon" />),
  ChevronLeft: vi.fn(() => <div data-testid="chevron-left-icon" />),
  ChevronRight: vi.fn(() => <div data-testid="chevron-right-icon" />)
}));

export default global.testUtils;
