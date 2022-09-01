import Launcher, { Link, Outlet, type RouteItemUnionType } from '../src';
import { act, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';

describe('render router', () => {
    function Home() {
        return (
            <div>
                home
                <Link to="/children">children</Link>
                <Link to="/childrenTwo">childrenTwo</Link>
                <Outlet />
            </div>
        );
    }
    function Children() {
        return <div>children</div>;
    }
    function ChildrenTwo() {
        return <div>childrenTwo</div>;
    }

    const startMethod = (routes: RouteItemUnionType[]) => {
        const app = new Launcher({
            routes,
        });

        act(() => {
            app.start();
        });
    };
    it('should render nest router', () => {
        const user = userEvent.setup();
        const routerConfig = [
            {
                path: '/',
                component: Home,
                children: [
                    {
                        path: '/children',
                        component: Children,
                    },
                    {
                        path: '/childrenTwo',
                        component: ChildrenTwo,
                    },
                ],
            },
        ];
        startMethod(routerConfig);

        expect(screen.getByTestId('root')).toMatchInlineSnapshot(`
            <div
              data-testid="root"
              id="root"
            >
              <div>
                home
                <a
                  href="/children"
                >
                  children
                </a>
                <a
                  href="/childrenTwo"
                >
                  childrenTwo
                </a>
              </div>
            </div>
        `);

        user.click(screen.getByText('children'));

        expect(screen.getByTestId('root')).toMatchInlineSnapshot(`
            <div
              data-testid="root"
              id="root"
            >
              <div>
                home
                <a
                  href="/children"
                >
                  children
                </a>
                <a
                  href="/childrenTwo"
                >
                  childrenTwo
                </a>
              </div>
            </div>
        `);

        user.click(screen.getByText('childrenTwo'));

        expect(screen.getByTestId('root')).toMatchInlineSnapshot(`
            <div
              data-testid="root"
              id="root"
            >
              <div>
                home
                <a
                  href="/children"
                >
                  children
                </a>
                <a
                  href="/childrenTwo"
                >
                  childrenTwo
                </a>
              </div>
            </div>
        `);
    });

    it('should render layout route', () => {
        const Layout = () => {
            return (
                <div>
                    layout
                    <Outlet />
                </div>
            );
        };

        const routerConfig = [
            {
                component: Layout,
                children: [
                    {
                        path: '/',
                        component: Children,
                    },
                ],
            },
        ];
        startMethod(routerConfig);

        expect(screen.getAllByTestId('root')).toMatchInlineSnapshot(`
            [
              <div
                data-testid="root"
                id="root"
              >
                <div>
                  layout
                  <div>
                    children
                  </div>
                </div>
              </div>,
            ]
        `);
    });

    it('should render index route', () => {
        const routerConfig = [
            {
                path: '/',
                component: Home,
                children: [
                    {
                        index: true,
                        component: Children,
                    },
                    {
                        path: 'childrenTwo',
                        component: ChildrenTwo,
                    },
                ],
            },
        ];

        startMethod(routerConfig);

        expect(screen.getByTestId('root')).toMatchInlineSnapshot(`
            <div
              data-testid="root"
              id="root"
            >
              <div>
                home
                <a
                  href="/children"
                >
                  children
                </a>
                <a
                  href="/childrenTwo"
                >
                  childrenTwo
                </a>
                <div>
                  children
                </div>
              </div>
            </div>
        `);
    });

    it('should render redirect', () => {
        const routerConfig = [
            {
                path: '/',
                redirect: '/children',
            },
            {
                path: '/children',
                component: Children,
            },
        ];
        startMethod(routerConfig);

        expect(window.location.pathname).toBe('/children');
        expect(screen.getByTestId('root')).toMatchInlineSnapshot(`
            <div
              data-testid="root"
              id="root"
            >
              <div>
                children
              </div>
            </div>
        `);
    });
});
