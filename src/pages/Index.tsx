import Navbar from "@/components/Navbar";
import HeroSection from "@/components/HeroSection";
import HowItWorks from "@/components/HowItWorks";
import PlatformFeatures from "@/components/PlatformFeatures";
import Footer from "@/components/Footer";

const Index = () => {
  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <main>
        <HeroSection />
        <HowItWorks />
        <PlatformFeatures />
      </main>
      <Footer />
    </div>
  );
};

export default Index;
