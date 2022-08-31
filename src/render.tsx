import { type ReactElement } from 'react';
import ReactDOM, { type Container } from 'react-dom';
import { type Root } from 'react-dom/client';

type CreateRoot = (container: Element) => Root;

const escapeCode = { ...ReactDOM } as typeof ReactDOM & { createRoot?: CreateRoot };

export default function render(node: ReactElement, container: Container | null) {
    const reactVersion = ReactDOM.version;
    const mainVersion = Number((reactVersion || '').split('.')[0]);
    if (mainVersion >= 18) {
        //@ts-ignore
        const root = escapeCode.createRoot(container);
        root.render(node);
    } else {
        escapeCode.render(node, container);
    }
}
