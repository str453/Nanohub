import './App.css';
import { Navbar } from './Components/Navbar/Navbar';
import { BrowserRouter,Routes,Route } from 'react-router-dom';
import { AuthProvider } from './Context/AuthContext';
import Shop from './Pages/Shop'
import ShopCategory from './Pages/ShopCategory'
import Product from './Pages/Product'
import Cart from './Pages/Cart'
import LoginSignUp from './Pages/LoginSignUp'
import Footer from './Components/Footer/Footer'
import pc_part_banner from './Components/Assets/banner_mens.png'
import apple_banner from './Components/Assets/banner_women.png'
import computer_banner from './Components/Assets/banner_kids.png'

function App() {
  return (
    <div>
      <BrowserRouter>
      <AuthProvider>
      <Navbar/>
      <Routes>
        <Route path='/' element={<Shop/>}/>
        <Route path='/PC-Parts' element={<ShopCategory banner={pc_part_banner} category="pc-part"/>}/>
        <Route path='/Apple' element={<ShopCategory banner={apple_banner} category="apple"/>}/>
        <Route path='/Computers' element={<ShopCategory banner={computer_banner} category="computer"/>}/>
        <Route path="product" element={<Product/>}>
          <Route path=':productId' element={<Product/>}/>
        </Route>
        <Route path='/cart' element={<Cart/>}/>
        <Route path='/login' element={<LoginSignUp/>}/>
      </Routes>
      <Footer/>
      </AuthProvider>
      </BrowserRouter>
    </div>
  );
}

export default App;
