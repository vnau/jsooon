import { JsonParserConfig, JsonParserStream } from "./JsonDecoder.js";

export class StreamToAsyncIterable<T> {
    private stream: ReadableStream<T>;

    constructor(readableStream: ReadableStream<Uint8Array>, config?: JsonParserConfig) {
        // Create a transform stream using CombinedTextToJsonTransformStream
        // Pipe the response body through the transform stream
        this.stream = readableStream.pipeThrough(new TextDecoderStream())
            .pipeThrough(new JsonParserStream<T>(config));
    }

    /**
     * Returns an async iterator that yields parsed JSON objects from the stream.
     */
    async *[Symbol.asyncIterator](): AsyncIterator<T> {
        const reader = this.stream.getReader();

        try {
            let result: ReadableStreamReadResult<T>;
            while (!(result = await reader.read()).done) {
                yield result.value;
            }
        } finally {
            reader.releaseLock();
        }
    }
}