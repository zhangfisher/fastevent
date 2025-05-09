export function isString(str: any): str is string {
    return str && typeof (str) === "string"
}