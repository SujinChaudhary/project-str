import Header from "@/app/components/customer/layout/Header";

const CustomerLayout = ({ children }) => {
  return (
    <>
      <Header />
      <main className="min-h-screen">{children}</main>
      {/* Footer slots in here once it's built */}
    </>
  );
};

export default CustomerLayout;
