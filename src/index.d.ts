import { JsonParserConfig } from "./JsonDecoder.js";

export { };

declare global {
    interface Response {
        jsonStream<T>(config?: JsonParserConfig): ReadableStream<T>;
    }
}