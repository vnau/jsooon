import { JsonParserConfig } from "./JsonDecoder.js";

export { };

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