/**
 * Bubble Sort
 * 
 * Changes the state of input array to the next state of output array after a single cycle.
 */

export interface BubbleSortState {
    index: number;
    completedIndex: number;
    isDone: boolean;
    comparisons: number;
    swaps: number;
}

function BubbleSort(input: number[], state: BubbleSortState): [number[], BubbleSortState] {
    let nextInput = [...input];

    let nextState = null;
    if(state.completedIndex === -1) { // set state if state === undefined
        nextState = {
            index: 0,
            completedIndex: nextInput.length,
            isDone: false,
            comparisons: 0,
            swaps: 0
        };
    } else {
        nextState = {...state};
    }

    if(nextState.isDone) {
        return [nextInput, nextState];
    }

    if(nextInput[nextState.index] > nextInput[nextState.index + 1]) { // swap is out of order
        let tmp = nextInput[nextState.index];
        nextInput[nextState.index] = nextInput[nextState.index + 1];
        nextInput[nextState.index + 1] = tmp;
        nextState.swaps += 1;
    }

    nextState.index += 1;
    nextState.comparisons += 1;
    if(nextState.index > nextInput.length - 2 || nextState.index >= nextState.completedIndex) { // '-2' since -1 since index starts at 0 && index should not go to last element
        nextState.index = 0;
        nextState.completedIndex -= 1;
        if(nextState.completedIndex === 0) {
            nextState.isDone = true;
        }
    }

    return [nextInput, nextState];
}

export default BubbleSort;