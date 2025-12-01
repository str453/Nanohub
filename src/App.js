import './App.css';
import { Navbar } from './Components/Navbar/Navbar';
import { BrowserRouter,Routes,Route, useLocation } from 'react-router-dom';
import { AuthProvider } from './Context/AuthContext';
import Shop from './Pages/Shop'
import ShopCategory from './Pages/ShopCategory'
import PCPartsMain from './Pages/PCPartsMain'
import Product from './Pages/Product'
import Cart from './Pages/Cart'
import Checkout from './Pages/Checkout'
import OrderSuccess from './Pages/OrderSuccess'
import OrderHistory from './Pages/OrderHistory'
import ChatWidget from './Components/ChatBot/ChatBot';
import LoginSignUp from './Pages/LoginSignUp'
import Footer from './Components/Footer/Footer'
import pc_part_banner from './Components/Assets/banner_mens.png'
import computer_banner from './Components/Assets/banner_kids.png'

function AppContent() {
  const location = useLocation();
  const hideFooter = location.pathname === '/login';

  return (
    <>
      <Navbar/>
      <Routes>
        <Route path='/' element={<Shop/>}/>
        
        {/* Main PC Parts page - shows top 5 from each category */}
        <Route path='/PC-Parts' element={<PCPartsMain/>}/>
        
        {/* Sub-category pages for each PC part type */}
        <Route path='/PC-Parts/CPU' element={<ShopCategory banner={pc_part_banner} category="CPU"/>}/>
        <Route path='/PC-Parts/GPU' element={<ShopCategory banner={pc_part_banner} category="GPU"/>}/>
        <Route path='/PC-Parts/Monitor' element={<ShopCategory banner={pc_part_banner} category="Monitor"/>}/>
        <Route path='/PC-Parts/Motherboard' element={<ShopCategory banner={pc_part_banner} category="Motherboard"/>}/>
        <Route path='/PC-Parts/Case' element={<ShopCategory banner={pc_part_banner} category="Case"/>}/>
        <Route path='/PC-Parts/Cooling' element={<ShopCategory banner={pc_part_banner} category="Cooling"/>}/>
        <Route path='/PC-Parts/Storage' element={<ShopCategory banner={pc_part_banner} category="Storage"/>}/>
        
         {/* Direct routes for navbar */}
        <Route path='/CPU' element={<ShopCategory banner={pc_part_banner} category="CPU"/>}/>
        <Route path='/GPU' element={<ShopCategory banner={pc_part_banner} category="GPU"/>}/>
        <Route path='/Monitor' element={<ShopCategory banner={pc_part_banner} category="Monitor"/>}/>
        <Route path='/Motherboard' element={<ShopCategory banner={pc_part_banner} category="Motherboard"/>}/>
        <Route path='/Computers' element={<ShopCategory banner={computer_banner} category="computer"/>}/>
        <Route path="product" element={<Product/>}>
          <Route path=':productId' element={<Product/>}/>
        </Route>
        <Route path='/cart' element={<Cart/>}/>
        <Route path='/checkout' element={<Checkout/>}/>
        <Route path='/order-success' element={<OrderSuccess/>}/>
        <Route path='/orders' element={<OrderHistory/>}/>
        <Route path='/login' element={<LoginSignUp/>}/>
      </Routes>
      <ChatWidget/>
      {!hideFooter && <Footer/>}
    </>
  );
}

function App() {
  return (
    <div>
      <BrowserRouter>
      <AuthProvider>
        <AppContent/>
      </AuthProvider>
      </BrowserRouter>
    </div>
  );
}

export default App;
