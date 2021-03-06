import { CSSProperties } from 'react';
import './ArrayVisualizer.css';

const WIDTH = 800;
const HEIGHT = 500;
const RECT_WIDTH = 5;
const RECT_PADDING = RECT_WIDTH / 2;
const MAX_HEIGHT = Math.floor(HEIGHT * 0.9);
const MAX_ITEMS = Math.floor((WIDTH / (RECT_WIDTH + RECT_PADDING)) * 0.90);
const COLUMN_WIDTH = WIDTH / (MAX_ITEMS + 1);

const defaultRectStyle: CSSProperties = {
    fill: 'rgb(66, 135, 245)',
    width: `${RECT_WIDTH}px`
};

function buildSVGRects(items: {value: number, x: number, y: number}[]): JSX.Element[] {
    const min = Math.min(...items.map(i => i.value));
    const max = Math.max(...items.map(i => i.value));
    for(let i = 0; i < items.length; i++) {
        items[i].x = (i) * (COLUMN_WIDTH) + COLUMN_WIDTH / 2;
        items[i].value = (items[i].value - min) / (max - min); // normalize
        items[i].value = items[i].value * MAX_HEIGHT + 3; // scale to view, add min height
    }
    return items.map(item => <rect key={item.value} x={item.x} y={item.y - item.value} height={`${item.value}px`} style={defaultRectStyle} />);
}

function ArrayVisualizer(props: { list: number[], handleMaxValue: (max: number) => void}) {
    props.handleMaxValue(MAX_ITEMS);
    let rects = buildSVGRects(props.list.map(v => ({ value: v, x: 0, y: Math.floor(HEIGHT * 0.98) })));
    return (
        <div className="visualizer-container">
            <svg className=".svg-view" viewBox={`0 0 ${WIDTH} ${HEIGHT}`} width={`${WIDTH}`} height={`${HEIGHT}`}>
                { rects }
                Warning: Your browser does not support SVG.
            </svg>
        </div>
    );
}

export default ArrayVisualizer;
