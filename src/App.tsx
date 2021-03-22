import React from 'react';
import { Container, Row, Col, Button } from 'react-bootstrap';
import ArrayVisualizer, { ProcessedValues } from './components/ArrayVisualizer';
import './App.css';
import BubbleSort, { BubbleSortState } from './sorters/BubbleSort';

enum AlgorithmState {
    PAUSED,
    RUNNING,
    RESET
}

interface AppProps {

}

interface AppState {
    maxItems: number;
    maxHeight: number;
    intervalCall: NodeJS.Timeout | null;
    values: number[];
    swapCount: number;
    internalSortState: BubbleSortState;
    applicationState: AlgorithmState
};

class App extends React.Component<AppProps, AppState> {
    constructor(props: AppProps) {
        super(props);
        this.state = {
            maxItems: 0,
            maxHeight: 0,
            intervalCall: null,
            values: [],
            swapCount: 0,
            applicationState: AlgorithmState.PAUSED,
            internalSortState: {index: 0, completedIndex: -1, isDone: false}
        };
    }

    componentDidMount() {
        let interval = setInterval(() => {
            this.nextSortState();
        }, 10);
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

    nextSortState() {
        if(this.state.applicationState === AlgorithmState.RUNNING) {
            let result = BubbleSort(this.state.values, this.state.internalSortState);
            if(result[1].isDone === true) {
                this.setState({...this.state, applicationState: AlgorithmState.PAUSED});
            }
            this.setState({...this.state, values: result[0], internalSortState: result[1], swapCount: this.state.swapCount + 1});
        } else if(this.state.applicationState === AlgorithmState.RESET) {
            this.setState({
                ...this.state,
                values: [...Array(this.state.maxItems)].map(() => Math.floor(Math.random() * 100 + 1)),
                swapCount: 0,
                internalSortState: {index: 0, completedIndex: -1, isDone: false},
                applicationState: AlgorithmState.PAUSED
            });
        }
    }

    setAppState(state: AlgorithmState) {
        this.setState({...this.state, applicationState: state});
    }

    handleMaxItems = (max: number): void => {
        if(max !== this.state.maxItems) {
            this.setState({
                ...this.state,
                maxItems: max,
                values: [...Array(max)].map(() => Math.floor(Math.random() * 100 + 1))
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

    render() {
        return (
            <div className="App">
                <Container>
                    <Row>
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
                            </Row>
                        </Col>
                        <Col>
                            <p>Comparisons: {this.state.swapCount}</p>
                        </Col>
                    </Row>
                    <Row>
                        <Col>
                            <ArrayVisualizer list={ { original: this.state.values, scaled: [] } }
                                width={1000} height={600}
                                handleMaxItems={this.handleMaxItems} handleMaxValue={this.handleMaxValue} />
                        </Col>
                    </Row>
                </Container>
            </div>
        )
    };
}

export default App;
