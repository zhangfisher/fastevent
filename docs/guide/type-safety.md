# Type Safety

FastEvent provides comprehensive TypeScript support, enabling type-safe event handling throughout your application.

## Generic Parameters

FastEvent accepts two type parameters:

```typescript
class FastEvent<
    Events extends Record<string, any> = Record<string, any>,
    Meta extends Record<string, any> = Record<string, any>
>
```

-   `Events`: Maps event paths to payload types
-   `Meta`: Defines the structure of metadata

## Event Type Definitions

### Basic Event Types

```typescript
interface MyEvents {
    'user/login': { id: number; name: string };
    'user/logout': { id: number };
    'system/error': { code: string; message: string };
}

const events = new FastEvent<MyEvents>();

// Type-safe event emission
events.emit('user/login', { id: 1, name: 'Alice' }); // ✅ OK
events.emit('user/login', { id: '1' }); // ❌ Type Error
```

### Metadata Types

```typescript
interface MyMeta {
    timestamp: number;
    source?: string;
}

const events = new FastEvent<MyEvents, MyMeta>();

// Type-safe metadata
events.emit(
    'user/login',
    { id: 1, name: 'Alice' },
    false,
    { timestamp: Date.now() }, // Must match MyMeta
);
```

## Type-Safe Event Handlers

### Basic Handlers

```typescript
const events = new FastEvent<MyEvents>();

events.on('user/login', (message) => {
    const { id, name } = message.payload; // Properly typed
    console.log(`User ${name} (${id}) logged in`);
});
```

### With Metadata

```typescript
interface MyEvents {
    'user/login': { id: number; name: string };
}

interface MyMeta {
    timestamp: number;
    source?: string;
}

const events = new FastEvent<MyEvents, MyMeta>();

events.on('user/login', (message) => {
    const { id, name } = message.payload; // Typed as login payload
    const { timestamp, source } = message.meta; // Typed as MyMeta
});
```

## Scopes with Type Safety

### Basic Scope Types

```typescript
interface UserEvents {
    login: { id: number; name: string };
    logout: { id: number };
}

const events = new FastEvent<{
    'user/login': UserEvents['login'];
    'user/logout': UserEvents['logout'];
}>();

const userScope = events.scope<'user', UserEvents>('user');

// Type-safe scope usage
userScope.emit('login', { id: 1, name: 'Alice' }); // ✅ OK
userScope.emit('login', { id: '1' }); // ❌ Type Error
```

### Nested Scope Types

```typescript
interface ProfileEvents {
    update: { name: string; age: number };
    delete: { id: number };
}

const profileScope = userScope.scope<'profile', ProfileEvents>('profile');

// Type-safe nested scope usage
profileScope.emit('update', { name: 'Alice', age: 30 }); // ✅ OK
profileScope.emit('update', { name: 'Alice' }); // ❌ Type Error
```

## Advanced Type Safety

### Union Types

```typescript
interface MyEvents {
    'status/change': 'online' | 'offline' | 'away';
    'theme/change': 'light' | 'dark' | 'system';
}

const events = new FastEvent<MyEvents>();

events.emit('status/change', 'online'); // ✅ OK
events.emit('status/change', 'invalid'); // ❌ Type Error
```

### Generic Event Types

```typescript
interface MyEvents {
    'data/create': { type: 'user'; data: { name: string } } | { type: 'post'; data: { title: string } };
}

const events = new FastEvent<MyEvents>();

events.on('data/create', (message) => {
    if (message.payload.type === 'user') {
        console.log(message.payload.data.name); // ✅ OK
    } else {
        console.log(message.payload.data.title); // ✅ OK
    }
});
```

## Best Practices

1. **Define Clear Interfaces**:

```typescript
// Good
interface UserEvents {
    create: { id: number; name: string };
    update: { id: number; changes: Partial<UserData> };
    delete: { id: number };
}

// Avoid
type UserEvents = Record<string, any>;
```

2. **Use Discriminated Unions**:

```typescript
interface MyEvents {
    action: { type: 'create'; data: CreateData } | { type: 'update'; data: UpdateData } | { type: 'delete'; id: number };
}
```

3. **Leverage Type Guards**:

```typescript
interface MyEvents {
    'data/process': ProcessData;
}

function isValidProcessData(data: any): data is ProcessData {
    return 'id' in data && 'status' in data;
}

events.on('data/process', (message) => {
    if (isValidProcessData(message.payload)) {
        // Type-safe processing
    }
});
```

4. **Document Types**:

```typescript
/**
 * User-related events
 */
interface UserEvents {
    /** Emitted when a user logs in */
    login: {
        /** User's unique identifier */
        id: number;
        /** User's display name */
        name: string;
    };
}
```

5. **Avoid Type Assertions**:

```typescript
// Avoid
events.emit('user/login', payload as UserLoginData);

// Prefer
if (isUserLoginData(payload)) {
    events.emit('user/login', payload);
}
```
