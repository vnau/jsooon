import { toJsonAsyncIterable } from '../src';
import { describe, expect, it } from 'vitest';
import { Readable } from 'stream';
import { stringToStream } from './utils';
import * as fs from 'fs';

describe('toJsonAsyncIterable', () => {

    it('should parse JSON objects from a ReadableStream', async () => {
        const expectedData = [
            { key1: 'value1' },
            { key2: 'value2' },
        ];

        const nodeStream = new Readable();
        nodeStream.push(JSON.stringify(expectedData[0]));
        nodeStream.push(',');
        nodeStream.push(JSON.stringify(expectedData[1]));
        nodeStream.push(null);

        const stream = Readable.toWeb(nodeStream) as any; // Convert Node.js stream to Web Stream

        const iterable = toJsonAsyncIterable<any>(stream);
        const results: any[] = [];

        // Iterate through the async iterable and collect results
        for await (const item of iterable) {
            results.push(item);
        }

        expect(results).toEqual(expectedData);
    });

    it('should handle a Response object with a body stream', async () => {
        const expectedData = [
            { key1: 'value1' },
            { key2: 'value2' },
        ];

        const stream = stringToStream(JSON.stringify(expectedData[0]) + JSON.stringify(expectedData[1]));
        const response = new Response(stream as any);

        const iterable = toJsonAsyncIterable<any>(response);
        const results: any[] = [];

        // Consume the async iterable and store results
        for await (const item of iterable) {
            results.push(item);
        }

        expect(results).toEqual(expectedData);
    });

    it('should throw an error if no readable stream is found', async () => {
        // Testing invalid input (null)
        await expect(() => toJsonAsyncIterable(null as any)).toThrowError('No readable stream found.');
    });

    it('should handle JSON strings with escape characters', async () => {
        interface TestData {
            message: string;
        }

        const expectedData: TestData[] = [
            { message: 'first"line' },
            { message: 'another\\example' },
            { message: 'newline\nexample' },
        ];

        const nodeStream = new Readable();
        for (const item of expectedData) {
            nodeStream.push(JSON.stringify(item)); // Add each item as JSON
        }
        nodeStream.push(null); // End the stream

        const stream = Readable.toWeb(nodeStream) as any;

        const iterable = toJsonAsyncIterable<TestData>(stream);
        const results: TestData[] = [];

        // Consume the async iterable and store results
        for await (const item of iterable) {
            results.push(item);
        }

        expect(results).toEqual(expectedData);
    });

    it('should handle lookup string in config and skip prefix with big chunks', async () => {
        // JSON string with a prefix to be skipped
        const jsonString = '{ "PREFIX": [{"key1": "value1"},{"key2": "value2"}]}';

        const stream = stringToStream(jsonString, 100);

        // Create a config with the lookup string "PREFIX" to be skipped
        const config = { lookup: 'PREFIX' };

        const iterable = toJsonAsyncIterable<any>(stream, config);
        const results: any[] = [];

        // Iterate over the async iterable and collect results
        for await (const value of iterable) {
            results.push(value);
        }

        // Ensure the prefix is properly skipped and the parsed objects are correct
        expect(JSON.stringify(results)).toEqual(JSON.stringify([{ key1: 'value1' }, { key2: 'value2' }]));
    });

    it('should handle lookup string in config and skip prefix with small chunks', async () => {
        // JSON string with a prefix to be skipped
        const jsonString = '{ "PREFIX": [{"key1": "value1"},{"key2": "value2"}]}';

        const stream = stringToStream(jsonString, 1);

        // Create a config with the lookup string "PREFIX" to be skipped
        const config = { lookup: 'PREFIX' };

        const iterable = toJsonAsyncIterable<any>(stream, config);
        const results: any[] = [];

        // Iterate over the async iterable and collect results
        for await (const value of iterable) {
            results.push(value);
        }

        // Ensure the prefix is properly skipped and the parsed objects are correct
        expect(JSON.stringify(results)).toEqual(JSON.stringify([{ key1: 'value1' }, { key2: 'value2' }]));
    });

    it('should handle empty stream gracefully', async () => {
        const emptyStream = stringToStream('');

        const iterable = toJsonAsyncIterable<any>(emptyStream);
        const results: any[] = [];

        // Expect no items to be parsed
        for await (const item of iterable) {
            results.push(item);
        }

        expect(results).toEqual([]);
    });

    it('should throw error on invalid JSON format', async () => {
        const invalidJsonString = '{"key1": "value1",}'; // Invalid JSON (extra comma)
        const stream = stringToStream(invalidJsonString);

        const iterable = toJsonAsyncIterable<any>(stream);

        // We expect the stream to throw an error during parsing
        await expect(async () => {
            for await (const item of iterable) {
                // Just loop to trigger any possible parsing errors
            }
        }).rejects.toThrow('JSON parse error');
    });

    it('should handle large streams and parse JSON incrementally', async () => {
        const largeData = Array(1000).fill({ key: 'value' }).map((item, index) => ({ [`key${index}`]: `value${index}` }));
        const jsonString = largeData.map(item => JSON.stringify(item)).join('');
        const stream = stringToStream(jsonString);

        const iterable = toJsonAsyncIterable<any>(stream);
        const results: any[] = [];

        // Iterate through and collect all items
        for await (const item of iterable) {
            results.push(item);
        }

        // Ensure the parsed items match the expected large dataset
        expect(results).toEqual(largeData);
    });


    it('buffer should not raise when there are many objects in JSON', async () => {
        const largeData = Array(1000).fill({ key: 'value' }).map((item, index) => ({ [`key${index}`]: `value${index}` }));
        const jsonString = largeData.map(item => JSON.stringify(item)).join('');
        const stream = stringToStream(jsonString);

        const iterable = toJsonAsyncIterable<any>(stream);

        // Iterate through and collect all items
        for await (const item of iterable) { }

        const stat = (iterable as any).parserStream.getStat();

        // Ensure the buffer is small
        expect(stat.maxBufferLength).toBeLessThan(25);
    });

    it('buffer should not raise when there is a long string before prefix', async () => {

        const jsonString = Array(1000).join("{") + 'PREFIX{"key1": "value1"}';
        const stream = stringToStream(jsonString);
        const config = { lookup: 'PREFIX' };

        const iterable = toJsonAsyncIterable<any>(stream, config);

        // Iterate through and collect all items
        var count = 0;
        for await (const item of iterable) { count++; }

        const stat = (iterable as any).parserStream.getStat();

        expect(count).toEqual(1);

        // Ensure the buffer is small
        expect(stat.maxBufferLength).toBeLessThan(25);
    });

});
