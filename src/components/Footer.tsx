import logo from "@/assets/agrishare-logo.png";

const Footer = () => {
  return (
    <footer className="border-t bg-muted py-12">
      <div className="container mx-auto px-4">
        <div className="flex flex-col items-center gap-4 text-center">
          <div className="flex items-center gap-3">
            <img src={logo} alt="AI- Agrishare logo" className="h-14 w-14 object-contain drop-shadow-sm" />
            <span className="font-display text-2xl font-bold">AI- <span className="text-secondary">Agrishare</span></span>
          </div>
          <p className="max-w-md text-sm text-muted-foreground">
            Empowering Indian farmers through AI-powered shared agricultural equipment.
            Reducing costs, increasing productivity.
          </p>
          <p className="text-xs text-muted-foreground">
            © 2026 AI- Agrishare. Built for India's farming community.
          </p>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
