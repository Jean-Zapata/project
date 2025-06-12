# Guía de Pruebas

## Configuración del Entorno de Pruebas

### Dependencias

```json
{
  "devDependencies": {
    "@testing-library/jest-dom": "^5.16.5",
    "@testing-library/react": "^13.4.0",
    "@testing-library/user-event": "^14.4.3",
    "@types/jest": "^29.5.0",
    "jest": "^29.5.0",
    "ts-jest": "^29.1.0",
    "supertest": "^6.3.3",
    "msw": "^1.2.2"
  }
}
```

### Configuración de Jest

```javascript
// jest.config.js
module.exports = {
  preset: 'ts-jest',
  testEnvironment: 'jsdom',
  setupFilesAfterEnv: ['<rootDir>/src/setupTests.ts'],
  moduleNameMapper: {
    '\\.(css|less|scss|sass)$': 'identity-obj-proxy',
    '^@/(.*)$': '<rootDir>/src/$1'
  },
  collectCoverageFrom: [
    'src/**/*.{ts,tsx}',
    '!src/**/*.d.ts',
    '!src/index.tsx',
    '!src/reportWebVitals.ts'
  ]
};
```

## Pruebas Unitarias

### Componentes React

```typescript
// Button.test.tsx
import { render, screen, fireEvent } from '@testing-library/react';
import Button from './Button';

describe('Button', () => {
  it('renders correctly', () => {
    render(<Button>Click me</Button>);
    expect(screen.getByText('Click me')).toBeInTheDocument();
  });

  it('calls onClick when clicked', () => {
    const handleClick = jest.fn();
    render(<Button onClick={handleClick}>Click me</Button>);
    fireEvent.click(screen.getByText('Click me'));
    expect(handleClick).toHaveBeenCalled();
  });

  it('applies variant class', () => {
    render(<Button variant="primary">Click me</Button>);
    expect(screen.getByText('Click me')).toHaveClass('btn-primary');
  });
});
```

### Hooks Personalizados

```typescript
// useAuth.test.ts
import { renderHook, act } from '@testing-library/react-hooks';
import useAuth from './useAuth';

describe('useAuth', () => {
  it('initializes with default values', () => {
    const { result } = renderHook(() => useAuth());
    expect(result.current.isAuthenticated).toBe(false);
    expect(result.current.user).toBeNull();
  });

  it('updates state after login', async () => {
    const { result } = renderHook(() => useAuth());
    
    await act(async () => {
      await result.current.login('user@example.com', 'password');
    });

    expect(result.current.isAuthenticated).toBe(true);
    expect(result.current.user).not.toBeNull();
  });
});
```

### Servicios

```typescript
// AuthService.test.ts
import AuthService from './AuthService';
import { mockUser, mockToken } from '../mocks/auth';

describe('AuthService', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('login returns user data and token', async () => {
    const response = await AuthService.login('user@example.com', 'password');
    expect(response).toEqual({
      user: mockUser,
      token: mockToken
    });
  });

  it('handles login errors', async () => {
    await expect(
      AuthService.login('invalid@example.com', 'wrong')
    ).rejects.toThrow('Invalid credentials');
  });
});
```

## Pruebas de Integración

### API Endpoints

```typescript
// auth.test.ts
import request from 'supertest';
import app from '../app';
import { prisma } from '../lib/prisma';

describe('Auth API', () => {
  beforeEach(async () => {
    await prisma.user.deleteMany();
  });

  it('registers new user', async () => {
    const response = await request(app)
      .post('/api/auth/register')
      .send({
        email: 'test@example.com',
        password: 'password123',
        username: 'testuser'
      });

    expect(response.status).toBe(201);
    expect(response.body).toHaveProperty('token');
  });

  it('login existing user', async () => {
    // Crear usuario primero
    await prisma.user.create({
      data: {
        email: 'test@example.com',
        password: 'hashed_password',
        username: 'testuser'
      }
    });

    const response = await request(app)
      .post('/api/auth/login')
      .send({
        email: 'test@example.com',
        password: 'password123'
      });

    expect(response.status).toBe(200);
    expect(response.body).toHaveProperty('token');
  });
});
```

### Flujos de Usuario

```typescript
// authFlow.test.tsx
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { AuthProvider } from '../contexts/AuthContext';
import Login from '../components/Login';

describe('Authentication Flow', () => {
  it('completes login process', async () => {
    render(
      <AuthProvider>
        <Login />
      </AuthProvider>
    );

    // Llenar formulario
    fireEvent.change(screen.getByLabelText(/email/i), {
      target: { value: 'test@example.com' }
    });
    fireEvent.change(screen.getByLabelText(/password/i), {
      target: { value: 'password123' }
    });

    // Enviar formulario
    fireEvent.click(screen.getByRole('button', { name: /login/i }));

    // Verificar redirección
    await waitFor(() => {
      expect(window.location.pathname).toBe('/dashboard');
    });
  });
});
```

## Pruebas E2E

### Cypress

```typescript
// cypress/integration/auth.spec.ts
describe('Authentication', () => {
  beforeEach(() => {
    cy.visit('/login');
  });

  it('logs in successfully', () => {
    cy.get('[data-testid=email-input]').type('test@example.com');
    cy.get('[data-testid=password-input]').type('password123');
    cy.get('[data-testid=login-button]').click();

    cy.url().should('include', '/dashboard');
    cy.get('[data-testid=user-menu]').should('be.visible');
  });

  it('shows error with invalid credentials', () => {
    cy.get('[data-testid=email-input]').type('invalid@example.com');
    cy.get('[data-testid=password-input]').type('wrongpassword');
    cy.get('[data-testid=login-button]').click();

    cy.get('[data-testid=error-message]')
      .should('be.visible')
      .and('contain', 'Invalid credentials');
  });
});
```

## Mocks y Stubs

### Mock de API

```typescript
// mocks/handlers.ts
import { rest } from 'msw';

export const handlers = [
  rest.post('/api/auth/login', (req, res, ctx) => {
    const { email, password } = req.body;

    if (email === 'test@example.com' && password === 'password123') {
      return res(
        ctx.status(200),
        ctx.json({
          user: mockUser,
          token: mockToken
        })
      );
    }

    return res(
      ctx.status(401),
      ctx.json({ message: 'Invalid credentials' })
    );
  })
];
```

### Mock de Servicios

```typescript
// mocks/services.ts
jest.mock('../services/AuthService', () => ({
  login: jest.fn().mockResolvedValue({
    user: mockUser,
    token: mockToken
  }),
  logout: jest.fn().mockResolvedValue(undefined)
}));
```

## Cobertura de Código

### Configuración de Cobertura

```javascript
// jest.config.js
module.exports = {
  collectCoverage: true,
  coverageThreshold: {
    global: {
      branches: 80,
      functions: 80,
      lines: 80,
      statements: 80
    }
  }
};
```

### Reportes de Cobertura

```bash
# Generar reporte
npm test -- --coverage

# Ver reporte en navegador
npm run coverage:report
```

## Pruebas de Rendimiento

### Lighthouse

```typescript
// lighthouse.config.js
module.exports = {
  ci: {
    collect: {
      startServerCommand: 'npm run start',
      url: ['http://localhost:3000']
    },
    assert: {
      assertions: {
        'categories:performance': ['error', { minScore: 0.9 }],
        'categories:accessibility': ['error', { minScore: 0.9 }],
        'categories:best-practices': ['error', { minScore: 0.9 }],
        'categories:seo': ['error', { minScore: 0.9 }]
      }
    }
  }
};
```

### Pruebas de Carga

```typescript
// load.test.ts
import http from 'k6/http';
import { check, sleep } from 'k6';

export const options = {
  vus: 10,
  duration: '30s'
};

export default function() {
  const response = http.get('http://localhost:3000/api/users');
  
  check(response, {
    'status is 200': (r) => r.status === 200,
    'response time < 500ms': (r) => r.timings.duration < 500
  });

  sleep(1);
}
```

## Pruebas de Accesibilidad

```typescript
// a11y.test.tsx
import { render } from '@testing-library/react';
import { axe, toHaveNoViolations } from 'jest-axe';
import Login from './Login';

expect.extend(toHaveNoViolations);

describe('Login', () => {
  it('should not have accessibility violations', async () => {
    const { container } = render(<Login />);
    const results = await axe(container);
    expect(results).toHaveNoViolations();
  });
});
```

## Pruebas de Snapshot

```typescript
// Button.test.tsx
import { render } from '@testing-library/react';
import Button from './Button';

describe('Button', () => {
  it('matches snapshot', () => {
    const { container } = render(
      <Button variant="primary">Click me</Button>
    );
    expect(container).toMatchSnapshot();
  });
});
```

## Pruebas de Error

```typescript
// ErrorBoundary.test.tsx
import { render, screen } from '@testing-library/react';
import ErrorBoundary from './ErrorBoundary';

const ThrowError = () => {
  throw new Error('Test error');
};

describe('ErrorBoundary', () => {
  it('renders error message when child throws', () => {
    render(
      <ErrorBoundary>
        <ThrowError />
      </ErrorBoundary>
    );

    expect(screen.getByText(/something went wrong/i)).toBeInTheDocument();
  });
});
```

## Pruebas de Redux

```typescript
// authSlice.test.ts
import authReducer, { login, logout } from './authSlice';

describe('authSlice', () => {
  it('should handle login', () => {
    const initialState = {
      user: null,
      token: null,
      isAuthenticated: false
    };

    const action = login({
      user: mockUser,
      token: mockToken
    });

    const state = authReducer(initialState, action);

    expect(state.isAuthenticated).toBe(true);
    expect(state.user).toEqual(mockUser);
    expect(state.token).toBe(mockToken);
  });
});
```

## Pruebas de Formularios

```typescript
// LoginForm.test.tsx
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import LoginForm from './LoginForm';

describe('LoginForm', () => {
  it('validates required fields', async () => {
    render(<LoginForm />);
    
    fireEvent.click(screen.getByRole('button', { name: /login/i }));

    await waitFor(() => {
      expect(screen.getByText(/email is required/i)).toBeInTheDocument();
      expect(screen.getByText(/password is required/i)).toBeInTheDocument();
    });
  });

  it('validates email format', async () => {
    render(<LoginForm />);
    
    fireEvent.change(screen.getByLabelText(/email/i), {
      target: { value: 'invalid-email' }
    });

    fireEvent.click(screen.getByRole('button', { name: /login/i }));

    await waitFor(() => {
      expect(screen.getByText(/invalid email format/i)).toBeInTheDocument();
    });
  });
});
``` 