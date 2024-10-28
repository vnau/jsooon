import { JsonParserConfig, JsonParserStream } from "./JsonDecoder.js";

export function streamToJsonStream<T>(this: ReadableStream<Uint8Array>, config?: JsonParserConfig): ReadableStream<T> {
    // Create a transform stream using CombinedTextToJsonTransformStream
    // Pipe the response body through the transform stream
    return this.pipeThrough(new TextDecoderStream())
        .pipeThrough(new JsonParserStream<T>(config));
};

export function responseToJsonStream<T>(this: Response, config?: JsonParserConfig): ReadableStream<T> {
    // Check if the response body is readable
    if (!this.body) {
        throw new Error('Response has no body.');
    }
    return this.body.pipeThrough(new TextDecoderStream())
        .pipeThrough(new JsonParserStream<T>(config));
};