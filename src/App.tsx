import { useState } from 'react';
import ArrayVisualizer from './components/ArrayVisualizer';
import './App.css';

function App() {
    const [maxItems, setMaxItems] = useState(0);

    const handleMaxValue = (max: number): void => {
        if(max !== maxItems) {
            setMaxItems(max);
        }
    }

    const randList = [...Array(maxItems)].map(() => Math.floor(Math.random() * 100 + 1));

    return (
        <div className="App">
            <ArrayVisualizer list={randList} handleMaxValue={handleMaxValue} />
        </div>
    );
}

export default App;
