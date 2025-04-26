# Installation

FastEvent can be installed using various package managers and integrated into different project types.

## Package Managers

### npm

```bash
npm install fastevent
```

### yarn

```bash
yarn add fastevent
```

### pnpm

```bash
pnpm add fastevent
```

## Module Formats

FastEvent supports multiple module formats:

### ESM (ECMAScript Modules)

```typescript
import { FastEvent } from 'fastevent';
```

### CommonJS

```javascript
const { FastEvent } = require('fastevent');
```

## Development Tools

### Debug Mode

To enable debug mode and use Redux DevTools:

```typescript
import 'fastevent/devtools';

const events = new FastEvent({
    debug: true,
});
```

Make sure you have the [Redux DevTools Extension](https://chromewebstore.google.com/detail/redux-devtools/lmhkpmbekcpmknklioeibfkpmmfibljd) installed in your browser.

## TypeScript Configuration

FastEvent is written in TypeScript and includes type definitions. No additional setup is required.

```json
{
    "compilerOptions": {
        "target": "ES2015",
        "module": "ESNext"
        // ... other options
    }
}
```

## Basic Setup

### Creating an Instance

```typescript
import { FastEvent } from 'fastevent';

// Basic instance
const events = new FastEvent();

// With configuration
const configuredEvents = new FastEvent({
    delimiter: '/',
    debug: process.env.NODE_ENV !== 'production',
    meta: {
        version: '1.0',
        environment: process.env.NODE_ENV,
    },
});
```

### With Type Safety

```typescript
interface MyEvents {
    'user/login': { id: number; name: string };
    'user/logout': { id: number };
}

interface MyMeta {
    timestamp: number;
    source?: string;
}

const events = new FastEvent<MyEvents, MyMeta>();
```

## Framework Integration

### React

```typescript
// events.ts
import { FastEvent } from 'fastevent';

export const events = new FastEvent();

// App.tsx
import { events } from './events';
import { useEffect } from 'react';

function App() {
    useEffect(() => {
        const handler = (message) => {
            console.log('Event received:', message);
        };

        events.on('user/login', handler);
        return () => events.off('user/login', handler);
    }, []);
}
```

### Vue

```typescript
// events.ts
import { FastEvent } from 'fastevent';

export const events = new FastEvent();

// Component.vue
import { events } from './events';
import { onMounted, onUnmounted } from 'vue';

export default {
    setup() {
        const handler = (message) => {
            console.log('Event received:', message);
        };

        onMounted(() => {
            events.on('user/login', handler);
        });

        onUnmounted(() => {
            events.off('user/login', handler);
        });
    },
};
```

## Environment Considerations

### Production

For production environments:

```typescript
const events = new FastEvent({
    debug: false,
    ignoreErrors: true,
    onListenerError: (type, error) => {
        // Log to your error tracking service
        errorTracker.log(error);
    },
});
```

### Development

For development environments:

```typescript
const events = new FastEvent({
    debug: true,
    ignoreErrors: false,
    onListenerError: (type, error) => {
        console.error(`Error in ${type}:`, error);
    },
    onExecuteListener: (message, returns, listeners) => {
        console.log(`Event executed:`, {
            type: message.type,
            listeners: listeners.length,
            returns,
        });
    },
});
```

## Best Practices

1. **Instance Management**:

    - Create a single instance for your application
    - Export the instance from a central location
    - Consider using dependency injection

2. **Type Safety**:

    - Define event interfaces early
    - Use TypeScript for better development experience
    - Document event types

3. **Debug Mode**:

    - Enable in development
    - Disable in production
    - Use DevTools for debugging

4. **Error Handling**:
    - Configure error handlers
    - Log errors appropriately
    - Consider environment differences
