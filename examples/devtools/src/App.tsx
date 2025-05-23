import reactLogo from './assets/react.svg';
import viteLogo from '/vite.svg';
import './App.css';
import '../../../packages/native/src/devTools';
import { FastEvent } from '../../../packages/native/src/index';

const emitter = new FastEvent<{
    add: number;
    dec: number;
}>({
    id: 'myevent',
    debug: true,
});

let index: number = 0;
emitter.on('mousemove', function (message) {
    console.log('click: ', message.type);
    console.log('click: ', message.payload);
});
emitter.on('add', (message) => {
    console.log('add: ', message);
    return Math.floor(Math.random() * 100);
});
emitter.on('add', function onAdd(message) {
    console.log('onAdd: ', message);
    return Math.floor(Math.random() * 100);
},{
    tag:"app.tsx"
});
emitter.on('add', function onAddError(message) {
    console.log('onAddError: ', message);
    throw new Error('onAddError' + Math.floor(Math.random() * 100));
});
emitter.on('dec', (message) => {
    console.log('dec: ', message);
    return Math.floor(Math.random() * 100);
});

const subscriber = emitter.on('dec', function onDec(message) {
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
                <button onClick={() => subscriber.off()}>off onDec</button>
                <p></p>
            </div>
            <p className="read-the-docs">Click on the Vite and React logos to learn more</p>
        </>
    );
}

export default App;
