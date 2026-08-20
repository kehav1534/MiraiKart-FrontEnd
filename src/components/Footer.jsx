export default function Footer() {
  return (
    <footer className="bg-surface-container-high mt-auto">
      <div className="w-full px-6 md:px-8 py-10 grid grid-cols-1 md:grid-cols-4 gap-8 max-w-7xl mx-auto">
        <div>
          <div className="flex items-center gap-2 mb-3">
            <span className="material-symbols-outlined text-primary text-2xl">shopping_bag</span>
            <span className="text-headline-md font-bold text-on-surface">LUXE</span>
          </div>
          <p className="text-label-sm text-secondary leading-relaxed">
            Premium shopping experience for the modern individual.
          </p>
        </div>
        <div className="flex flex-col gap-3">
          <span className="text-caption-bold text-slate-400 uppercase tracking-widest">Company</span>
          <a className="text-label-sm text-secondary hover:text-primary transition-colors" href="#">About Us</a>
          <a className="text-label-sm text-secondary hover:text-primary transition-colors" href="#">Terms of Service</a>
        </div>
        <div className="flex flex-col gap-3">
          <span className="text-caption-bold text-slate-400 uppercase tracking-widest">Support</span>
          <a className="text-label-sm text-secondary hover:text-primary transition-colors" href="#">Shipping</a>
          <a className="text-label-sm text-secondary hover:text-primary transition-colors" href="#">Privacy Policy</a>
        </div>
        <div className="flex flex-col gap-3">
          <span className="text-caption-bold text-slate-400 uppercase tracking-widest">Trust</span>
          <div className="flex gap-4 opacity-60">
            <span className="material-symbols-outlined">verified_user</span>
            <span className="material-symbols-outlined">lock</span>
            <span className="material-symbols-outlined">privacy_tip</span>
          </div>
        </div>
      </div>
      <div className="max-w-7xl mx-auto px-6 md:px-8 py-6 border-t border-slate-200 text-center">
        <p className="text-label-sm text-secondary">© 2026 LUXE Premium Retail. All rights reserved.</p>
      </div>
    </footer>
  );
}
