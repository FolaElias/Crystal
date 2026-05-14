import { useEffect } from 'react';
import { RouterProvider } from 'react-router-dom';
import { Provider } from 'react-redux';
import { store } from './app/store';
import { router } from './router';
import { CrystalSplashProvider } from './contexts/CrystalSplashContext';
import { useCrystalSplash } from './contexts/CrystalSplashContext';
import { useRefreshMutation } from './features/auth/authApi';
import { setCredentials, setInitialized } from './features/auth/authSlice';
import { useAppDispatch } from './app/hooks';

function AuthInitializer() {
  const dispatch = useAppDispatch();
  const { triggerSplash } = useCrystalSplash();
  const [refresh] = useRefreshMutation();

  useEffect(() => {
    refresh()
      .unwrap()
      .then((res) => {
        if (res.data?.accessToken) {
          dispatch(setCredentials({ accessToken: res.data.accessToken }));
          triggerSplash(() => dispatch(setInitialized()));
        } else {
          dispatch(setInitialized());
        }
      })
      .catch(() => {
        dispatch(setInitialized());
      });
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return null;
}

export default function App() {
  return (
    <Provider store={store}>
      <CrystalSplashProvider>
        <AuthInitializer />
        <RouterProvider router={router} />
      </CrystalSplashProvider>
    </Provider>
  );
}
