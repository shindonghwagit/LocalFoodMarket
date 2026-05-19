import { Link } from 'react-router-dom';
import logo from '../../assets/logo.png';

export default function Navbar() {
  return (
    <header className="bg-background sticky top-0 z-50 shadow-sm">
      <nav className="flex justify-between items-center px-gutter py-sm max-w-max-width mx-auto w-full">
        {/* 로고 */}
        <Link to="/" className="flex items-center gap-md">
          <img src={logo} alt="Farmer's Market 로고" className="h-10 w-auto" />
          <span className="font-headline-md text-headline-md font-bold text-primary">
            Farmer's Market
          </span>
        </Link>

        {/* 메뉴 */}
        <div className="hidden md:flex items-center gap-lg">
          <Link to="/products" className="font-body-md text-primary font-bold border-b-2 border-primary hover:text-primary transition-colors duration-200">
            Shop
          </Link>
          <Link to="/farms" className="font-body-md text-on-surface-variant hover:text-primary transition-colors duration-200">
            Farmers
          </Link>
          <Link to="/posts" className="font-body-md text-on-surface-variant hover:text-primary transition-colors duration-200">
            Recipes
          </Link>
        </div>

        {/* 액션 버튼 */}
        <div className="flex items-center gap-sm">
          <button className="p-xs text-on-surface-variant hover:text-primary transition-colors">
            <span className="material-symbols-outlined">search</span>
          </button>
          <button className="p-xs text-on-surface-variant hover:text-primary transition-colors">
            <span className="material-symbols-outlined">shopping_basket</span>
          </button>
          <Link
            to="/login"
            className="bg-primary text-on-primary px-gutter py-xs rounded-lg font-label-md text-label-md hover:bg-primary-container transition-colors"
          >
            로그인
          </Link>
        </div>
      </nav>
    </header>
  );
}
