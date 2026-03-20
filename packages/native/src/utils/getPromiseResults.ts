export function getPromiseResults(results: any[]) {
    return results.map((result) => {
        if (result.status === "fulfilled") {
            return result.value;
        } else {
            return result.reason;
        }
    });
}
