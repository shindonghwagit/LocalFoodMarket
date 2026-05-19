import { Link } from 'react-router-dom';
import logo from '../../assets/logo.png';

export default function Footer() {
  return (
    <footer className="bg-surface-container-highest">
      <div className="grid grid-cols-1 md:grid-cols-4 gap-md px-gutter py-xl max-w-max-width mx-auto w-full">
        {/* 브랜드 */}
        <div className="col-span-1">
          <div className="flex items-center gap-sm mb-md">
            <img src={logo} alt="Farmer's Market 로고" className="h-8 w-auto" />
            <span className="font-headline-sm text-headline-sm font-bold text-primary">
              Farmer's Market
            </span>
          </div>
          <p className="font-label-md text-label-md text-on-surface-variant">
            © 2024 Farmer's Market. 지역 농가와 소비자를 잇는 신선한 직거래 플랫폼.
          </p>
        </div>

        {/* 마켓 */}
        <div className="flex flex-col gap-sm">
          <h6 className="font-label-md text-label-md text-primary">Market</h6>
          <Link to="/about" className="font-label-md text-label-md text-on-surface-variant hover:text-secondary transition-colors">소개</Link>
          <Link to="/contact" className="font-label-md text-label-md text-on-surface-variant hover:text-secondary transition-colors">문의</Link>
        </div>

        {/* 농가 */}
        <div className="flex flex-col gap-sm">
          <h6 className="font-label-md text-label-md text-primary">Farmers</h6>
          <Link to="/register" className="font-label-md text-label-md text-on-surface-variant hover:text-secondary transition-colors">농가 등록</Link>
          <Link to="/farm/dashboard" className="font-label-md text-label-md text-on-surface-variant hover:text-secondary transition-colors">농가 포털</Link>
        </div>

        {/* 지원 */}
        <div className="flex flex-col gap-sm">
          <h6 className="font-label-md text-label-md text-primary">Support</h6>
          <Link to="/privacy" className="font-label-md text-label-md text-on-surface-variant hover:text-secondary transition-colors">개인정보처리방침</Link>
          <Link to="/terms" className="font-label-md text-label-md text-on-surface-variant hover:text-secondary transition-colors">이용약관</Link>
          <div className="flex gap-md mt-md">
            <span className="material-symbols-outlined text-primary cursor-pointer hover:text-secondary">public</span>
            <span className="material-symbols-outlined text-primary cursor-pointer hover:text-secondary">share</span>
            <span className="material-symbols-outlined text-primary cursor-pointer hover:text-secondary">mail</span>
          </div>
        </div>
      </div>
    </footer>
  );
}
