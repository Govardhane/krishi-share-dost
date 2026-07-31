import { Link, useLocation, useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Menu, X, LogOut, User as UserIcon, Languages } from "lucide-react";
import { useState } from "react";
import { useAuth } from "@/hooks/useAuth";
import { toast } from "sonner";
import logo from "@/assets/agrishare-logo.png";
import { useLang } from "@/lib/i18n";

const Navbar = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const [mobileOpen, setMobileOpen] = useState(false);
  const { user, signOut } = useAuth();
  const { lang, setLang, t } = useLang();

  const links = [
    { to: "/", label: t("nav.home") },
    { to: "/browse", label: t("nav.browse") },
    { to: "/list-equipment", label: t("nav.list") },
  ];

  const handleSignOut = async () => {
    await signOut();
    toast.success("Logged out");
    navigate("/");
    setMobileOpen(false);
  };

  const LangToggle = ({ full = false }: { full?: boolean }) => (
    <Button
      variant="outline"
      size="sm"
      className={full ? "w-full justify-start" : ""}
      onClick={() => setLang(lang === "en" ? "mr" : "en")}
    >
      <Languages className="mr-1 h-4 w-4" />
      {lang === "en" ? "मराठी" : "English"}
    </Button>
  );

  return (
    <nav className="sticky top-0 z-50 border-b bg-background/80 backdrop-blur-md">
      <div className="container mx-auto flex h-16 items-center justify-between px-4">
        <Link to="/" className="flex items-center gap-3">
          <img src={logo} alt="AI- Agrishare logo" className="h-14 w-14 object-contain drop-shadow-sm" />
          <span className="font-display text-2xl font-bold tracking-tight text-foreground">
            AI- <span className="text-secondary">Agrishare</span>
          </span>
        </Link>

        {/* Desktop */}
        <div className="hidden items-center gap-1 md:flex">
          {links.map((link) => (
            <Link key={link.to} to={link.to}>
              <Button variant={location.pathname === link.to ? "default" : "ghost"} size="sm">
                {link.label}
              </Button>
            </Link>
          ))}
          {user ? (
            <>
              <Link to="/profile">
                <Button variant={location.pathname === "/profile" ? "default" : "ghost"} size="sm">
                  <UserIcon className="mr-1 h-4 w-4" /> {t("nav.profile")}
                </Button>
              </Link>
              <Button variant="ghost" size="sm" onClick={handleSignOut}>
                <LogOut className="mr-1 h-4 w-4" /> {t("nav.logout")}
              </Button>
            </>
          ) : (
            <Link to="/auth">
              <Button size="sm">{t("nav.login")}</Button>
            </Link>
          )}
          <div className="ml-2">
            <LangToggle />
          </div>
        </div>

        {/* Mobile toggle */}
        <div className="flex items-center gap-2 md:hidden">
          <LangToggle />
          <Button variant="ghost" size="icon" onClick={() => setMobileOpen(!mobileOpen)}>
            {mobileOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
          </Button>
        </div>
      </div>

      {/* Mobile menu */}
      {mobileOpen && (
        <div className="border-t bg-background p-4 md:hidden">
          {links.map((link) => (
            <Link key={link.to} to={link.to} onClick={() => setMobileOpen(false)}>
              <Button
                variant={location.pathname === link.to ? "default" : "ghost"}
                className="w-full justify-start"
                size="sm"
              >
                {link.label}
              </Button>
            </Link>
          ))}
          {user ? (
            <>
              <Link to="/profile" onClick={() => setMobileOpen(false)}>
                <Button variant="ghost" className="w-full justify-start" size="sm">
                  <UserIcon className="mr-1 h-4 w-4" /> {t("nav.profile")}
                </Button>
              </Link>
              <Button variant="ghost" className="w-full justify-start" size="sm" onClick={handleSignOut}>
                <LogOut className="mr-1 h-4 w-4" /> {t("nav.logout")}
              </Button>
            </>
          ) : (
            <Link to="/auth" onClick={() => setMobileOpen(false)}>
              <Button className="w-full" size="sm">
                {t("nav.login")}
              </Button>
            </Link>
          )}
        </div>
      )}
    </nav>
  );
};

export default Navbar;
