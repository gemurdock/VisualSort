export function isNumeric(str: string): boolean {
    if(typeof str !== "string") {
        return false;
    }
    return !Number.isNaN(Number(str));
}

// Durstenfeld Shuffle modified from https://stackoverflow.com/questions/2450954/how-to-randomize-shuffle-a-javascript-array
export function shuffleArray<T>(input: T[]): T[] {
    let array = [...input];
    for(let i = array.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [array[i], array[j]] = [array[j], array[i]];
    }
    return array;
}
