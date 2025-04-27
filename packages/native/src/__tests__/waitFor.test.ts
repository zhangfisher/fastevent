import { describe, test, expect } from "vitest"
import { FastEvent } from "../event"



describe("waitfor", () => {

    test('should resolve promise when event is emitted immediately', () => {
        return new Promise<void>((resolve) => {
            const emitter = new FastEvent();
            // Arrange
            const eventType = 'test-event';
            const expectedPayload = { data: 'test data' };

            // Act
            // Create a promise for waitFor and store it
            const waitPromise = emitter.waitFor(eventType);

            // Emit the event immediately after calling waitFor
            emitter.emit(eventType, expectedPayload);

            // Assert
            // Wait for the promise to resolve and check the result
            waitPromise.then(result => {
                expect(result).toEqual({
                    type: eventType,
                    payload: expectedPayload,
                    meta: undefined
                });
                resolve()
            })

        })
    });
    test('should handle multiple events waiting simultaneously', async () => {
        return new Promise<void>((resolve) => {
            const emitter = new FastEvent();
            // Arrange
            const event1Promise = emitter.waitFor('event1');
            const event2Promise = emitter.waitFor('event2');
            const event3Promise = emitter.waitFor('event3');

            // Act
            setTimeout(() => {
                emitter.emit('event1', 'payload1');
            }, 100);

            setTimeout(() => {
                emitter.emit('event2', 'payload2');
            }, 200);

            setTimeout(() => {
                emitter.emit('event3', 'payload3');
            }, 300);


            // Assert
            Promise.all([
                event1Promise,
                event2Promise,
                event3Promise
            ]).then(results => {
                expect(results).toEqual([
                    { type: 'event1', payload: 'payload1', meta: undefined },
                    { type: 'event2', payload: 'payload2', meta: undefined },
                    { type: 'event3', payload: 'payload3', meta: undefined }
                ]);
                resolve()
            })
        })
    });

    test('should handle multiple events with different timeouts', async () => {
        const emitter = new FastEvent();
        // Arrange
        const event1Promise = emitter.waitFor('event1', 500);
        const event2Promise = emitter.waitFor('event2', 200);
        const event3Promise = emitter.waitFor('event3', 1000);

        // Act
        setTimeout(() => {
            emitter.emit('event1', 'payload1');
        }, 100);

        setTimeout(() => {
            emitter.emit('event2', 'payload2');
        }, 300);

        // Event2 will timeout before emission
        setTimeout(() => {
            emitter.emit('event3', 'payload3');
        }, 300);

        // Assert
        const results = await Promise.allSettled([
            event1Promise,
            event2Promise,
            event3Promise
        ]);

        expect(results[0].status).toBe('fulfilled');
        expect((results[0] as any).value).toEqual({ type: 'event1', payload: 'payload1', meta: undefined });


        expect(results[1].status).toBe('rejected');
        //@ts-ignore
        expect(results[1].reason).toBeInstanceOf(Error);

        expect(results[2].status).toBe('fulfilled');
        expect((results[2] as any).value).toEqual({ type: 'event3', payload: 'payload3', meta: undefined });

    });



})