import '@testing-library/jest-dom';

let node: HTMLDivElement;

beforeEach(() => {
    node = document.createElement('div');

    node.id = 'root';
    node.setAttribute('data-testid', 'root');
    document.body.appendChild(node);
});

afterEach(() => {
    node.remove();
    window.history.pushState({}, '', '/');
});
