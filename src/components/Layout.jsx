import Navbar from './Navbar';
import Footer from './Footer';

function Layout({ children }) {
  return (
    <>
      <Navbar />

      <div className='main-container contenterHead'>
        {children}
      </div>

      <Footer />
    </>
  );
}

export default Layout;