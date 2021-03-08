import React from 'react';
import ArrayVisualizer from './components/ArrayVisualizer';
import './App.css';
import BubbleSort, { BubbleSortState } from './sorters/BubbleSort';

interface AppProps {

}

interface AppState {
    maxItems: number;
    intervalCall: NodeJS.Timeout | null;
    values: number[];
    state: BubbleSortState
};

class App extends React.Component<AppProps, AppState> {
    constructor(props: AppProps) {
        super(props);
        this.state = {
            maxItems: 0,
            intervalCall: null,
            values: [],
            state: {index: 0, completedIndex: -1, isDone: false}
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
        let result = BubbleSort(this.state.values, this.state.state);
        this.setState({...this.state, values: result[0], state: result[1]});
    }

    handleMaxValue = (max: number): void => {
        if(max !== this.state.maxItems) {
            this.setState({
                ...this.state,
                maxItems: max,
                values: [...Array(max)].map(() => Math.floor(Math.random() * 100 + 1))
            });
        }
    }

    render() {
        return (
            <div className="App">
                <ArrayVisualizer list={this.state.values} handleMaxValue={this.handleMaxValue} />
            </div>
        )
    };
}

export default App;
