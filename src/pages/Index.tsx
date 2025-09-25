import { useEffect } from "react";
import Header from "@/components/layout/Header";
import Footer from "@/components/layout/Footer";
import Hero from "@/components/sections/Hero";
import ExpertiseAreas from "@/components/sections/ExpertiseAreas";
import About from "@/components/sections/About";
import Portfolio from "@/components/sections/Portfolio";
import Newsletter from "@/components/sections/Newsletter";
import BookingSystem from "@/components/sections/BookingSystem";
import ContactForm from "@/components/ContactForm";
import PremiumChat from "@/components/PremiumChat";
import { useAnalytics } from "@/hooks/useAnalytics";
import { useAuth } from "@/contexts/AuthContext";

const Index = () => {
  const { user } = useAuth();
  const { trackEvent } = useAnalytics(user);

  useEffect(() => {
    trackEvent('page_view', { page: 'home' });
  }, [trackEvent]);

  return (
    <div className="min-h-screen bg-background">
      <Header />
      <main>
        <Hero />
        <ExpertiseAreas />
        <About />
        <Portfolio />
        <Newsletter />
        <BookingSystem />
        <ContactForm />
      </main>
      <Footer />
      <PremiumChat user={user} />
    </div>
  );
};

export default Index;
