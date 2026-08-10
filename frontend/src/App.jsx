import { Routes, Route } from "react-router-dom";
import SiteLayout from "./components/SiteLayout";
import Home from "./pages/Home";
import CategoryPage from "./pages/CategoryPage";
import ProductPage from "./pages/ProductPage";
import Cart from "./pages/Cart";
import Wishlist from "./pages/Wishlist";
import Checkout from "./pages/Checkout";
import Login from "./pages/Login";
import Register from "./pages/Register";
import OrderHistory from "./pages/OrderHistory";

import AdminLayout from "./pages/admin/AdminLayout";
import AdminDashboard from "./pages/admin/AdminDashboard";
import AdminCategories from "./pages/admin/AdminCategories";
import AdminProducts from "./pages/admin/AdminProducts";
import AdminExcelImport from "./pages/admin/AdminExcelImport";
import AdminOrders from "./pages/admin/AdminOrders";

export default function App() {
  return (
    <Routes>
      <Route element={<SiteLayout />}>
        <Route path="/" element={<Home />} />
        <Route path="/kategoriya/:categoryId" element={<CategoryPage />} />
        <Route path="/qidiruv" element={<CategoryPage />} />
        <Route path="/mahsulot/:slug" element={<ProductPage />} />
        <Route path="/savat" element={<Cart />} />
        <Route path="/sevimlilar" element={<Wishlist />} />
        <Route path="/checkout" element={<Checkout />} />
        <Route path="/kirish" element={<Login />} />
        <Route path="/royxatdan-otish" element={<Register />} />
        <Route path="/buyurtmalarim" element={<OrderHistory />} />
      </Route>

      <Route path="/admin" element={<AdminLayout />}>
        <Route index element={<AdminDashboard />} />
        <Route path="mahsulotlar" element={<AdminProducts />} />
        <Route path="kategoriyalar" element={<AdminCategories />} />
        <Route path="buyurtmalar" element={<AdminOrders />} />
        <Route path="excel-import" element={<AdminExcelImport />} />
      </Route>
    </Routes>
  );
}
