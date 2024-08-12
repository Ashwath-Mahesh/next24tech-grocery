import './App.css';
import CartPage from './customer/components/Cart/Cart';
import Navigation from './customer/components/Navigation/Navigation';
import ProductSection from './customer/components/ProductsCard';
import HomePage from './customer/pages/HomePage/HomePage';
import { BrowserRouter as Router, Route, Switch, Routes } from 'react-router-dom';
function App() {
  return (
    <Router>
      <div className="App">
        <Navigation />
     <Routes>
          <Route path="/cart" element={<CartPage></CartPage>}>
           
          </Route>
          <Route path="/" element={<HomePage></HomePage>}>
           
          </Route>
          </Routes>
      </div>
    </Router>
  );
}

export default App;
