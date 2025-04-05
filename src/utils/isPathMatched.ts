
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
export function isPathMatched(path:string[],pattern:string[]):boolean{
    if(path.length !== pattern.length && (path.length>0 && pattern[pattern.length-1]!=='**') ){
        return false;
    }
    let fPattern = [...pattern]
    if(pattern.length >0 && pattern[pattern.length-1] === '**'){
        fPattern.splice(pattern.length-1,1,...Array.from<string>({
            length: path.length-pattern.length+1
        }).fill('*'))
    }

    for(let i=0;i<path.length;i++){
        if(fPattern[i]==='*'){
            continue
        }
        if(fPattern[i]!==path[i]){
            return false
        }
        
    }
    return true
}

 