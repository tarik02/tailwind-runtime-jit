export const createRemoteCompiler = ({ apiUrl }: { apiUrl: string }) => {
    return async (classNames: string[]): Promise<string> => {
        const result = await fetch(apiUrl, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(classNames),
            credentials: 'omit'
        });

        return await result.text();
    };
};
