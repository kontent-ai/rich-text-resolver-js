export const compose = <T>(firstFunction: (argument: T) => T, ...functions: Array<(argument: T) => T>) =>
    functions.reduce((previousFunction, nextFunction) => value => previousFunction(nextFunction(value)), firstFunction);

export const findLastIndex = <T>(arr: T[], predicate: (value: T) => boolean): number => {
    for (let i = arr.length - 1; i >= 0; i--) {
        if (predicate(arr[i])) {
        return i;
        }
    }
    return -1;
}