import { MessageCircle, Headphones, Languages } from "lucide-react";
import { useLang } from "@/lib/i18n";

const TopBar = () => {
  const { lang, setLang, t } = useLang();

  return (
    <div className="bg-band text-band-foreground">
      <div className="container mx-auto flex flex-wrap items-center justify-between gap-2 px-4 py-2 text-xs sm:text-sm">
        <div className="flex flex-wrap items-center gap-x-4 gap-y-1">
          <span className="flex items-center gap-1.5">
            <MessageCircle className="h-4 w-4" />
            {t("top.whatsapp")} <strong className="text-secondary">70655 14447</strong>
          </span>
          <span className="hidden opacity-40 sm:inline">|</span>
          <span className="flex items-center gap-1.5">
            <Headphones className="h-4 w-4" />
            {t("top.helpline")} <strong className="text-secondary">1800 200 1234</strong>
          </span>
        </div>

        <button
          type="button"
          onClick={() => setLang(lang === "en" ? "mr" : "en")}
          className="flex items-center gap-1.5 rounded-full border border-band-foreground/30 px-3 py-1 transition hover:bg-band-foreground/10"
        >
          <Languages className="h-4 w-4" />
          {lang === "en" ? "मराठी" : "English"}
        </button>
      </div>
    </div>
  );
};

export default TopBar;
