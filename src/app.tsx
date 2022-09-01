import { StrictMode } from 'react';
import loadable, { type LoadingComponentProps } from 'react-loadable';
import type { ComponentType, ReactElement } from 'react';
import {
    PathRouteProps,
    LayoutRouteProps,
    IndexRouteProps,
    HashRouter,
    BrowserRouter,
    Routes,
    Navigate,
    Route,
} from 'react-router-dom';
import { default as defaultLoading } from './loading';
import WrapperRouteTitle from './wrapper-route-title';
import { render } from './render';

export type DynamicImportType = Promise<{ default: ComponentType }>;

type LauncherComponentType = ComponentType | (() => DynamicImportType);
type OmitChildrenElement<T> = Omit<T, 'children' | 'element'>;

export type LauncherPathRouteProps = {
    title?: string;
    lazy?: boolean;
    component?: LauncherComponentType;
    loading?: ComponentType<LoadingComponentProps>;
    children?: Array<LauncherRouteItem>;
} & OmitChildrenElement<PathRouteProps>;

export type LauncherLayoutRouteProps = {
    lazy?: boolean;
    component?: LauncherComponentType;
    loading?: ComponentType<LoadingComponentProps>;
    children?: Array<LauncherRouteItem>;
} & OmitChildrenElement<LayoutRouteProps>;

export type LauncherIndexRouteProps = {
    lazy?: boolean;
    component?: LauncherComponentType;
    loading?: ComponentType<LoadingComponentProps>;
} & OmitChildrenElement<IndexRouteProps>;
export type LauncherRedirectRouteProps = {
    path?: string;
    redirect?: string;
};

export type RouteItemUnionType =
    | LauncherPathRouteProps
    | LauncherLayoutRouteProps
    | LauncherIndexRouteProps
    | LauncherRedirectRouteProps;

type RoutePropsKeys =
    | keyof LauncherPathRouteProps
    | keyof LauncherLayoutRouteProps
    | keyof LauncherIndexRouteProps
    | keyof LauncherRedirectRouteProps;
type WrapperOtherKey<T extends RouteItemUnionType, K = keyof T> = T & {
    [P in Exclude<RoutePropsKeys, K>]: undefined;
};
type LauncherRouteItem =
    | WrapperOtherKey<LauncherPathRouteProps>
    | WrapperOtherKey<LauncherLayoutRouteProps>
    | WrapperOtherKey<LauncherIndexRouteProps>
    | WrapperOtherKey<LauncherRedirectRouteProps>;

type HasWrappedRoute = LauncherPathRouteProps | LauncherLayoutRouteProps | LauncherIndexRouteProps;
export type PluginOuterRenderType = (
    children: ReactElement,
    opt: Record<string, any>,
) => ReactElement;
export type PluginInnerRenderType = (
    children: ReactElement,
    route: HasWrappedRoute,
    opt: Record<string, any>,
) => ReactElement;

export interface PluginType {
    name: string;
    outer?: PluginOuterRenderType;
    inner?: PluginInnerRenderType;
}

type PluginsType = { plugin: PluginType; options: Record<string, any> }[];

export type ConstructorOptionsType = {
    /**
     * @type {boolean} Whether to use HashRouter(default is BrowserRouter)
     */
    hash?: boolean;
    /**
     * @type {string}  The node Which React will mount
     */
    rootNode?: string;
    /**
     * @type {boolean} Whether to enable React's strict mode(default is false)
     */
    strictMode?: boolean;

    /**
     * @type {Array<RouteItemUnionType>} routing array
     */
    routes: Array<RouteItemUnionType>;

    /**
     * @type {string} https://reactrouter.com/en/main/routers/browser-router#browserrouter
     */
    basename?: string;
};

export default class Launcher {
    private options: ConstructorOptionsType;
    private plugins: PluginsType;
    constructor(opt: ConstructorOptionsType) {
        this.options = opt;
        this.plugins = [];
    }

    private renderRouters(routes: Array<LauncherRouteItem> | undefined) {
        if (!routes) {
            return [];
        }
        return routes.map(item => {
            const {
                redirect,
                component,
                path,
                caseSensitive,
                index,
                title,
                lazy,
                loading = defaultLoading,
                children,
            } = item;
            if (redirect && !component) {
                // Redirect route
                return <Route key={path} path={path} element={<Navigate to={redirect} />} />;
            }
            let Com = component;
            if (component) {
                if (lazy) {
                    Com = loadable({
                        loader: component as () => DynamicImportType,
                        loading,
                    });
                }
                const C = Com as ComponentType;
                const baseWrappedComponent = title ? (
                    <WrapperRouteTitle title={title}>
                        <C />
                    </WrapperRouteTitle>
                ) : (
                    <C />
                );

                const pluginInnerWrapped = this.pluginWrap(
                    'inner',
                    baseWrappedComponent,
                    item as HasWrappedRoute,
                );
                // PathRoute and LayoutRoute and IndexRoute
                return (
                    <Route
                        key={path || Math.random()}
                        index={index}
                        caseSensitive={caseSensitive}
                        path={path}
                        element={pluginInnerWrapped}
                    >
                        {this.renderRouters(children)}
                    </Route>
                );
            }
            // no component
            return (
                <Route key={path} index={index} caseSensitive={caseSensitive} path={path}>
                    {this.renderRouters(children)}
                </Route>
            );
        });
    }

    private pluginWrap(type: 'outer', children: ReactElement): ReactElement;
    private pluginWrap(type: 'inner', children: ReactElement, route: HasWrappedRoute): ReactElement;
    private pluginWrap(
        type: 'outer' | 'inner',
        children: ReactElement,
        route?: HasWrappedRoute,
    ): ReactElement {
        let wrapper = children;

        this.plugins.forEach(item => {
            const { plugin, options } = item;
            const wrapperMethod = plugin[type];

            if (typeof wrapperMethod === 'function') {
                if (route) {
                    // inner
                    wrapper = wrapperMethod(wrapper, route, options);
                } else {
                    // outer
                    wrapper = (wrapperMethod as PluginOuterRenderType)(wrapper, options);
                }
            }
        });

        return wrapper;
    }

    private wrapInner(routes: Array<LauncherRouteItem>, hash?: boolean, basename?: string) {
        const Router = hash ? HashRouter : BrowserRouter;
        const Inner = () => {
            return (
                <Router basename={basename}>
                    <Routes>{this.renderRouters(routes)}</Routes>
                </Router>
            );
        };
        return <Inner />;
    }

    private wrapInit(routes: Array<LauncherRouteItem>, basename?: string, hash?: boolean) {
        const wrappedInner = this.wrapInner(routes, hash, basename);
        const wrappedOuter = this.pluginWrap('outer', wrappedInner);
        return wrappedOuter;
    }

    public start() {
        const { hash, routes, basename, rootNode = '#root', strictMode = false } = this.options;
        const app = this.wrapInit(routes as LauncherRouteItem[], basename, hash);
        const App = strictMode ? <StrictMode>{app}</StrictMode> : app;
        const container = document.querySelector(rootNode);

        render(App, container!);
    }

    public use(plugin: PluginType, options: Record<string, any> = {}) {
        this.plugins.push({ plugin, options });
    }
}
