import ReactDOM from 'react-dom/client';
import App from './app';
import './index.css';

// NOTE: StrictMode is intentionally omitted. Its double-invoked mount effects
// create/destroy the PixiJS renderer and the RAF simulation loop twice, which
// produces duplicate canvases and stuttered physics. Deterministic game loops
// should own a single lifecycle.
ReactDOM.createRoot(document.getElementById('root') as HTMLElement).render(<App />);
