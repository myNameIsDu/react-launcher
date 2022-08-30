import { useEffect } from 'react';
import { useLocation, useResolvedPath, useNavigate } from 'react-router-dom';
interface WrapperRouteProps {
    children: JSX.Element;
    title?: string;
}
function WrapperRoute({ children, title }: WrapperRouteProps): JSX.Element {
    const { pathname: currentRouteAbsolutePath } = useResolvedPath('.');
    const { pathname } = useLocation();
    const navigate = useNavigate();

    useEffect(() => {
        if (title) {
            document.title = title;
        }
    }, [currentRouteAbsolutePath, navigate, pathname, title]);

    return children;
}

export default WrapperRoute;
