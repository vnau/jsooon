import { describe, it, expect } from 'vitest';
import { toJsonStream } from '../src';
import { createMockResponse, stringToStream } from './utils';

describe('toJsonStream', () => {
  it('should handle ReadableStream<Uint8Array> input and parse JSON objects', async () => {
    const jsonString = '{"key": "value"}';
    const stream = stringToStream(jsonString);

    // Call toJsonStream with the stream
    const parsedStream = toJsonStream<{ key: string }>(stream);

    const reader = parsedStream.getReader();
    const result: Array<{ key: string }> = [];

    // Read and parse the stream
    const { value, done } = await reader.read();
    if (!done) result.push(value);

    expect(result).toEqual([{ key: 'value' }]);
  });

  it('should handle Response input and parse JSON objects', async () => {
    const jsonString = '{"key": "value"}';
    const stream = stringToStream(jsonString);
    const response = createMockResponse(stream);

    // Call toJsonStream with the response
    const parsedStream = toJsonStream<{ key: string }>(response);

    const reader = parsedStream.getReader();
    const result: Array<{ key: string }> = [];

    // Read and parse the stream
    const { value, done } = await reader.read();
    if (!done) result.push(value);

    expect(result).toEqual([{ key: 'value' }]);
  });

  it('should throw an error if no readable stream is found', async () => {
    // Call toJsonStream with invalid input
    await expect(() => toJsonStream(null as unknown as Response)).toThrowError('No readable stream found.');
  });

  it('should parse multiple JSON objects from the stream', async () => {
    const jsonString = '[{"key1": "value1"},{"key2": "value2"}] ';
    const stream = stringToStream(jsonString);

    // Call toJsonStream with the stream
    const parsedStream = toJsonStream<{ key1?: string; key2?: string }>(stream);

    const reader = parsedStream.getReader();
    const result: any[] = [];

    // Read and parse the stream
    let { value, done } = await reader.read();
    while (!done) {
      result.push(value);
      ({ value, done } = await reader.read());
    }

    expect(result).toEqual([{ key1: 'value1' }, { key2: 'value2' }]);
  });

  it('non-completed JSON objects should not be returned', async () => {
    const jsonString = '{"key1": "value1"}{"key2": "value2"';
    const stream = stringToStream(jsonString, 1);

    // Call toJsonStream with the stream
    const parsedStream = toJsonStream<any>(stream);
    const reader = parsedStream.getReader();
    const result: any[] = [];

    // Read and parse the stream
    let { value, done } = await reader.read();
    while (!done) {
      result.push(value);
      ({ value, done } = await reader.read());
    }

    expect(result).toEqual([{ key1: 'value1' }]);
  });

});
