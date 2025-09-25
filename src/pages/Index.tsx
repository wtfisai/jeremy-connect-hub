import Header from "@/components/layout/Header";
import Hero from "@/components/sections/Hero";
import ExpertiseAreas from "@/components/sections/ExpertiseAreas";
import About from "@/components/sections/About";
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
        <Newsletter />
        <BookingSystem />
      </main>
    </div>
  );
};

export default Index;
