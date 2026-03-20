export function removeItem(arr: any[], value: any) {
    for (let i = arr.length - 1; i >= 0; i--) {
        if (arr[i] === value) {
            arr.splice(i, 1);
        }
    }
}
