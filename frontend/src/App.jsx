// FleetTrack · harta rutelor. Layout (antet, navigație, subsol) înconjoară fiecare pagină,
// iar pagina potrivită adresei se desenează în locul lui <Outlet /> din Layout.
import { Route, Routes } from "react-router-dom";
import Layout from "./components/Layout.jsx";
import TiruriPage from "./pages/TiruriPage.jsx";
import TirDetaliuPage from "./pages/TirDetaliuPage.jsx";
import DesprePage from "./pages/DesprePage.jsx";
import NotFoundPage from "./pages/NotFoundPage.jsx";

export default function App() {
  return (
    <Routes>
      <Route element={<Layout />}>
        <Route path="/" element={<TiruriPage />} />
        {/* ruta de detaliu: /<resource>/:id, cu resource din tw.json ("tiruri") */}
        <Route path="/tiruri/:id" element={<TirDetaliuPage />} />
        <Route path="/despre" element={<DesprePage />} />
        {/* orice altă adresă */}
        <Route path="*" element={<NotFoundPage />} />
      </Route>
    </Routes>
  );
}
