import { CSSProperties, useEffect, useState } from 'react';
import './ArrayVisualizer.css';
import { ProcessedValues } from '../lib/interfaces';
import { ArrayMetaData } from '../lib/types';

interface ViewSpecs {
    rectStartX: number;
    rectWidth: number;
    rectPad: number;
    maxRectHeight: number;
    maxItems: number; // 119 @ 1200 width
}

interface ArrayVisualizerProps {
    width: number,
    height: number,
    list: ProcessedValues,
    highlightMeta: ArrayMetaData<Boolean>,
    focusMeta: ArrayMetaData<Boolean>,
    handleMaxItems: (max: number) => void,
    handleMaxValue: (max: number) => void
}

const VIEWBOX_WIDTH = 1200;
const VIEWBOX_HEIGHT = 675;
const MIN_RECT_WIDTH = 5;
const MIN_RECT_HEIGHT = 3;
const MIN_RECT_PAD = 2.5;
const MIN_PAD = 1; // min for each side
const PAD_PERCENT = 0.1;

function calcView(length: number): ViewSpecs {
    let useableWidth = VIEWBOX_WIDTH - (MIN_PAD * 2);
    let useableHeight = VIEWBOX_HEIGHT - (MIN_PAD * 2);
    let maxItems = Math.floor(useableWidth / (MIN_RECT_PAD * 2 + MIN_RECT_WIDTH));
    let rectPad = Math.max(MIN_PAD * 2, (useableWidth / length) * PAD_PERCENT);
    let rectWidth = (useableWidth - (rectPad * length)) / length;
    let rectStartX = (rectPad / 2) + (rectWidth / 2);
    return {
        rectStartX,
        rectWidth,
        rectPad,
        maxRectHeight: useableHeight,
        maxItems
    }
}

function getIndexStyle(index: number, highlightMeta: ArrayMetaData<Boolean>, focusMeta: ArrayMetaData<Boolean>, rectWidth: number): CSSProperties {
    let defaultRectStyle: CSSProperties = {
        fill: 'rgb(66, 135, 245)',
        width: `${rectWidth}px`
    };
    let highlightedRectStyle: CSSProperties = {
        fill: 'rgb(219, 132, 39)',
        width: `${rectWidth}`
    }
    return Object.keys(highlightMeta).includes(`${index}`) ? highlightedRectStyle : defaultRectStyle;
}

function buildSVGRects(items: ProcessedValues, viewSpecs: ViewSpecs, highlightMeta: ArrayMetaData<Boolean>, focusMeta: ArrayMetaData<Boolean>): JSX.Element[] {
    if(items.scaled.length !== items.original.length) {
        const min = Math.min(...items.original);
        const max = Math.max(...items.original);
        let normalized = [...items.original];
        for(let i = 0; i < normalized.length; i++) {
            normalized[i] = (normalized[i] - min) / (max - min); // normalize
            normalized[i] = normalized[i] * viewSpecs.maxRectHeight; // scale
            if(normalized[i] < MIN_RECT_HEIGHT) { // ensure each item is visible
                normalized[i] = MIN_RECT_HEIGHT; // TODO: fix min scale issue, 0 !== 1 !== 2, !== 3... ect
            }
        }
        items.scaled = normalized;
    }
    return items.scaled.map((item, index) => {
        return (
            <rect key={`${index}`}
                x={viewSpecs.rectPad / 2 + (viewSpecs.rectPad + viewSpecs.rectWidth) * index}
                y={VIEWBOX_HEIGHT - item} height={item} style={getIndexStyle(index, highlightMeta, focusMeta, viewSpecs.rectWidth)} />
        )
    });
}

function ArrayVisualizer(props: ArrayVisualizerProps) {
    const [viewSpecs, setViewSpecs] = useState<ViewSpecs>(calcView(props.list.original.length));

    useEffect(() => {
        setViewSpecs(calcView(props.list.original.length));
    }, [props]);

    useEffect(() => {
        props.handleMaxItems(viewSpecs.maxItems);
        props.handleMaxValue(viewSpecs.maxRectHeight);
    }, [viewSpecs]);

    let rects = buildSVGRects(props.list, viewSpecs, props.highlightMeta, props.focusMeta);

    return (
        <div>
            <svg className=".svg-view" viewBox={`0 0 ${VIEWBOX_WIDTH} ${VIEWBOX_HEIGHT}`} width={`${props.width}`} height={`${props.height}`}>
                { rects }
                Warning: Your browser does not support SVG.
            </svg>
        </div>
    );
}

export default ArrayVisualizer;
