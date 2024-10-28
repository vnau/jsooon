import { JsonParserConfig, JsonDecoder, JsonParserStream } from "./JsonDecoder.js"
import { streamToJsonStream, responseToJsonStream } from "./jsonStream.js";
import { streamToJsonAsyncIterable, responseToJsonAsyncIterable } from "./jsonAsyncIterable.js";

declare global {
    interface Response {
        jsonStream<T>(config?: JsonParserConfig): ReadableStream<T>;
        jsonAsyncIterable<T>(config?: JsonParserConfig): AsyncIterable<T>;
    }

    interface ReadableStream {
        jsonStream<T>(config?: JsonParserConfig): ReadableStream<T>;
        jsonAsyncIterable<T>(config?: JsonParserConfig): AsyncIterable<T>;
    }
}

if (typeof Response.prototype.jsonStream !== "function") {
    Response.prototype.jsonStream = responseToJsonStream;
}

if (typeof Response.prototype.jsonAsyncIterable !== "function") {
    Response.prototype.jsonAsyncIterable = responseToJsonAsyncIterable;
}

if (typeof (ReadableStream<Uint8Array>).prototype.jsonStream !== "function") {
    (ReadableStream<Uint8Array>).prototype.jsonStream = streamToJsonStream;
}

if (typeof (ReadableStream<Uint8Array>).prototype.jsonAsyncIterable !== "function") {
    (ReadableStream<Uint8Array>).prototype.jsonAsyncIterable = streamToJsonAsyncIterable;
}

export {
    JsonDecoder,
    JsonParserConfig,
    JsonParserStream,
    streamToJsonStream,
    responseToJsonStream,
    streamToJsonAsyncIterable,
    responseToJsonAsyncIterable
};