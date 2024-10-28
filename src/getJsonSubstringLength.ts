export function getJsonSubstringLength(input: string, startIndex: number): number {
    let bracketBalance = 0;
    let isInsideString = false;

    for (let i = startIndex; i < input.length; i++) {
        const currentChar = input[i];

        if (isInsideString) {
            if (currentChar === '\\') {
                i++; // Skip escaped character
                continue;
            }
            if (currentChar === '"') isInsideString = false;
        } else {
            if (currentChar === '"') {
                isInsideString = true;
            } else {
                if (currentChar === '{') bracketBalance++;
                else if (currentChar === '}') bracketBalance--;

                if (bracketBalance === 0) return i - startIndex + 1;
            }
        }
    }

    return 0; // No complete JSON object found
}