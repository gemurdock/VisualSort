/*
    Interfaces that are application wide
*/

import { ArrayMetaData } from './types';

export interface ProcessedValues {
    original: number[],
    scaled: number[]
}

export interface HistoryObject {
    time: number; // in ms, starts at 0
    state: ProcessedValues;
    highlightMeta: ArrayMetaData<boolean>;
    comparisons: number;
    swaps: number;
}
