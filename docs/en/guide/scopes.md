# Event Scopes

Event scopes provide a way to organize and manage events in hierarchical namespaces. They help maintain clean event structures and enable powerful event handling patterns.

## Basic Scopes

### Creating Scopes

Create a scope by calling the `scope` method:

```typescript
const events = new FastEvent();

// Create user-related scope
const userScope = events.scope('user');

// These are equivalent:
userScope.on('login', handler);
events.on('user/login', handler);

// These are also equivalent:
userScope.emit('login', data);
events.emit('user/login', data);
```

### Nested Scopes

Scopes can be nested to create deeper hierarchies:

```typescript
const userScope = events.scope('user');
const profileScope = userScope.scope('profile');

// These are equivalent:
profileScope.on('update', handler);
userScope.on('profile/update', handler);
events.on('user/profile/update', handler);

// Event path is automatically prefixed
profileScope.emit('update', { name: 'Alice' });
// Emits: 'user/profile/update'
```

## Scope Context

### Setting Context

Scopes can have their own execution context:

```typescript
const adminScope = events.scope('admin', {
    context: {
        role: 'admin',
        permissions: ['read', 'write'],
    },
});

adminScope.on('action', function () {
    console.log('Role:', this.role);
    console.log('Permissions:', this.permissions);
});
```

### Context Inheritance

Nested scopes inherit and can extend parent context:

```typescript
const userScope = events.scope('user', {
    context: { type: 'user' },
});

const adminScope = userScope.scope('admin', {
    context: { role: 'admin' },
    // Inherits { type: 'user' }
});
```

## Scope Metadata

### Adding Metadata

Scopes can have their own metadata that merges with event metadata:

```typescript
const userScope = events.scope('user', {
    meta: {
        domain: 'user',
        access: 'public',
    },
});

userScope.on('login', (message) => {
    console.log(message.meta);
    // Contains: domain, access, plus any event-specific metadata
});
```

### Metadata Inheritance

Nested scopes inherit and merge metadata:

```typescript
const apiScope = events.scope('api', {
    meta: { version: 'v1' },
});

const userApiScope = apiScope.scope('users', {
    meta: { resource: 'users' },
});

userApiScope.on('list', (message) => {
    console.log(message.meta);
    // {
    //   type: 'api/users/list',
    //   version: 'v1',
    //   resource: 'users'
    // }
});
```

## Scope Management

### Clearing Scopes

Remove all listeners in a scope:

```typescript
// Clear specific scope
userScope.clear();

// Clear root scope
events.clear();
```

### Scope Isolation

Scopes share the same listener table with the parent emitter but provide logical isolation:

```typescript
const userScope = events.scope('user');
const adminScope = events.scope('admin');

userScope.on('action', () => console.log('User action'));
adminScope.on('action', () => console.log('Admin action'));

userScope.emit('action'); // Logs: "User action"
adminScope.emit('action'); // Logs: "Admin action"
```

## Best Practices

1. **Organize by Domain**:

    - Group related events under common scopes
    - Use meaningful scope names
    - Keep scope hierarchy shallow

2. **Use Context Wisely**:

    - Add relevant execution context
    - Avoid large context objects
    - Consider performance impact

3. **Manage Metadata**:

    - Use scope metadata for common properties
    - Don't duplicate metadata across scopes
    - Keep metadata focused and relevant

4. **Clean Up**:

    - Clear scopes when no longer needed
    - Remove individual listeners when appropriate
    - Avoid memory leaks

5. **Type Safety**:
    - Define types for scope events
    - Use TypeScript interfaces
    - Maintain consistent event structures
