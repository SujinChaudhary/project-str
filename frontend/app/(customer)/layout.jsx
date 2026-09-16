import Header from "@/app/components/customer/layout/Header";
import Footer from "../components/customer/layout/Footer";

const CustomerLayout = ({ children }) => {
  return (
    <>
      <Header />
      <main className="min-h-screen">{children}</main>
      {/* Footer slots in here once it's built */}
      <Footer />
    </>
  );
};

export default CustomerLayout;
