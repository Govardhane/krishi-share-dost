import { useState, useEffect } from "react";
import { useNavigate, useLocation, Link } from "react-router-dom";
import { z } from "zod";
import { useAuth } from "@/hooks/useAuth";
import { useLang } from "@/lib/i18n";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Loader2 } from "lucide-react";
import { toast } from "sonner";

const Auth = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { user, loading, signIn, signUp } = useAuth();
  const { t } = useLang();
  const [busy, setBusy] = useState(false);

  const emailSchema = z.string().trim().email(t("auth.err.invalidEmail")).max(255);
  const passwordSchema = z.string().min(6, t("auth.err.passwordLen")).max(72);
  const nameSchema = z.string().trim().min(2, t("auth.err.nameRequired")).max(100);
  const phoneSchema = z.string().trim().min(10, t("auth.err.phoneRequired")).max(15);

  const from = (location.state as { from?: string })?.from || "/";

  useEffect(() => {
    if (!loading && user) navigate(from, { replace: true });
  }, [user, loading, navigate, from]);

  const handleLogin = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const form = new FormData(e.currentTarget);
    try {
      const email = emailSchema.parse(form.get("email"));
      const password = passwordSchema.parse(form.get("password"));
      setBusy(true);
      await signIn(email, password);
      toast.success(t("auth.welcomeBack"));
    } catch (err: any) {
      toast.error(err.message || t("auth.loginFailed"));
    } finally {
      setBusy(false);
    }
  };

  const handleSignup = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const form = new FormData(e.currentTarget);
    try {
      const full_name = nameSchema.parse(form.get("full_name"));
      const whatsapp = phoneSchema.parse(form.get("whatsapp"));
      const email = emailSchema.parse(form.get("email"));
      const password = passwordSchema.parse(form.get("password"));
      setBusy(true);
      await signUp({ email, password, full_name, whatsapp });
      toast.success(t("auth.accountCreated"));
    } catch (err: any) {
      toast.error(err.message || t("auth.signupFailed"));
    } finally {
      setBusy(false);
    }
  };

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <div className="container mx-auto flex min-h-[70vh] items-center justify-center px-4 py-10">
        <div className="w-full max-w-md">
          <h1 className="mb-6 text-center font-display text-3xl font-bold text-foreground">
            {t("auth.welcome")}
          </h1>
          <Tabs defaultValue="login">
            <TabsList className="grid w-full grid-cols-2">
              <TabsTrigger value="login">{t("auth.login")}</TabsTrigger>
              <TabsTrigger value="signup">{t("auth.signup")}</TabsTrigger>
            </TabsList>

            <TabsContent value="login">
              <form onSubmit={handleLogin} className="mt-6 space-y-4 rounded-lg border bg-card p-6">
                <div className="space-y-2">
                  <Label htmlFor="login-email">{t("auth.email")}</Label>
                  <Input id="login-email" name="email" type="email" required />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="login-password">{t("auth.password")}</Label>
                  <Input id="login-password" name="password" type="password" required />
                </div>
                <Button type="submit" className="w-full" disabled={busy}>
                  {busy && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                  {t("auth.login")}
                </Button>
              </form>
            </TabsContent>

            <TabsContent value="signup">
              <form onSubmit={handleSignup} className="mt-6 space-y-4 rounded-lg border bg-card p-6">
                <div className="space-y-2">
                  <Label htmlFor="su-name">{t("auth.fullName")}</Label>
                  <Input id="su-name" name="full_name" required />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="su-phone">{t("auth.whatsappNumber")}</Label>
                  <Input id="su-phone" name="whatsapp" placeholder={t("auth.phonePlaceholder")} required />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="su-email">{t("auth.email")}</Label>
                  <Input id="su-email" name="email" type="email" required />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="su-password">{t("auth.passwordMin")}</Label>
                  <Input id="su-password" name="password" type="password" required />
                </div>
                <Button type="submit" className="w-full" disabled={busy}>
                  {busy && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                  {t("auth.createAccount")}
                </Button>
                <p className="text-center text-sm text-muted-foreground">
                  {t("auth.afterSignup1")} <Link to="/profile" className="text-primary underline">{t("auth.afterSignup2")}</Link>{t("auth.afterSignupSuffix")}
                </p>
              </form>
            </TabsContent>
          </Tabs>
        </div>
      </div>
      <Footer />
    </div>
  );
};

export default Auth;
