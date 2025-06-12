# Guía de Contribución

## Proceso de Contribución

### 1. Configuración del Entorno

```bash
# Clonar repositorio
git clone https://github.com/Jean-Zapata/project
cd proyecto

# Instalar dependencias
npm install

```

### 2. Flujo de Trabajo

1. **Crear Rama**
   ```bash
   git checkout -b feature/nombre-feature
   ```

2. **Desarrollo**
   - Seguir las convenciones de código
   - Escribir pruebas
   - Documentar cambios

3. **Commits**
   ```bash
   git add .
   git commit -m "feat: añadir nueva característica"
   ```

4. **Push**
   ```bash
   git push origin feature/nombre-feature
   ```

5. **Pull Request**
   - Crear PR en GitHub
   - Obtener aprobación
   - Resolver conflictos

## Convenciones de Código

### TypeScript

```typescript
// Interfaces
interface User {
  id: number;
  username: string;
  email: string;
}

// Tipos
type UserRole = 'ADMIN' | 'USER' | 'GUEST';

// Enums
enum Status {
  ACTIVE = 'ACTIVE',
  INACTIVE = 'INACTIVE'
}
```

### React

```typescript
// Componentes funcionales
const Button: React.FC<ButtonProps> = ({ onClick, children }) => {
  return (
    <button onClick={onClick}>
      {children}
    </button>
  );
};

// Hooks personalizados
const useAuth = () => {
  const [user, setUser] = useState<User | null>(null);
  // ...
  return { user, login, logout };
};
```

### Estilos

```css
/* BEM naming */
.button { }
.button--primary { }
.button--secondary { }
.button__icon { }

/* Variables CSS */
:root {
  --primary-color: #007bff;
  --secondary-color: #6c757d;
}
```

## Documentación

### Comentarios

```typescript
/**
 * Autentica un usuario
 * @param email - Email del usuario
 * @param password - Contraseña del usuario
 * @returns Promise con los datos del usuario y token
 * @throws {AuthError} Si las credenciales son inválidas
 */
async function login(email: string, password: string): Promise<AuthResponse> {
  // ...
}
```

### README

```markdown
# Nombre del Proyecto

## Descripción
Breve descripción del proyecto.

## Instalación
```bash
npm install
```

## Uso
```typescript
import { Component } from './Component';
```

## API
Documentación de la API.

## Contribución
Instrucciones para contribuir.
```

## Pruebas

### Unitarias

```typescript
describe('Component', () => {
  it('renders correctly', () => {
    const { container } = render(<Component />);
    expect(container).toMatchSnapshot();
  });
});
```

### Integración

```typescript
describe('Feature', () => {
  it('completes workflow', async () => {
    // Arrange
    // Act
    // Assert
  });
});
```

## Git

### Commits

```
feat: añadir nueva característica
fix: corregir bug
docs: actualizar documentación
style: formatear código
refactor: refactorizar código
test: añadir pruebas
chore: actualizar dependencias
```

### Branches

- `main` - Producción
- `develop` - Desarrollo
- `feature/*` - Nuevas características
- `bugfix/*` - Correcciones
- `hotfix/*` - Urgentes

## Code Review

### Checklist

- [ ] Código sigue convenciones
- [ ] Pruebas pasan
- [ ] Documentación actualizada
- [ ] No hay conflictos
- [ ] Build exitoso

### Proceso

1. Revisar cambios
2. Probar funcionalidad
3. Verificar pruebas
4. Aprobar o solicitar cambios

## CI/CD

### GitHub Actions

```yaml
name: CI

on:
  push:
    branches: [ main, develop ]
  pull_request:
    branches: [ main, develop ]

jobs:
  test:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v2
      - name: Install dependencies
        run: npm install
      - name: Run tests
        run: npm test
      - name: Build
        run: npm run build
```

## Manejo de Issues

### Plantillas

```markdown
## Descripción
[Descripción del problema o característica]

## Comportamiento Esperado
[Lo que debería suceder]

## Comportamiento Actual
[Lo que sucede actualmente]

## Pasos para Reproducir
1. [Primer paso]
2. [Segundo paso]
3. [Y así sucesivamente...]

## Contexto Adicional
[Cualquier información adicional]
```

### Etiquetas

- `bug` - Error
- `enhancement` - Mejora
- `documentation` - Documentación
- `good first issue` - Para principiantes
- `help wanted` - Necesita ayuda

## Comunicación

### Canales

- GitHub Issues
- Pull Requests
- Discord
- Email

### Código de Conducta

1. Ser respetuoso
2. Ser inclusivo
3. Ser colaborativo
4. Ser constructivo

## Licencia

### MIT License

```markdown
MIT License

Copyright (c) [año] [nombre]

Permission is hereby granted, free of charge, to any person obtaining a copy
of this software and associated documentation files (the "Software"), to deal
in the Software without restriction, including without limitation the rights
to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
copies of the Software, and to permit persons to whom the Software is
furnished to do so, subject to the following conditions:

The above copyright notice and this permission notice shall be included in all
copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE
SOFTWARE.
```

## Recursos

### Documentación

- [TypeScript](https://www.typescriptlang.org/docs/)
- [React](https://reactjs.org/docs)
- [Node.js](https://nodejs.org/docs)

### Herramientas

- VS Code
- Git
- npm
- Jest

### Comunidad

- Stack Overflow
- GitHub Discussions
- Discord
- Foros 