# react-launcher

[**English**](./README.md) | **简体中文**

基于 React-Router 的轻量的、可扩展的启动器。

# Install

```shell
npm install @aktiv/launcher
```

# Introduction

Launcher 是一个基于 React-Router 的启动器，接收一个静态路由的数组，并在其之上封装了一套插件机制

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
| **hash** | boolean | false | 是否使用 hashRouter，默认为 BrowserRouter |
| **rootNode** | string | #root | React 挂载的 dom 节点 |
| **strictMode** | boolean | false | 是否开启 React 严格模式 |
| **routes** | Array\<RouteItemUnionType\> | required | 路由配置，详见以下类型 |
| **basename** | string | undefined | [参考](https://reactrouter.com/en/main/routers/router) |

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

在 React-Router 的基础上扩展了 `LauncherRedirectRouteProps` 路由和 `title`、`lazy` 的路由能力

# plugin

plugin 功能是 Launcher 的最强大的功能，它基于 router 开发，一个 plugin 看起来是这样的

```typescript
export interface PluginType {
    name: string;
    outer?: PluginOuterRenderType;
    inner?: PluginInnerRenderType;
}
```

最简单的场景是登陆接口请求成功之后，你才想展示你的应用，并且把用户信息传递下去

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
    // 第一个参数为内层的组件，第二个参数为 use 时传入的参数
    outer: (children, opt) => {
        return <LoginProvider opt={opt}>{children}</LoginProvider>;
    },
};
const app = new Launcher({...});
// 通过第二个参数给插件传参
app.use(loginPlugin, opt)
app.start()
```

当然你可以拥有多个插件，只需注意插件的调用层级，在后边调用的会包裹在外层

### outer

outer 的例子如上所示，这里要说明的是 outer 是包裹在 router 外层的，所以你可以理解为全局唯一的

### inner

inner 常用的例子是对每个路由进行控制，因为它是包裹在每个 route 外层的，例如需要对每个路由进行鉴权

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
        return '没有权限';
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
            // /about 需要鉴权
            hasAuth: true,
        },
    ],
});
app.use(plugin, opt);
```
