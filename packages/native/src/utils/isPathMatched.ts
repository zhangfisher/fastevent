/**
 *
 * 判断path是否与pattern匹配
 *
 * isPathMatched("a.b.c","a.b.c")  == true
 * isPathMatched("a.b.c","a.b.*")  == true
 * isPathMatched("a.b.c","a.*.*")  == true
 * isPathMatched("a.b.c","*.*.*")  == true
 * isPathMatched("a.b.c",".b.*")  == true
 * isPathMatched("a.b.c.d","a.**")  == true
 *
 * - '**' 匹配后续的
 * - '*' 匹配任意数量的字符，包括零个字符
 *
 * @param path
 * @param pattern
 */
export function isPathMatched(path: string[], pattern: string[]): boolean {
    const pathLen = path.length;
    const patternLen = pattern.length;

    // 快速失败: 长度不匹配(除非以 ** 结尾)
    if (pathLen !== patternLen && (patternLen === 0 || pattern[patternLen - 1] !== "**")) {
        return false;
    }

    // 处理 ** 通配符: 直接检查前缀匹配
    if (patternLen > 0 && pattern[patternLen - 1] === "**") {
        // 检查前 n-1 个元素是否匹配
        for (let i = 0; i < patternLen - 1; i++) {
            if (pattern[i] !== "*" && pattern[i] !== path[i]) {
                return false;
            }
        }
        return true;
    }

    // 普通匹配: 逐元素比较
    for (let i = 0; i < pathLen; i++) {
        if (pattern[i] !== "*" && pattern[i] !== path[i]) {
            return false;
        }
    }

    return true;
}
