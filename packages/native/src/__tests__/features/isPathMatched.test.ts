import { describe, test, expect } from 'vitest';
import { isPathMatched } from '../../utils/isPathMatched';

describe('isPathMatched', () => {
    test('Empty Path and Pattern Match', () => {
        // Arrange
        const path: string[] = [];
        const pattern: string[] = [];

        // Act
        const result = isPathMatched(path, pattern);

        // Assert
        expect(result).toBe(true);
    });
    test('should match single element arrays with same value', () => {
        // Arrange
        const path = ['a'];
        const pattern = ['a'];

        // Act
        const result = isPathMatched(path, pattern);

        // Assert
        expect(result).toBe(true);
    });
    test('should match wildcards', () => {
        // Arrange
        const path = ['*'];
        const pattern = ['*'];

        // Act
        const result = isPathMatched(path, pattern);

        // Assert
        expect(result).toBe(true);
    });

    test('should match single wildcard pattern correctly', () => {
        // Arrange
        const path = ['anything'];
        const pattern = ['*'];

        // Act
        const result = isPathMatched(path, pattern);

        // Assert
        expect(result).toBe(true);
    });

    test('should match multiple elements with exact values', () => {
        // Arrange
        const path = ['a', 'b', 'c'];
        const pattern = ['a', 'b', 'c'];

        // Act
        const result = isPathMatched(path, pattern);

        // Assert
        expect(result).toBe(true);
    });

    test('should match path with multiple wildcards in pattern', () => {
        // Arrange
        const path = ['a', 'b', 'c'];
        const pattern = ['*', 'b', '*'];

        // Act
        const result = isPathMatched(path, pattern);

        // Assert
        expect(result).toBe(true);
    });

    test('should match path when pattern ends with double star', () => {
        // Arrange
        const path = ['a', 'b', 'c', 'd'];
        const pattern = ['a', 'b', '**'];

        // Act
        const result = isPathMatched(path, pattern);

        // Assert
        expect(result).toBe(true);
    });

    test('should return false when arrays have different lengths without double star pattern', () => {
        // Arrange
        const path = ['a', 'b'];
        const pattern = ['a'];

        // Act
        const result = isPathMatched(path, pattern);

        // Assert
        expect(result).toBe(false);
    });

    test('Double Star with Empty Remaining Path', () => {
        // Arrange
        const path = ['a', 'b'];
        const pattern = ['a', 'b', '**'];

        // Act
        const result = isPathMatched(path, pattern);

        // Assert
        expect(result).toBe(true);
    });

    test('should match pattern with mixed * and ** wildcards', () => {
        // Arrange
        const path = ['a', 'b', 'c', 'd'];
        const pattern = ['*', 'b', '**'];

        // Act
        const result = isPathMatched(path, pattern);

        // Assert
        expect(result).toBe(true);
    });

    test('should match path partially when pattern ends with double star', () => {
        // Arrange
        const path = ['x', 'y'];
        const pattern = ['x', '**'];

        // Act
        const result = isPathMatched(path, pattern);

        // Assert
        expect(result).toBe(true);
    });

    test('should match single element path with double star pattern', () => {
        // Arrange
        const path = ['x'];
        const pattern = ['**'];

        // Act
        const result = isPathMatched(path, pattern);

        // Assert
        expect(result).toBe(true);
    });

    test('should return false when pattern length exceeds path length', () => {
        // Arrange
        const path = ['a'];
        const pattern = ['a', 'b'];

        // Act
        const result = isPathMatched(path, pattern);

        // Assert
        expect(result).toBe(false);
    });

    test('should match path with special characters', () => {
        // Arrange
        const path = ['$', '#', '@'];
        const pattern = ['$', '*', '@'];

        // Act
        const result = isPathMatched(path, pattern);

        // Assert
        expect(result).toBe(true);
    });

    test('should return false when double star pattern is in middle of pattern array', () => {
        // Arrange
        const path = ['a', 'b', 'c'];
        const pattern = ['a', '**', 'c'];

        // Act
        const result = isPathMatched(path, pattern);

        // Assert
        expect(result).toBe(false);
    });

    test('should match path with consecutive wildcards in pattern', () => {
        // Arrange
        const path = ['a', 'b', 'c'];
        const pattern = ['*', '*', 'c'];

        // Act
        const result = isPathMatched(path, pattern);

        // Assert
        expect(result).toBe(true);
    });

    test('多路匹配路径', () => {
        expect(isPathMatched(['a', 'b', 'c', 'd', 'e'], ['**'])).toBeTruthy();
        expect(isPathMatched(['a', 'b', 'c', 'd', 'e'], ['a', '**'])).toBeTruthy();
        expect(isPathMatched(['a', 'b', 'c', 'd', 'e'], ['a', 'b', '**'])).toBeTruthy();
        expect(isPathMatched(['a', 'b', 'c', 'd', 'e'], ['a', 'b', 'c', '**'])).toBeTruthy();
        expect(isPathMatched(['a', 'b', 'c', 'd', 'e'], ['a', 'b', 'c', 'd', '**'])).toBeTruthy();
    });
});
