export class GoogleGenAI {
    constructor(config?: any) { }
    models = {
        generateContent: async () => ({
            text: "This is a mock response from the Google GenAI.",
        }),
    };
}
