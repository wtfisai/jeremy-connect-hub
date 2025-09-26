import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { ArrowRight, Download, Linkedin, ExternalLink } from "lucide-react";

const Hero = () => {
  return (
    <section className="relative overflow-hidden bg-gradient-to-br from-background via-background to-accent/5 pt-20 pb-32">
      {/* Background Elements */}
      <div className="absolute inset-0 -z-10">
        <div className="absolute top-1/4 left-1/4 w-64 h-64 bg-primary/10 rounded-full blur-3xl" />
        <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-blue-500/10 rounded-full blur-3xl" />
      </div>

      <div className="container-max section-padding">
        <div className="max-w-4xl mx-auto text-center">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
          >
            <div className="mb-4">
              <span className="inline-block px-4 py-2 bg-primary/10 text-primary rounded-full text-sm font-medium mb-4">
                🚀 Transforming Operations • Driving Results • Maximizing ROI
              </span>
            </div>
            <h1 className="text-3xl sm:text-4xl md:text-6xl lg:text-7xl font-bold tracking-tight mb-6">
              <span className="gradient-text">Jeremy Williams</span>
              <br />
              <span className="text-foreground">Supply Chain & Tech Innovator</span>
            </h1>
          </motion.div>

          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.1 }}
            className="text-lg sm:text-xl md:text-2xl text-muted-foreground mb-8 max-w-3xl mx-auto leading-relaxed px-4"
          >
            <span className="font-semibold text-foreground">Reduce costs by 30% • Improve efficiency by 95% • Train 600+ drivers</span>
            <br />
            15+ years transforming supply chains through strategic operations management, 
            cutting-edge technology consulting, and innovative brand development solutions.
          </motion.p>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.2 }}
            className="flex flex-col sm:flex-row gap-4 justify-center items-center mb-12"
          >
            <Button 
              size="lg" 
              className="group text-base sm:text-lg px-6 sm:px-8 py-4 sm:py-6 rounded-full w-full sm:w-auto"
              onClick={() => document.getElementById('booking')?.scrollIntoView({ behavior: 'smooth' })}
            >
              Book a Consultation
              <ArrowRight className="ml-2 h-4 sm:h-5 w-4 sm:w-5 group-hover:translate-x-1 transition-transform" />
            </Button>
            
            <Button variant="outline" size="lg" className="text-base sm:text-lg px-6 sm:px-8 py-4 sm:py-6 rounded-full w-full sm:w-auto">
              <Download className="mr-2 h-4 sm:h-5 w-4 sm:w-5" />
              Download Resume
            </Button>
          </motion.div>

          {/* Social Links */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.3 }}
            className="flex justify-center gap-6"
          >
            <a
              href="https://linkedin.com/in/jswilliamstu"
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-2 text-muted-foreground hover:text-primary transition-colors"
            >
              <Linkedin className="h-5 w-5" />
              <span>LinkedIn</span>
              <ExternalLink className="h-4 w-4" />
            </a>
            
            <a
              href="https://www.behance.net/jeremywilliams62"
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-2 text-muted-foreground hover:text-primary transition-colors"
            >
              <span>Portfolio</span>
              <ExternalLink className="h-4 w-4" />
            </a>
            
            <a
              href="https://digitalwharf.dobeu.net/subscribe"
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-2 text-muted-foreground hover:text-primary transition-colors"
            >
              <span>The Digital Wharf</span>
              <ExternalLink className="h-4 w-4" />
            </a>
          </motion.div>
        </div>

        {/* Stats Section */}
        <motion.div
          initial={{ opacity: 0, y: 40 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.4 }}
          className="grid grid-cols-1 sm:grid-cols-3 gap-6 sm:gap-8 mt-16 sm:mt-20 max-w-4xl mx-auto px-4"
        >
          <div className="text-center p-6 rounded-2xl bg-card border border-border">
            <div className="text-3xl font-bold gradient-text mb-2">15+</div>
            <div className="text-muted-foreground">Years Experience</div>
          </div>
          
          <div className="text-center p-6 rounded-2xl bg-card border border-border">
            <div className="text-3xl font-bold gradient-text mb-2">25+</div>
            <div className="text-muted-foreground">Software Proficiencies</div>
          </div>
          
          <div className="text-center p-6 rounded-2xl bg-card border border-border">
            <div className="text-3xl font-bold gradient-text mb-2">$2M+</div>
            <div className="text-muted-foreground">Cost Savings Delivered</div>
          </div>
        </motion.div>
      </div>
    </section>
  );
};

export default Hero;