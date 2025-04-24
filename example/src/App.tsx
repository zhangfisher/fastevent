import reactLogo from './assets/react.svg';
import viteLogo from '/vite.svg';
import './App.css';
import '../../src/devTools';
import { FastEvent } from '../../src/index';

const emitter = new FastEvent<{
    add: number;
    dec: number;
}>({
    id: 'eventemitter',
    debug: true,
});

let index: number = 0;

emitter.on('add', (message) => {
    console.log('add: ', message);
    return Math.floor(Math.random() * 100);
});
emitter.on('add', function onAdd(message) {
    console.log('onAdd: ', message);
    return Math.floor(Math.random() * 100);
});
emitter.on('add', function onAddError() {
    throw new Error('onAddError' + Math.floor(Math.random() * 100));
});
emitter.on('dec', (message) => {
    console.log('dec: ', message);
    return Math.floor(Math.random() * 100);
});

emitter.on('dec', function onDec(message) {
    console.log('onDec: ', message);
    return Math.floor(Math.random() * 100);
});

function App() {
    return (
        <>
            <div>
                <a href="https://vite.dev" target="_blank">
                    <img src={viteLogo} className="logo" alt="Vite logo" />
                </a>
                <a href="https://react.dev" target="_blank">
                    <img src={reactLogo} className="logo react" alt="React logo" />
                </a>
            </div>
            <h1>Vite + React</h1>
            <div className="card">
                <button onClick={() => emitter.emit('add', index++)}>emit add</button>
                <button onClick={() => emitter.emit('dec', index++)}>emit dec</button>
                <p></p>
            </div>
            <p className="read-the-docs">Click on the Vite and React logos to learn more</p>
        </>
    );
}

export default App;
