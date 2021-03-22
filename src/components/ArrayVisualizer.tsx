import { CSSProperties, useEffect, useState } from 'react';
import './ArrayVisualizer.css';

export interface ProcessedValues {
    original: number[],
    scaled: number[]
}

interface ViewSpecs {
    rectStartX: number;
    rectWidth: number;
    rectPad: number;
    maxRectHeight: number;
    maxItems: number; // 119 @ 1200 width
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

function buildSVGRects(items: ProcessedValues, viewSpecs: ViewSpecs): JSX.Element[] {
    let defaultRectStyle: CSSProperties = {
        fill: 'rgb(66, 135, 245)',
        width: `${viewSpecs.rectWidth}px`
    };
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
                y={VIEWBOX_HEIGHT - item} height={item} style={defaultRectStyle} />
        )
    });
}

function ArrayVisualizer(props: { width: number, height: number, list: ProcessedValues, handleMaxItems: (max: number) => void,
        handleMaxValue: (max: number) => void }) {
    const [viewSpecs, setViewSpecs] = useState<ViewSpecs>(calcView(props.list.original.length));

    useEffect(() => {
        setViewSpecs(calcView(props.list.original.length));
    }, [props]);

    useEffect(() => {
        props.handleMaxItems(viewSpecs.maxItems);
        props.handleMaxValue(viewSpecs.maxRectHeight);
    }, [viewSpecs]);

    let rects = buildSVGRects(props.list, viewSpecs);

    return (
        <div className="visualizer-container">
            <svg className=".svg-view" viewBox={`0 0 ${VIEWBOX_WIDTH} ${VIEWBOX_HEIGHT}`} width={`${props.width}`} height={`${props.height}`}>
                { rects }
                Warning: Your browser does not support SVG.
            </svg>
        </div>
    );
}

export default ArrayVisualizer;
