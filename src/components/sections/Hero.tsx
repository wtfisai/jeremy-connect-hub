import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { ArrowRight, Download, Linkedin, ExternalLink } from "lucide-react";

const Hero = () => {
  return (
    <section className="relative overflow-hidden bg-background min-h-screen flex items-center pt-32 pb-48">
      {/* Background Elements */}
      <div className="absolute inset-0 -z-10">
        <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-primary/10 rounded-full blur-3xl" />
        <div className="absolute bottom-1/4 right-1/4 w-[600px] h-[600px] bg-blue-500/10 rounded-full blur-3xl" />
      </div>

      <div className="container-max section-padding w-full">
        <div className="max-w-6xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="text-left"
          >
            <h1 className="text-5xl sm:text-6xl md:text-7xl lg:text-8xl xl:text-9xl font-bold tracking-tight mb-8 leading-[0.95]">
              <span className="text-foreground">Tech solutions</span>
              <br />
              <span className="text-foreground">for </span>
              <span className="italic font-normal text-muted-foreground">everyone</span>
            </h1>
          </motion.div>

          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.1 }}
            className="text-lg sm:text-xl md:text-2xl text-muted-foreground mb-4 max-w-2xl leading-relaxed"
          >
            Pause or cancel anytime.
          </motion.p>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.2 }}
            className="flex flex-col sm:flex-row gap-4 mb-12"
          >
            <Button 
              size="lg" 
              className="group text-base sm:text-lg px-8 py-6 rounded-full w-full sm:w-auto"
              onClick={() => document.getElementById('booking')?.scrollIntoView({ behavior: 'smooth' })}
            >
              Get Started
              <ArrowRight className="ml-2 h-5 w-5 group-hover:translate-x-1 transition-transform" />
            </Button>
            
            <Button variant="outline" size="lg" className="text-base sm:text-lg px-8 py-6 rounded-full w-full sm:w-auto">
              See Pricing
            </Button>
          </motion.div>
        </div>

        {/* Secondary Section - The Way Tech Should Be */}
        <motion.div
          initial={{ opacity: 0, y: 40 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.4 }}
          className="mt-32 max-w-6xl mx-auto"
        >
          <h2 className="text-4xl sm:text-5xl md:text-6xl lg:text-7xl font-bold text-center mb-24 leading-tight">
            The way tech <span className="italic font-normal text-muted-foreground">should've</span><br />been done in the first place
          </h2>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-8">
            <motion.div 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.5 }}
              className="text-left"
            >
              <div className="text-6xl mb-4">🚀</div>
              <h3 className="text-2xl font-bold mb-3">Consult</h3>
              <p className="text-muted-foreground leading-relaxed">
                Schedule a consultation & discuss your tech, supply chain, or branding needs.
              </p>
            </motion.div>

            <motion.div 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.6 }}
              className="text-left"
            >
              <div className="text-6xl mb-4">⚡</div>
              <h3 className="text-2xl font-bold mb-3">Request</h3>
              <p className="text-muted-foreground leading-relaxed">
                Request solutions from supply chain optimization to custom software development.
              </p>
            </motion.div>

            <motion.div 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.7 }}
              className="text-left"
            >
              <div className="text-6xl mb-4">✨</div>
              <h3 className="text-2xl font-bold mb-3">Receive</h3>
              <p className="text-muted-foreground leading-relaxed">
                Get professional solutions delivered with precision and expertise.
              </p>
            </motion.div>
          </div>
        </motion.div>
      </div>
    </section>
  );
};

export default Hero;