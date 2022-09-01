import type * as React from 'react';
import * as ReactDOM from 'react-dom';
import type { Root } from 'react-dom/client';

type ContainerType = Element | null;

type CreateRoot = (container: ContainerType) => Root;

const fullClone = {
    ...ReactDOM,
} as typeof ReactDOM & {
    __SECRET_INTERNALS_DO_NOT_USE_OR_YOU_WILL_BE_FIRED?: {
        usingClientEntryPoint?: boolean;
    };
    createRoot?: CreateRoot;
};

const { version, render: reactRender } = fullClone;

let createRoot: CreateRoot | undefined;
try {
    const mainVersion = Number((version || '').split('.')[0]);
    if (mainVersion >= 18) {
        ({ createRoot } = fullClone);
    }
} catch {}

function toggleWarning(skip: boolean) {
    const { __SECRET_INTERNALS_DO_NOT_USE_OR_YOU_WILL_BE_FIRED } = fullClone;

    if (
        __SECRET_INTERNALS_DO_NOT_USE_OR_YOU_WILL_BE_FIRED &&
        typeof __SECRET_INTERNALS_DO_NOT_USE_OR_YOU_WILL_BE_FIRED === 'object'
    ) {
        __SECRET_INTERNALS_DO_NOT_USE_OR_YOU_WILL_BE_FIRED.usingClientEntryPoint = skip;
    }
}

export function render(node: React.ReactElement, container: ContainerType) {
    if (createRoot) {
        toggleWarning(true);
        const root = createRoot?.(container);
        toggleWarning(false);

        root?.render(node);
    } else {
        reactRender(node, container);
    }
}
