import { JsonParserConfig, JsonDecoder, JsonParserStream } from "./JsonDecoder.js"
import { jsonStream } from "./ResponseJsonStream.js";

declare global {
    interface Response {
        jsonStream<T>(config?: JsonParserConfig): ReadableStream<T>;
    }
}

if (typeof Response.prototype.jsonStream !== "function") {
    Response.prototype.jsonStream = jsonStream;
}

export { JsonDecoder, JsonParserConfig, JsonParserStream, jsonStream };
