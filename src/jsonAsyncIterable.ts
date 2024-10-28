import { JsonParserConfig } from "./JsonDecoder.js";
import { StreamToAsyncIterable } from "./StreamToAsyncIterable.js";


export function responseToJsonAsyncIterable<T>(this: Response, config?: JsonParserConfig): AsyncIterable<T> {
    // Check if the response body is readable
    if (!this.body) {
        throw new Error('Response has no body.');
    }

    return new StreamToAsyncIterable(this.body, config);
}

export function streamToJsonAsyncIterable<T>(this: ReadableStream<Uint8Array>, config?: JsonParserConfig): AsyncIterable<T> {
    return new StreamToAsyncIterable(this, config);
}