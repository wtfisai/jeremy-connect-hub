import Header from "@/components/layout/Header";
import Footer from "@/components/layout/Footer";
import Hero from "@/components/sections/Hero";
import ExpertiseAreas from "@/components/sections/ExpertiseAreas";
import About from "@/components/sections/About";
import Portfolio from "@/components/sections/Portfolio";
import Newsletter from "@/components/sections/Newsletter";
import BookingSystem from "@/components/sections/BookingSystem";

const Index = () => {
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
      </main>
      <Footer />
    </div>
  );
};

export default Index;
