import { languages } from "./languages";

let language: string = "cn";

export function setLanguage(lang: string = language) {
    if (lang in languages) language = lang;
}

/**
 *  翻译内容
 *
 * @param key
 */
export function t(key: string, ...args: any[]) {
    const words = (languages as any)[language] || languages.cn;
    const word = key in words ? words[key] : key;
    // 定义正则匹配 {任意内容} 格式的占位符（非贪婪匹配）
    const placeholderRegex = /\{[^}]*\}/g;
    let argIndex = 0;

    return word.replace(placeholderRegex, () => {
        // 如果有剩余参数，使用参数替换；否则保留原占位符
        if (argIndex < args.length) {
            return String(args[argIndex++]);
        }
        // 无参数时返回原占位符（保持 {xxx} 格式）
        return placeholderRegex.exec(word)?.[0] || "";
    });
}
