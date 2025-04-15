import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './app';
import '@fontsource/public-sans';
import { AuthContextProvider } from './utils/authentication/auth-context';

const root = document.getElementById('root');
const reactRoot = ReactDOM.createRoot(root);
reactRoot.render(
    <React.StrictMode>
        <AuthContextProvider>
            <App />
        </AuthContextProvider>
    </React.StrictMode>
);