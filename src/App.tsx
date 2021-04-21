import React from 'react';
import { Container, Row, Col, Button } from 'react-bootstrap';
import ArrayVisualizer from './components/ArrayVisualizer';
import { ProcessedValues, HistoryObject } from './lib/interfaces';
import { ArrayMetaData } from './lib/types';
import './App.css';
import BubbleSort, { BubbleSortState } from './sorters/BubbleSort';
import { isNumeric, shuffleArray } from './lib/helpers';

enum AlgorithmState {
    PAUSED,
    RUNNING,
    RESET
}

enum RandomArrayType {
    RANDOM,
    NEARLY_SORTED,
    FEW_UNIQUE,
    REVERSED
}

enum FrameControl {
    BEGINING,
    BACK,
    FORWARD,
    END
}

interface AppProps {

}

interface AppState {
    history: HistoryObject[];
    historyIndex: number;
    maxItems: number;
    itemCount: number;
    speed: number;
    arrayType: RandomArrayType;
    maxHeight: number;
    intervalCall: NodeJS.Timeout | null;
    lastSortPass: number;
    internalSortState: BubbleSortState;
    applicationState: AlgorithmState
};

class App extends React.Component<AppProps, AppState> {
    constructor(props: AppProps) {
        super(props);
        this.state = {
            history: [],
            historyIndex: -1,
            maxItems: 0,
            itemCount: 0,
            speed: 50,
            arrayType: RandomArrayType.RANDOM,
            maxHeight: 0,
            intervalCall: null,
            lastSortPass: new Date().getTime(),
            applicationState: AlgorithmState.PAUSED,
            internalSortState: {index: 0, completedIndex: -1, isDone: false, comparisons: 0, swaps: 0}
        };
    }

    componentDidMount() {
        let interval = setInterval(() => {
            const ms = 1000 / ((this.state.speed / 100) * 50); // how many ms before next sort state; defined elsewhere
            if(new Date().getTime() - this.state.lastSortPass >= ms) {
                this.nextSortState();
                this.setState({
                    ...this.state,
                    lastSortPass: new Date().getTime()
                });
            }
        }, 3);
        this.setState({
            ...this.state,
            intervalCall: interval
        });
    }

    componentWillUnmount() {
        if(this.state.intervalCall) {
            clearInterval(this.state.intervalCall);
        }
    }

    getTotalTime(): string {
        if(this.state.history.length === 0) {
            return '0s';
        }
        const period = this.state.history[this.state.historyIndex].time;
        const seconds = Math.floor(period / 1000);
        return `${seconds}s`;
    }

    nextSortState() {
        if(this.state.applicationState === AlgorithmState.RUNNING && this.state.historyIndex < this.state.history.length - 1) {
            this.setState({
                ...this.state,
                historyIndex: this.state.historyIndex + 1
            });
        } else if(this.state.applicationState === AlgorithmState.RUNNING) {
            let result = BubbleSort(this.getHistoryState().original, this.state.internalSortState);
            if(result[1].isDone === true) {
                this.setState({...this.state, applicationState: AlgorithmState.PAUSED});
            }
            let highlightMeta: ArrayMetaData<boolean> = {};
            highlightMeta[`${result[1].index}`] = true;
            highlightMeta[`${result[1].index + 1}`] = true;
            this.setHistoryState({original: [...result[0]], scaled: []}, highlightMeta, result[1].comparisons, result[1].swaps);
            this.setState({
                ...this.state,
                internalSortState: result[1]
            });
        } else if(this.state.applicationState === AlgorithmState.RESET) {
            this.setState({
                ...this.state,
                history: [],
                historyIndex: -1,
                internalSortState: {index: 0, completedIndex: 0, isDone: false, comparisons: 0, swaps: 0},
                applicationState: AlgorithmState.PAUSED
            }, () => {
                this.setHistoryState({original: this.getRandArray(), scaled: []}, {}, 0, 0);
            });
        }
    }

    getHistoryState(): ProcessedValues {
        let state: ProcessedValues  = { original: [], scaled: [] };
        if(this.state.history.length > 0) {
            state.original = [...this.state.history[this.state.historyIndex].state.original];
        }
        return state;
    }

    setHistoryState(state: ProcessedValues, highlightMeta: ArrayMetaData<boolean>, comparisons: number, swaps: number): void {
        let time = 0;
        if(this.state.history.length > 0) {
            const ms = 1000 / ((this.state.speed / 100) * 50); // defined elsewhere
            time = this.state.history[this.state.history.length - 1].time + ms;
        }
        let obj = {
            time,
            state,
            highlightMeta,
            comparisons,
            swaps
        };
        this.setState({
            ...this.state,
            history: [
                ...this.state.history,
                obj
            ],
            historyIndex: this.state.historyIndex + 1
        });
    }

    getRandArray(): number[] {
        if(this.state.arrayType === RandomArrayType.NEARLY_SORTED) {
            let array = Array.from(Array(this.state.itemCount).keys()).map(v => v + 1);
            let openIndices = Array.from(Array(this.state.itemCount).keys()); // indexes not choosen to be randomized yet
            for(let i = 0; i < Math.ceil(array.length * 0.15); i++) {
                let rand = Math.floor(Math.random() * openIndices.length);
                let index = openIndices.splice(rand, 1)[0];
                let index2 = openIndices[Math.floor(Math.random() * openIndices.length)];
                let tmp = array[index];
                array[index] = array[index2];
                array[index2] = tmp;
            }
            return array;
        } else if(this.state.arrayType === RandomArrayType.FEW_UNIQUE) {
            let array = [];
            let maxRepeat = Math.floor(this.state.itemCount / 5);
            if(maxRepeat === 1) maxRepeat = 2;
            let repeatValue = 1;
            for(let i = 0; i < this.state.itemCount; i++) {
                if((i + 1) / maxRepeat > repeatValue) {
                    repeatValue += 1;
                }
                array.push(repeatValue);
            }
            return shuffleArray<number>(array);
        } else if(this.state.arrayType === RandomArrayType.REVERSED) {
            let array = [];
            for(let i = this.state.itemCount; i > 0; i--) {
                array.push(i);
            }
            return array;
        } else { // RandomArrayType.RANDOM
            return [...Array(this.state.itemCount)].map(() => Math.floor(Math.random() * 100 + 1));
        }
    }

    setAppState(state: AlgorithmState) {
        this.setState({...this.state, applicationState: state});
    }

    handleMaxItems = (max: number): void => {
        if(max > 100) { // TODO: move this to array visualizer
            max = 100;
        }
        if(max !== this.state.maxItems) {
            this.setState({
                ...this.state,
                maxItems: max,
                itemCount: max
            }, () => {
                this.setHistoryState({original: this.getRandArray(), scaled: []}, {}, 0, 0);
            });
        }
    }

    handleMaxValue = (max: number): void => {
        if(max !== this.state.maxHeight) {
            this.setState({
                ...this.state,
                maxHeight: max
            })
        }
    }

    handleItemChange = (event: React.ChangeEvent<HTMLInputElement>): void => {
        if(isNumeric(event.target.value)) {
            let n = parseInt(event.target.value);
            if(n >= 5 && n <= this.state.maxItems) {
                this.setState({
                    ...this.state,
                    itemCount: n,
                    applicationState: AlgorithmState.RESET
                });
            } else {
                event.preventDefault();
            }
        } else {
            event.preventDefault();
        }
    }

    handleSlider = (event: React.ChangeEvent<HTMLInputElement>): void => {
        if(isNumeric(event.target.value)) {
            this.setState({
                ...this.state,
                speed: parseInt(event.target.value)
            });
        } else {
            event.preventDefault();
        }
    }

    handleDropDown = (event: React.ChangeEvent<HTMLSelectElement>): void => {
        let parsedValue = parseInt(event.target.value);
        if(parsedValue in RandomArrayType) {
            this.setState({
                ...this.state,
                arrayType: parsedValue,
                applicationState: AlgorithmState.RESET
            });
        } else {
            event.preventDefault();
        }
    }

    handleHistoryIndexChange = (control: FrameControl) => {
        let nextValue = this.state.historyIndex;
        if(control === FrameControl.BEGINING) {
            nextValue = 0;
        } else if(control === FrameControl.BACK) {
            nextValue -= 1;
            if(nextValue < 0) {
                nextValue = 0;
            }
        } else if(control === FrameControl.FORWARD) {
            nextValue += 1;
            if(nextValue > this.state.history.length - 1) {
                nextValue = this.state.history.length - 1;
            }
        } else if(control === FrameControl.END) {
            nextValue = this.state.history.length - 1;
        }
        this.setState({
            ...this.state,
            historyIndex: nextValue
        });
    }

    render() {
        let highlightMeta: ArrayMetaData<Boolean> = {};
        if(this.state.history.length > 0 && this.state.historyIndex >= 0) {
            highlightMeta = {
                ...this.state.history[this.state.historyIndex].highlightMeta
            };
        }

        return (
            <div className="App">
                <Container>
                    <Row className="text-center m-3">
                        <Col>
                            <span className="app-text">Comparisons: {this.state.history.length > 0 ? this.state.history[this.state.historyIndex].comparisons : 0}</span>
                        </Col>
                        <Col>
                            <span className="app-text">Swaps: {this.state.history.length > 0 ? this.state.history[this.state.historyIndex].swaps : 0}</span>
                        </Col>
                        <Col>
                            <span className="app-text">Time: {this.getTotalTime()}</span>
                        </Col>
                    </Row>
                    <Row className="text-center m-3">
                        <Col>
                            <ArrayVisualizer list={this.getHistoryState()}
                                width={1000} height={600} highlightMeta={highlightMeta} focusMeta={{}}
                                handleMaxItems={this.handleMaxItems} handleMaxValue={this.handleMaxValue} />
                        </Col>
                    </Row>
                    <Row className="text-center m-3">
                        <Col>
                            <Row>
                                <Col>
                                    <Button variant="primary" onClick={() => this.setAppState(AlgorithmState.RUNNING)}>Start</Button>
                                </Col>
                                <Col>
                                    <Button variant="secondary" onClick={() => this.setAppState(AlgorithmState.PAUSED)}>Stop</Button>
                                </Col>
                                <Col>
                                    <Button variant="secondary" onClick={() => this.setAppState(AlgorithmState.RESET)}>Reset</Button>
                                </Col>
                                <Col>
                                    <input type="number" className="elements-counter" name="elements" step="5" value={this.state.itemCount} onChange={this.handleItemChange} />
                                </Col>
                                <Col>
                                    <input type="range" min="1" max="100" value={this.state.speed} onChange={this.handleSlider} />
                                </Col>
                                <Col>
                                    <select onChange={this.handleDropDown} value={this.state.arrayType}>
                                        <option value={RandomArrayType.RANDOM}>Random</option>
                                        <option value={RandomArrayType.NEARLY_SORTED}>Nearly Sorted</option>
                                        <option value={RandomArrayType.FEW_UNIQUE}>Few Unique</option>
                                        <option value={RandomArrayType.REVERSED}>Reversed</option>
                                    </select>
                                </Col>
                            </Row>
                            <Row className="mt-4">
                                <Col>
                                    <Row>
                                        <Col>
                                            <Button variant="secondary" onClick={() => this.handleHistoryIndexChange(FrameControl.BEGINING)}>&#60;&#60;</Button>
                                        </Col>
                                        <Col>
                                            <Button variant="secondary" onClick={() => this.handleHistoryIndexChange(FrameControl.BACK)}>&#60;</Button>
                                        </Col>
                                        <Col>
                                            <Button variant="secondary" onClick={() => this.handleHistoryIndexChange(FrameControl.FORWARD)}>&#62;</Button>
                                        </Col>
                                        <Col>
                                            <Button variant="secondary" onClick={() => this.handleHistoryIndexChange(FrameControl.END)}>&#62;&#62;</Button>
                                        </Col>
                                    </Row>
                                </Col>
                                <Col>
                                </Col>
                            </Row>
                        </Col>
                    </Row>
                </Container>
            </div>
        )
    };
}

export default App;
