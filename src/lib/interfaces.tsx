/*
    Interfaces that are application wide
*/

import { ArrayMetaData } from './types';

export interface ProcessedValues {
    original: number[],
    scaled: number[]
}

export interface HistoryObject {
    time: number;
    state: ProcessedValues;
    highlightMeta: ArrayMetaData<boolean>;
    comparisons: number;
    swaps: number;
    timePassed: string; // string in seconds
}
