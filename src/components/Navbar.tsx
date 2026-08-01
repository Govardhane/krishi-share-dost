import { Link, useLocation, useNavigate } from "react-router-dom";
import { Menu, X, LogOut, User as UserIcon } from "lucide-react";
import { useState } from "react";
import { useAuth } from "@/hooks/useAuth";
import { toast } from "sonner";
import logo from "@/assets/agrishare-logo.png";
import { useLang } from "@/lib/i18n";
import TopBar from "@/components/TopBar";

const Navbar = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const [mobileOpen, setMobileOpen] = useState(false);
  const { user, signOut } = useAuth();
  const { t } = useLang();

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

  return (
    <header className="sticky top-0 z-50 shadow-card">
      <TopBar />

      {/* Identity strip */}
      <div className="bg-background">
        <div className="container mx-auto flex items-center gap-4 px-4 py-3">
          <Link to="/" className="flex items-center gap-3">
            <img src={logo} alt="AI- Agrishare logo" className="h-14 w-14 object-contain" />
            <span className="leading-tight">
              <span className="block font-display text-2xl font-bold tracking-tight text-foreground">
                AI- <span className="text-secondary">Agrishare</span>
              </span>
              <span className="hidden text-xs font-medium uppercase tracking-widest text-muted-foreground sm:block">
                {t("brand.sub")}
              </span>
            </span>
          </Link>

          <button
            type="button"
            className="ml-auto rounded-md p-2 text-foreground md:hidden"
            onClick={() => setMobileOpen(!mobileOpen)}
            aria-label="Menu"
          >
            {mobileOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
          </button>
        </div>
      </div>

      {/* Nav band */}
      <nav className="hidden bg-band-strong text-band-foreground md:block">
        <div className="container mx-auto flex items-stretch px-4">
          {links.map((link) => (
            <Link
              key={link.to}
              to={link.to}
              className={`px-5 py-4 text-sm font-semibold transition ${
                location.pathname === link.to
                  ? "bg-band-foreground/15"
                  : "hover:bg-band-foreground/10"
              }`}
            >
              {link.label}
            </Link>
          ))}

          <div className="ml-auto flex items-center gap-2 py-2">
            {user ? (
              <>
                <Link
                  to="/profile"
                  className="flex items-center gap-1.5 rounded-md border border-band-foreground/40 px-4 py-2 text-sm font-semibold transition hover:bg-band-foreground/10"
                >
                  <UserIcon className="h-4 w-4" /> {t("nav.profile")}
                </Link>
                <button
                  type="button"
                  onClick={handleSignOut}
                  className="flex items-center gap-1.5 rounded-md bg-secondary px-4 py-2 text-sm font-semibold text-secondary-foreground transition hover:opacity-90"
                >
                  <LogOut className="h-4 w-4" /> {t("nav.logout")}
                </button>
              </>
            ) : (
              <Link
                to="/auth"
                className="rounded-md bg-secondary px-5 py-2 text-sm font-bold text-secondary-foreground transition hover:opacity-90"
              >
                {t("nav.login")}
              </Link>
            )}
          </div>
        </div>
      </nav>

      {/* Mobile menu */}
      {mobileOpen && (
        <div className="bg-band-strong p-3 text-band-foreground md:hidden">
          {links.map((link) => (
            <Link
              key={link.to}
              to={link.to}
              onClick={() => setMobileOpen(false)}
              className="block rounded-md px-3 py-2.5 text-sm font-semibold hover:bg-band-foreground/10"
            >
              {link.label}
            </Link>
          ))}
          {user ? (
            <>
              <Link
                to="/profile"
                onClick={() => setMobileOpen(false)}
                className="block rounded-md px-3 py-2.5 text-sm font-semibold hover:bg-band-foreground/10"
              >
                {t("nav.profile")}
              </Link>
              <button
                type="button"
                onClick={handleSignOut}
                className="mt-1 block w-full rounded-md bg-secondary px-3 py-2.5 text-left text-sm font-semibold text-secondary-foreground"
              >
                {t("nav.logout")}
              </button>
            </>
          ) : (
            <Link
              to="/auth"
              onClick={() => setMobileOpen(false)}
              className="mt-1 block rounded-md bg-secondary px-3 py-2.5 text-sm font-bold text-secondary-foreground"
            >
              {t("nav.login")}
            </Link>
          )}
        </div>
      )}
    </header>
  );
};

export default Navbar;
