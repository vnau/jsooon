// Mock for Response body with a readable stream
export function createMockResponse(body: ReadableStream<Uint8Array>): Response {
    return new Response(body);
}

// Helper function to convert a string to a ReadableStream
export function stringToStream(str: string, chunkSize: number = 1): ReadableStream<Uint8Array> {
    const encoder = new TextEncoder();
    return new ReadableStream<Uint8Array>({
        start(controller) {
            for (var i = 0; i < str.length;) {
                const next = Math.min(str.length, i + chunkSize);
                controller.enqueue(encoder.encode(str.substring(i, next)));
                i = next;
            }
            controller.close();
        },
    });
}

