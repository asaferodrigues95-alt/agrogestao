import { HashRouter, Routes, Route } from 'react-router-dom';
import Layout from '@shared/layout/Layout';
import { routes } from './routes';

// HashRouter é usado para garantir que o roteamento funcione mesmo 100% offline
// e quando o app é aberto diretamente do cache do PWA (sem servidor de rotas).
export default function App() {
  return (
    <HashRouter>
      <Routes>
        <Route element={<Layout />}>
          {routes.map(({ path, Component }) => (
            <Route key={path} path={path} element={<Component />} />
          ))}
        </Route>
      </Routes>
    </HashRouter>
  );
}
