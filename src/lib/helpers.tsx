export function isNumeric(str: string): boolean {
    if(typeof str !== "string") {
        return false;
    }
    return !Number.isNaN(Number(str));
}
