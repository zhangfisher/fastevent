# Getting Started

## Introduction

FastEvent is a powerful TypeScript event management library that provides flexible event subscription and publishing mechanisms, supporting features such as event wildcards, scoping, and asynchronous events.

Compared to `EventEmitter2`, `FastEvent` has the following advantages:

-   `FastEvent` performs about `1+` times better than `EventEmitter2` when publishing and subscribing with wildcards
-   `FastEvent` has a package size of `6.3kb`, while `EventEmitter2` is `43.4kb`
-   `FastEvent` offers more comprehensive features

## Installation

Install using npm:

```bash
npm install fastevent
```

Or using yarn:

```bash
yarn add fastevent
```

## Basic Usage

```typescript
import { FastEvent } from 'fastevent';

// Create event instance
const events = new FastEvent();

// Subscribe to event
events.on('user/login', (message) => {
    console.log('User login:', message.payload);
    console.log('Event type:', message.type);
    console.log('Metadata:', message.meta);
});

// Publish event - Method 1: Parameters
events.emit('user/login', { id: 1, name: 'Alice' });

// Publish event - Method 2: Message object
events.emit({
    type: 'user/login',
    payload: { id: 1, name: 'Alice' },
    meta: { timestamp: Date.now() },
});
```

## Type Safety

FastEvent provides full TypeScript support for type-safe events:

```typescript
interface MyEvents {
    'user/login': { id: number; name: string };
    'user/logout': { id: number };
}

const events = new FastEvent<MyEvents>();

// TypeScript will enforce correct event types and payloads
events.on('user/login', (message) => {
    const { id, name } = message.payload; // Properly typed
});
```

## Next Steps

-   Learn about [Event Message Format](/guide/event-message)
-   Explore [Event Scopes](/guide/scopes)
-   Understand the [Metadata System](/guide/metadata)
-   Master [Wildcards](/guide/wildcards)
