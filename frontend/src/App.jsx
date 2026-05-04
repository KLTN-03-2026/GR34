import { Routes, Route, useLocation, Outlet } from "react-router-dom";
import Navbar from "./components/Navbar.jsx";
import Footer from "./components/Footer.jsx";
import ProtectedRoute from "./components/ProtectedRoute.jsx";
import ScrollToTop from "./components/ScrollToTop.jsx";

import Home from "./pages/Home.jsx";
import Tracking from "./pages/Tracking.jsx";
import About from "./pages/About.jsx";
import Services from "./pages/Services.jsx";
import Contact from "./pages/Contact.jsx";
import Login from "./pages/Login.jsx";
import Register from "./pages/Register.jsx";
import NewsDetail from "./pages/NewsDetail.jsx";
import ForgotPassword from "./pages/ForgotPassword";
import Logout from "./pages/Logout.jsx";
import Unauthorized from "./pages/Unauthorized.jsx";
import ApplyDriver from "./pages/ApplyDriver.jsx";

import AdminLayout from "./layouts/AdminLayout.jsx";
import DispatcherLayout from "./layouts/DispatcherLayout.jsx";
import DriverLayout from "./layouts/DriverLayout.jsx";
import CustomerLayout from "./layouts/CustomerLayout.jsx";

import AdminDashboard from "./pages/admin/AdminDashboard.jsx";
import AdminShipments from "./pages/admin/AdminShipments.jsx";
import AdminDrivers from "./pages/admin/AdminDrivers.jsx";
import AdminCustomers from "./pages/admin/AdminCustomers.jsx";
import AdminPayments from "./pages/admin/AdminPayments.jsx";
import AdminUsers from "./pages/admin/AdminUsers.jsx";
import AdminFeedbacks from "./pages/admin/AdminFeedbacks.jsx";
import AdminContacts from "./pages/admin/AdminContacts";
import AdminNews from "./pages/admin/AdminNews.jsx";
import AdminShipmentDetail from "./pages/admin/AdminShipmentDetail.jsx";

import DispatcherDashboard from "./pages/dispatcher/DispatcherDashboard.jsx";
import DispatcherAssignments from "./pages/dispatcher/DispatcherAssignments.jsx";
import DispatcherTracking from "./pages/dispatcher/DispatcherTracking.jsx";
import DispatcherTrackingDetail from "./pages/dispatcher/DispatcherTrackingDetail.jsx";
import DispatcherContacts from "./pages/dispatcher/DispatcherContacts.jsx";
import DispatcherChat from "./pages/dispatcher/DispatcherChat.jsx";
import FailedShipmentsPanel from "./pages/dispatcher/FailedShipmentsPanel.jsx";

import DriverDashboard from "./pages/driver/DriverDashboard.jsx";
import DriverAssignments from "./pages/driver/DriverAssignments.jsx";
import DriverHistory from "./pages/driver/DriverHistory.jsx";
import DriverProfile from "./pages/driver/DriverProfile.jsx";
import DriverShipmentDetail from "./pages/driver/DriverShipmentDetail.jsx";

import CustomerDashboard from "./pages/customer/CustomerDashboard.jsx";
import CustomerCreateShipment from "./pages/customer/CustomerCreateShipment.jsx";
import CustomerTrack from "./pages/customer/CustomerTrack.jsx";
import CustomerHistory from "./pages/customer/CustomerHistory.jsx";
import CustomerProfile from "./pages/customer/CustomerProfile.jsx";
import CustomerShipmentDetail from "./pages/customer/CustomerShipmentDetail.jsx";
import CustomerPayment from "./pages/customer/CustomerPayment.jsx";

import PaymentFail from "./pages/customer/PaymentFail.jsx";
import CustomerFeedback from "./pages/customer/CustomerFeedback.jsx";
import PaymentResult from "./pages/customer/PaymentResult.jsx";
import CustomerAddress from "./pages/customer/CustomerAddress.jsx";
import CustomerWallet from "./pages/customer/CustomerWallet.jsx";
import CustomerSupport from "./pages/customer/CustomerSupport.jsx";
import CustomerInvoice from "./pages/customer/CustomerInvoice.jsx";

import PrivacyPolicy from "./pages/policy/PrivacyPolicy.jsx";
import Claims from "./pages/policy/Claims.jsx";
import Terms from "./pages/policy/Terms.jsx";
import ShippingRules from "./pages/policy/ShippingRules.jsx";
import ComingSoon from "./pages/service/ComingSoon.jsx";
import RoadFreight from "./pages/service/RoadFreight.jsx";
import Warehouse from "./pages/service/Warehourse.jsx";
import ExpressDelivery from "./pages/service/ExpressDelivery.jsx";
import PriceList from "./pages/service/PriceList.jsx";

import { ChatProvider } from "./context/ChatContext";
import ChatLayout from "./components/ChatLayout.jsx";

const PublicLayout = () => (
  <>
    <Navbar />
    <main className="flex-1">
      <Outlet />
    </main>
    <Footer />
  </>
);

export default function App() {
  const location = useLocation();
  const hiddenPaths = ["/admin", "/dispatcher", "/driver"];
  const shouldShowChat = !hiddenPaths.some((path) =>
    location.pathname.startsWith(path),
  );

  return (
    <ChatProvider>
      <div className="bg-gray-50 text-gray-800 min-h-screen flex flex-col relative font-sans">
        <ScrollToTop />
        <Routes>
          {}
          <Route element={<PublicLayout />}>
            <Route path="/" element={<Home />} />
            <Route path="/tracking" element={<Tracking />} />
            <Route path="/about" element={<About />} />
            <Route path="/services" element={<Services />} />
            <Route path="/services/air" element={<ComingSoon />} />
            <Route path="/services/road" element={<RoadFreight />} />
            <Route path="/services/warehouse" element={<Warehouse />} />
            <Route path="/services/express" element={<ExpressDelivery />} />
            <Route path="/services/price-list" element={<PriceList />} />
            <Route path="/contact" element={<Contact />} />
            <Route path="/login" element={<Login />} />
            <Route path="/register" element={<Register />} />
            <Route path="/apply-driver" element={<ApplyDriver />} />
            <Route path="/news/:id" element={<NewsDetail />} />

            {}
            <Route path="/policy/privacy" element={<PrivacyPolicy />} />
            <Route path="/policy/claims" element={<Claims />} />
            <Route path="/policy/terms" element={<Terms />} />
            <Route path="/policy/shipping-rules" element={<ShippingRules />} />
          </Route>

          {}
          <Route path="/logout" element={<Logout />} />
          <Route path="/unauthorized" element={<Unauthorized />} />
          <Route path="/forgot-password" element={<ForgotPassword />} />

          {}
          <Route
            path="/admin"
            element={
              <ProtectedRoute allowedRoles={["admin"]}>
                <AdminLayout />
              </ProtectedRoute>
            }
          >
            <Route index element={<AdminDashboard />} />
            <Route path="shipments" element={<AdminShipments />} />
            <Route path="shipments/:id" element={<AdminShipmentDetail />} />
            <Route path="drivers" element={<AdminDrivers />} />
            <Route path="customers" element={<AdminCustomers />} />
            <Route path="payments" element={<AdminPayments />} />
            <Route path="users" element={<AdminUsers />} />
            <Route path="feedbacks" element={<AdminFeedbacks />} />
            <Route path="contact" element={<AdminContacts />} />
            <Route path="news" element={<AdminNews />} />
          </Route>

          {}
          <Route
            path="/dispatcher"
            element={
              <ProtectedRoute allowedRoles={["dispatcher", "admin"]}>
                <DispatcherLayout />
              </ProtectedRoute>
            }
          >
            <Route index element={<DispatcherDashboard />} />
            <Route path="assignments" element={<DispatcherAssignments />} />
            <Route path="tracking" element={<DispatcherTracking />} />
            <Route path="tracking/:id" element={<DispatcherTrackingDetail />} />
            <Route path="chat" element={<DispatcherChat />} />
            <Route path="contacts" element={<DispatcherContacts />} />
            <Route path="failed-orders" element={<FailedShipmentsPanel />} />
          </Route>

          {}
          <Route
            path="/driver/:id"
            element={
              <ProtectedRoute allowedRoles={["driver", "admin"]}>
                <DriverLayout />
              </ProtectedRoute>
            }
          >
            <Route index element={<DriverDashboard />} />
            <Route path="assignments" element={<DriverAssignments />} />
            <Route path="history" element={<DriverHistory />} />
            <Route path="profile" element={<DriverProfile />} />
            <Route
              path="shipments/:shipmentId"
              element={<DriverShipmentDetail />}
            />
          </Route>

          {}
          <Route
            path="/customer"
            element={
              <ProtectedRoute allowedRoles={["customer", "admin"]}>
                <CustomerLayout />
              </ProtectedRoute>
            }
          >
            <Route index element={<CustomerDashboard />} />

            {}
            <Route path="create-order" element={<CustomerCreateShipment />} />
            <Route path="track" element={<CustomerTrack />} />
            <Route path="history" element={<CustomerHistory />} />
            <Route path="profile" element={<CustomerProfile />} />
            <Route path="history/:id" element={<CustomerShipmentDetail />} />

            {}
            <Route path="payment" element={<CustomerPayment />} />
            <Route path="payment-success" element={<PaymentResult />} />
            <Route path="payment-fail" element={<PaymentFail />} />

            <Route path="feedback" element={<CustomerFeedback />} />
            <Route path="addresses" element={<CustomerAddress />} />
            <Route path="wallet" element={<CustomerWallet />} />
            <Route path="support" element={<CustomerSupport />} />
            <Route path="invoices" element={<CustomerInvoice />} />
          </Route>

          {}
          <Route
            path="*"
            element={
              <div className="flex items-center justify-center min-h-screen bg-gray-100">
                <div className="text-center">
                  <h1 className="text-9xl font-bold text-gray-800">404</h1>
                  <p className="text-2xl font-light text-gray-600 mt-4">
                    Oops! Trang bạn tìm kiếm không tồn tại.
                  </p>
                  <a
                    href="/"
                    className="mt-6 inline-block bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700 transition"
                  >
                    Về trang chủ
                  </a>
                </div>
              </div>
            }
          />
        </Routes>
      </div>

      {}
      {shouldShowChat && <ChatLayout />}
    </ChatProvider>
  );
}
