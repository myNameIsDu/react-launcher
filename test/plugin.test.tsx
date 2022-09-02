import type { ReactElement } from 'react';
import Launcher, { Link, Outlet, type RouteItemUnionType } from '../src';
import { act, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';

describe('plugin', () => {
    it('should outer wrap router component and receive opt', async () => {
        const user = userEvent.setup();
        /* eslint-disable */
        const spyOuterCallTime = jest.fn(() => {});
        const spyOuterRenderTime = jest.fn(() => {});
        /* eslint-enable */
        const opt = {
            a: 123,
            b: 345,
        };
        const OuterComponent = ({ children }: { children: ReactElement }) => {
            spyOuterRenderTime();

            return (
                <div>
                    outer Router
                    {children}
                </div>
            );
        };
        const plugin = {
            name: 'testPlugin',
            outer: (children: ReactElement, receiveOpt: Record<string, any>) => {
                expect(receiveOpt).toEqual(opt);
                spyOuterCallTime();

                return <OuterComponent>{children}</OuterComponent>;
            },
        };
        const Home = () => {
            return (
                <div>
                    <Link to="/about">about</Link>
                    home
                    <Outlet />
                </div>
            );
        };
        const About = () => {
            return <div>about</div>;
        };
        const homeRoute = {
            path: '/',
            component: Home,
        };
        const aboutRoute = {
            path: '/about',
            component: About,
        };
        const app = new Launcher({
            routes: [homeRoute, aboutRoute],
        });

        app.use(plugin, opt);
        act(() => {
            app.start();
        });
        expect(screen.getAllByTestId('root')).toMatchInlineSnapshot(`
            [
              <div
                data-testid="root"
                id="root"
              >
                <div>
                  outer Router
                  <div>
                    <a
                      href="/about"
                    >
                      about
                    </a>
                    home
                  </div>
                </div>
              </div>,
            ]
        `);
        expect(spyOuterCallTime).toHaveBeenCalledTimes(1);
        expect(spyOuterRenderTime).toHaveBeenCalledTimes(1);
        await user.click(screen.getByText('about'));
        expect(screen.getAllByTestId('root')).toMatchInlineSnapshot(`
            [
              <div
                data-testid="root"
                id="root"
              >
                <div>
                  outer Router
                  <div>
                    about
                  </div>
                </div>
              </div>,
            ]
        `);
        expect(spyOuterCallTime).toHaveBeenCalledTimes(1);
        expect(spyOuterRenderTime).toHaveBeenCalledTimes(1);
    });

    it('should inner wrap the route component and receive opt and route', async () => {
        const user = userEvent.setup();
        /* eslint-disable */
        const spyInnerCallTime = jest.fn(() => {});
        const spyInnerRenderTime = jest.fn(() => {});
        const spyHomeRenderTime = jest.fn(() => {});
        /* eslint-enable */

        const opt = {
            a: 1,
            b: 2,
        };
        const routeList: RouteItemUnionType[] = [];

        const InnerComponent = ({ children }: { children: ReactElement }) => {
            spyInnerRenderTime();

            return (
                <div>
                    innerRouter
                    <div>{children}</div>
                </div>
            );
        };

        const plugin = {
            name: 'testPlugin',
            inner: (children: ReactElement, route: RouteItemUnionType, receiveOpt: any) => {
                expect(receiveOpt).toEqual(opt);
                spyInnerCallTime();
                routeList.push(route);

                return <InnerComponent>{children}</InnerComponent>;
            },
        };
        const Home = () => {
            spyHomeRenderTime();

            return (
                <div>
                    <Link to="/children">children</Link>
                    home
                    <Outlet />
                </div>
            );
        };
        const Children = () => {
            return <div>children</div>;
        };
        const childrenRoute = {
            path: 'children',
            hasAuth: true,
            component: Children,
        };
        const homeRoute = {
            path: '/',
            component: Home,
            children: [childrenRoute],
        };
        const app = new Launcher({
            routes: [homeRoute],
        });

        app.use(plugin, opt);
        act(() => {
            app.start();
        });
        expect(screen.getAllByTestId('root')).toMatchInlineSnapshot(`
            [
              <div
                data-testid="root"
                id="root"
              >
                <div>
                  innerRouter
                  <div>
                    <div>
                      <a
                        href="/children"
                      >
                        children
                      </a>
                      home
                    </div>
                  </div>
                </div>
              </div>,
            ]
        `);
        expect(spyInnerRenderTime).toHaveBeenCalledTimes(1);
        expect(spyHomeRenderTime).toHaveBeenCalledTimes(1);
        expect(spyInnerCallTime).toHaveBeenCalledTimes(2);
        await user.click(screen.getByText('children'));

        expect(screen.getAllByTestId('root')).toMatchInlineSnapshot(`
            [
              <div
                data-testid="root"
                id="root"
              >
                <div>
                  innerRouter
                  <div>
                    <div>
                      <a
                        href="/children"
                      >
                        children
                      </a>
                      home
                      <div>
                        innerRouter
                        <div>
                          <div>
                            children
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>,
            ]
        `);
        expect(spyInnerRenderTime).toHaveBeenCalledTimes(2);

        expect(spyHomeRenderTime).toHaveBeenCalledTimes(1);
        expect(routeList).toEqual([homeRoute, childrenRoute]);
    });
});
