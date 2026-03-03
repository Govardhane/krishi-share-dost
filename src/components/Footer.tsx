import { Tractor } from "lucide-react";

const Footer = () => {
  return (
    <footer className="border-t bg-muted py-12">
      <div className="container mx-auto px-4">
        <div className="flex flex-col items-center gap-4 text-center">
          <div className="flex items-center gap-2">
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary">
              <Tractor className="h-4 w-4 text-primary-foreground" />
            </div>
            <span className="font-display text-lg font-bold">FarmRent</span>
          </div>
          <p className="max-w-md text-sm text-muted-foreground">
            Empowering Indian farmers through shared agricultural equipment.
            Reducing costs, increasing productivity.
          </p>
          <p className="text-xs text-muted-foreground">
            © 2026 FarmRent. Built for India's farming community.
          </p>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
