import { createContext, useContext, useEffect, useState, ReactNode } from "react";

export type Lang = "en" | "mr";

type Dict = Record<string, { en: string; mr: string }>;

export const dict: Dict = {
  // Nav
  "nav.home": { en: "Home", mr: "मुख्यपृष्ठ" },
  "nav.browse": { en: "Browse Equipment", mr: "अवजारे शोधा" },
  "nav.list": { en: "List Your Equipment", mr: "तुमचे अवजार नोंदवा" },
  "nav.profile": { en: "Profile", mr: "प्रोफाइल" },
  "nav.logout": { en: "Logout", mr: "बाहेर पडा" },
  "nav.login": { en: "Login / Sign Up", mr: "लॉगिन / नोंदणी" },

  // Hero
  "hero.badge": { en: "India's AI-Powered Agricultural Platform", mr: "भारताचे एआय-आधारित शेती व्यासपीठ" },
  "hero.tagline": {
    en: "Smart Farming Platform with AI Chatbot, Weather Prediction, Equipment Rental, and Livestock Management",
    mr: "एआय चॅटबॉट, हवामान अंदाज, अवजार भाडे आणि पशुधन व्यवस्थापन असलेले स्मार्ट शेती व्यासपीठ",
  },
  "hero.title1": { en: "Rent Farm Equipment.", mr: "शेती अवजारे भाड्याने घ्या." },
  "hero.title2": { en: "Save Costs.", mr: "खर्च वाचवा." },
  "hero.title3": { en: "Grow More.", mr: "अधिक पिकवा." },
  "hero.sub": {
    en: "Connect with nearby equipment owners in your village or district. Affordable tractor, harvester & rotavator rentals — just like booking a ride.",
    mr: "तुमच्या गावातील किंवा जिल्ह्यातील अवजार मालकांशी थेट संपर्क साधा. ट्रॅक्टर, हार्वेस्टर आणि रोटाव्हेटर परवडणाऱ्या दरात — राइड बुक केल्यासारखे सोपे.",
  },
  "hero.cta1": { en: "Find Equipment", mr: "अवजारे शोधा" },
  "hero.cta2": { en: "List Your Equipment", mr: "तुमचे अवजार नोंदवा" },
  "hero.stat1": { en: "Equipment Listed", mr: "नोंदवलेली अवजारे" },
  "hero.stat2": { en: "Villages Connected", mr: "जोडलेली गावे" },
  "hero.stat3": { en: "Farmers Helped", mr: "मदत केलेले शेतकरी" },

  // How it works
  "how.title": { en: "How It Works", mr: "हे कसे चालते" },
  "how.sub": { en: "Renting farm equipment is as easy as booking a ride", mr: "शेती अवजार भाड्याने घेणे राइड बुक करण्याइतके सोपे" },
  "how.s1.t": { en: "Search Equipment", mr: "अवजार शोधा" },
  "how.s1.d": { en: "Browse tractors, harvesters, and more by your village or district.", mr: "तुमच्या गाव किंवा जिल्ह्यानुसार ट्रॅक्टर, हार्वेस्टर आणि इतर अवजारे पहा." },
  "how.s2.t": { en: "Contact Owner", mr: "मालकाशी संपर्क" },
  "how.s2.d": { en: "Reach the equipment owner directly via WhatsApp for quick booking.", mr: "व्हॉट्सअ‍ॅपवर थेट मालकाशी बोलून लगेच बुकिंग करा." },
  "how.s3.t": { en: "Rent & Farm", mr: "भाड्याने घ्या आणि शेती करा" },
  "how.s3.d": { en: "Get the equipment delivered and start farming efficiently.", mr: "अवजार तुमच्या शेतात मिळवा आणि कार्यक्षम शेती सुरू करा." },

  // Platform / upcoming
  "plat.badge": { en: "One integrated platform", mr: "एकात्मिक व्यासपीठ" },
  "plat.title": { en: "One integrated platform for smarter farming", mr: "स्मार्ट शेतीसाठी एकच एकात्मिक व्यासपीठ" },
  "plat.sub": {
    en: "AI- Agrishare brings advisory, weather intelligence, equipment access and livestock health into one easy platform. Equipment rental is live today — more modules are coming.",
    mr: "AI- Agrishare सल्ला, हवामान माहिती, अवजार उपलब्धता आणि पशुधन आरोग्य एकाच सोप्या व्यासपीठावर आणते. सध्या अवजार भाडे सुरू आहे — इतर सुविधा लवकरच.",
  },
  "plat.live": { en: "Live Now", mr: "सध्या उपलब्ध" },
  "plat.soon": { en: "Coming Soon", mr: "लवकरच" },
  "plat.f1.t": { en: "AI Chatbot (Kisan Assistant)", mr: "एआय चॅटबॉट (किसान सहाय्यक)" },
  "plat.f1.d": { en: "24x7 farming assistant in Marathi and English for crop, pest and scheme questions.", mr: "पीक, कीड आणि योजनांच्या प्रश्नांसाठी मराठी व इंग्रजीत २४x७ शेती सहाय्यक." },
  "plat.f2.t": { en: "Weather Prediction", mr: "हवामान अंदाज" },
  "plat.f2.d": { en: "Accurate rainfall, temperature and spraying-window alerts for your taluka.", mr: "तुमच्या तालुक्यासाठी अचूक पाऊस, तापमान आणि फवारणी वेळेचे अलर्ट." },
  "plat.f3.t": { en: "Equipment Rental", mr: "अवजार भाडे" },
  "plat.f3.d": { en: "Book tractors, harvesters and implements from verified owners near you.", mr: "जवळच्या खात्रीशीर मालकांकडून ट्रॅक्टर, हार्वेस्टर व अवजारे बुक करा." },
  "plat.f4.t": { en: "Livestock Management", mr: "पशुधन व्यवस्थापन" },
  "plat.f4.d": { en: "Track animal health, vaccination and biosecurity for your dairy or goat farm.", mr: "दुग्ध किंवा शेळी पालनासाठी जनावरांचे आरोग्य, लसीकरण व सुरक्षा नोंदी." },
  "plat.f5.t": { en: "Farming News & Schemes", mr: "शेती बातम्या व योजना" },
  "plat.f5.d": { en: "Real-time mandi rates, government schemes and agri news updates.", mr: "बाजारभाव, शासकीय योजना आणि शेती बातम्यांचे थेट अपडेट." },
  "plat.f6.t": { en: "Farm Labor & Inputs", mr: "मजूर व शेती साहित्य" },
  "plat.f6.d": { en: "Hire workers and buy verified seeds and fertilizers from local suppliers.", mr: "मजूर मिळवा आणि स्थानिक पुरवठादारांकडून खात्रीशीर बियाणे व खते घ्या." },

  // Footer
  "footer.desc": {
    en: "Empowering Indian farmers with AI — advisory, weather, equipment sharing and livestock care in one place.",
    mr: "एआयच्या मदतीने भारतीय शेतकऱ्यांना सक्षम करत आहोत — सल्ला, हवामान, अवजार शेअरिंग आणि पशुधन काळजी एकाच ठिकाणी.",
  },
  "footer.copy": { en: "© 2026 AI- Agrishare. Built for India's farming community.", mr: "© २०२६ AI- Agrishare. भारतीय शेतकरी समुदायासाठी." },

  // Payment
  "pay.title": { en: "Payment", mr: "पेमेंट" },
  "pay.openApp": { en: "Pay with UPI app", mr: "यूपीआय अ‍ॅपने पैसे द्या" },
  "pay.choose": { en: "Choose your UPI app — it will open directly on your phone", mr: "तुमचे यूपीआय अ‍ॅप निवडा — ते थेट तुमच्या फोनवर उघडेल" },
  "pay.afterPay": { en: "After paying, paste the UPI transaction ID below", mr: "पैसे दिल्यानंतर खाली यूपीआय ट्रान्झॅक्शन आयडी टाका" },
  "pay.noUpi": { en: "Owner has not added a UPI ID. Please use Advance Cash or ask on WhatsApp.", mr: "मालकाने यूपीआय आयडी दिलेला नाही. कृपया आगाऊ रोख वापरा किंवा व्हॉट्सअ‍ॅपवर विचारा." },
  "pay.desktopHint": { en: "On desktop? Scan the QR from your phone's UPI app.", mr: "डेस्कटॉपवर आहात? फोनच्या यूपीआय अ‍ॅपने QR स्कॅन करा." },
};

interface Ctx {
  lang: Lang;
  setLang: (l: Lang) => void;
  t: (key: keyof typeof dict | string) => string;
}

const LanguageContext = createContext<Ctx>({ lang: "en", setLang: () => {}, t: (k) => String(k) });

export const LanguageProvider = ({ children }: { children: ReactNode }) => {
  const [lang, setLangState] = useState<Lang>(() => (localStorage.getItem("lang") as Lang) || "en");

  useEffect(() => {
    localStorage.setItem("lang", lang);
    document.documentElement.lang = lang;
  }, [lang]);

  const t = (key: string) => dict[key]?.[lang] ?? key;

  return (
    <LanguageContext.Provider value={{ lang, setLang: setLangState, t }}>
      {children}
    </LanguageContext.Provider>
  );
};

export const useLang = () => useContext(LanguageContext);
