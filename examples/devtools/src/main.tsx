import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import './index.css';
import App from './App.tsx';

createRoot(document.getElementById('root')!).render(
    <StrictMode>
        <App />
    </StrictMode>,
);

declare module '../../../packages/native/src/index' {
    interface FastEvents {
        click: { x: number; y: number };
        mousemove: boolean;
        scroll: number;
        focus: string;
    }
}
