# react-launcher

**English** | [**简体中文**](./README.zh-CN.md)

A lightweight extensible launcher based on React-Router.

# Install

```shell
npm install react-launcher
```

# Introduction

Launcher is a React-Router-based launcher that takes an array of static routes and wraps a set of plugin mechanisms on top of it

## Get Started

```jsx
import Launcher from 'react-launcher';

const Home = () => {
    return <div>home</div>;
};
const About = () => {
    return <div>home</div>;
};

const RouterConfig = [
    {
        path: '/',
        component: Home,
    },
    {
        path: '/about',
        component: About,
    },
];

const app = new Launcher({
    routes: RouterConfig,
});

app.start();
```

# options

| Name | Type | required or Default | Description |
| --- | --- | --- | --- |
| **hash** | boolean | false | Whether to use hashRouter. The default is BrowserRouter |
| **rootNode** | string | #root | React Mounted DOM node |
| **strictMode** | boolean | false | Whether to turn on React strict mode |
| **routes** | Array\<RouteItemUnionType\> | required | Routing configuration, see the following types for details |
| **basename** | string | undefined | [reference](https://reactrouter.com/en/main/routers/router) |

## types

```typescript
type ConstructorOptionsType = {
    hash?: boolean;
    rootNode?: string;
    strictMode?: boolean;
    routes: Array<RouteItemUnionType>;
    basename?: string;
};

type RouteItemUnionType =
    | LauncherPathRouteProps
    | LauncherLayoutRouteProps
    | LauncherIndexRouteProps
    | LauncherRedirectRouteProps;

type LauncherPathRouteProps = {
    title?: string;
    lazy?: boolean;
    component?: LauncherComponentType;
    loading?: ComponentType<LoadingComponentProps>;
    children?: Array<RouteItemUnionType>;
} & OmitChildrenElement<PathRouteProps>;

type LauncherLayoutRouteProps = {
    lazy?: boolean;
    component?: LauncherComponentType;
    loading?: ComponentType<LoadingComponentProps>;
    children?: Array<RouteItemUnionType>;
} & OmitChildrenElement<LayoutRouteProps>;

type LauncherIndexRouteProps = {
    lazy?: boolean;
    component?: LauncherComponentType;
    loading?: ComponentType<LoadingComponentProps>;
} & OmitChildrenElement<IndexRouteProps>;

type LauncherRedirectRouteProps = {
    path?: string;
    redirect?: string;
};

type DynamicImportType = Promise<{ default: ComponentType }>;

type LauncherComponentType = ComponentType | (() => DynamicImportType);
type OmitChildrenElement<T, K extends keyof T = never> = Omit<T, 'children' | 'element' | K>;
```

Extended `LauncherRedirectRouteProps` routing and `title`, `lazy` routing capabilities on top of React-Router

# plugin

The plugin function is the most powerful feature of the Launcher, It's based on router development, and a plugin looks like this

```typescript
export interface PluginType {
    name: string;
    outer?: PluginOuterRenderType;
    inner?: PluginInnerRenderType;
}
```

The simplest scenario is when the login request is successful and you want to show your application and pass on the user information

```jsx
import React, { useEffect, useState } from 'react';
import Launcher from 'react-launcher';
const LoginProviderContext = React.createContext(null);

const LoginProvider = ({ children }) => {
    const [isLogin, setLogin] = useState(false);
    const [userInfo, setUserInfo] = useState({});

    useEffect(() => {
        loginApi()
            .then(res => {
                setLogin(true);
                setUserInfo(res.data);
            })
            .catch(error => {
                redirect('/login');
            });
    }, []);

    return isLogin ? (
        <LoginProviderContext.Provider value={userInfo}>{children}</LoginProviderContext.Provider>
    ) : null;
};

const loginPlugin = {
    name: 'login',
    // The first argument is the inner component, and the second argument is the argument passed in during use
    outer: (children, opt) => {
        return <LoginProvider opt={opt}>{children}</LoginProvider>;
    },
};
const app = new Launcher({...});
// Pass the plugin a parameter via the second argument
app.use(loginPlugin, opt)
app.start()
```

Of course you can have multiple plugins, just be aware of the plugin call hierarchy, the ones called later will be wrapped in the outer

## outer

The outer example is shown above, where it should be noted that the outer is wrapped around the router, so you can interpret it as a globally unique

## inner

A common example of inner is per-route control, as it is wrapped around the outer layer of each route, such as the need to authenticate each rout e

```tsx
import React, { useEffect, useState, useContext } from 'react';
import Launcher, { useLocation } from 'react-launcher';

const AuthContext = React.createContext();

const AuthProvider = ({ children }) => {
    const [authData, setAuthData] = useState();
    useEffect(() => {
        authApi().then(res => {
            setAuthData(res.data);
        });
    }, []);
    return authData ? (
        <AuthContext.Provider value={authData}>{children}</AuthContext.Provider>
    ) : null;
};

const AuthRouteComponent = ({ children, route }) => {
    const { hasAuth } = route;
    const { pathname } = useLocation();
    const authInfo = useContext(AuthContext);

    if (hasAuth && !authInfo.has(pathname)) {
        return 'No permission';
    }
    return children;
};

const plugin = {
    name: 'auth',
    outer: (children, opt) => {
        return <AuthProvider opt={opt}>{children}</AuthProvider>;
    },
    inner: (children, route, opt) => {
        return (
            <AuthRouteComponent route={route} opt={opt}>
                {children}
            </AuthRouteComponent>
        );
    },
};

const Home = () => <div>home</div>;
const About = () => <div>about</div>;

const app = new Launcher({
    routes: [
        {
            path: '/',
            component: Home,
        },
        {
            path: '/about',
            component: Home,
            // /about authentication is required
            hasAuth: true,
        },
    ],
});
app.use(plugin, opt);
```
