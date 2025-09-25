import { motion } from "framer-motion";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { 
  Truck, 
  Code, 
  Palette, 
  ArrowRight, 
  BarChart3, 
  Cpu, 
  Megaphone,
  CheckCircle 
} from "lucide-react";

const ExpertiseAreas = () => {
  const expertiseAreas = [
    {
      icon: Truck,
      title: "Supply Chain Management",
      description: "15+ years of industry expertise across transportation, logistics, and operations",
      features: [
        "Freight optimization & KPI management",
        "ELD compliance & fleet management", 
        "SOPs & team leadership",
        "Six Sigma Green Belt certified",
        "Masters in Integrated Supply Chain Management"
      ],
      accent: "from-blue-500 to-cyan-500",
      bgAccent: "bg-blue-50 dark:bg-blue-950/20"
    },
    {
      icon: Code,
      title: "Technology Consulting",
      description: "AI/ML solutions, software development, and digital transformation for SMBs",
      features: [
        "Python, JavaScript, TypeScript & HTML",
        "AI/ML implementation & strategy",
        "Database design (SQL, PostgreSQL)",
        "Linux VPS management (Debian/Ubuntu)",
        "Open source software solutions"
      ],
      accent: "from-green-500 to-emerald-500",
      bgAccent: "bg-green-50 dark:bg-green-950/20"
    },
    {
      icon: Palette,
      title: "Marketing & Brand Development",
      description: "Go-to-market strategies, visual design, and SEO optimization",
      features: [
        "Logo & graphic design",
        "Website development & optimization",
        "SEO & digital marketing",
        "Go-to-market strategy development",
        "Brand identity & positioning"
      ],
      accent: "from-purple-500 to-pink-500", 
      bgAccent: "bg-purple-50 dark:bg-purple-950/20"
    }
  ];

  const containerVariants = {
    hidden: {},
    visible: {
      transition: {
        staggerChildren: 0.2
      }
    }
  };

  const cardVariants = {
    hidden: { opacity: 0, y: 40 },
    visible: { 
      opacity: 1, 
      y: 0,
      transition: { duration: 0.6 }
    }
  };

  return (
    <section id="expertise" className="py-24 bg-accent/5">
      <div className="container-max section-padding">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          viewport={{ once: true }}
          className="text-center mb-16"
        >
          <h2 className="text-3xl md:text-5xl font-bold mb-6">
            <span className="gradient-text">Three Core Areas</span> of Expertise
          </h2>
          <p className="text-xl text-muted-foreground max-w-3xl mx-auto">
            Leveraging diverse industry experience to drive innovation across supply chain, 
            technology, and marketing domains.
          </p>
        </motion.div>

        <motion.div
          variants={containerVariants}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true }}
          className="grid grid-cols-1 lg:grid-cols-3 gap-8"
        >
          {expertiseAreas.map((area, index) => {
            const IconComponent = area.icon;
            return (
              <motion.div key={area.title} variants={cardVariants}>
                <Card className="h-full group hover:shadow-xl transition-all duration-500 border-0 bg-card/50 backdrop-blur-sm">
                  <CardHeader className="text-center pb-6">
                    <div className={`w-16 h-16 mx-auto rounded-2xl bg-gradient-to-br ${area.accent} p-4 mb-4 group-hover:scale-110 transition-transform duration-300`}>
                      <IconComponent className="w-full h-full text-white" />
                    </div>
                    <CardTitle className="text-2xl font-bold">{area.title}</CardTitle>
                    <CardDescription className="text-base">
                      {area.description}
                    </CardDescription>
                  </CardHeader>
                  
                  <CardContent className="space-y-4">
                    <div className="space-y-3">
                      {area.features.map((feature, featureIndex) => (
                        <div key={featureIndex} className="flex items-start gap-3">
                          <CheckCircle className="h-5 w-5 text-primary mt-0.5 flex-shrink-0" />
                          <span className="text-sm text-muted-foreground">{feature}</span>
                        </div>
                      ))}
                    </div>
                    
                    <Button 
                      variant="ghost" 
                      className="w-full group/btn mt-6"
                      asChild
                    >
                      <a href="#booking">
                        Consult on {area.title}
                        <ArrowRight className="ml-2 h-4 w-4 group-hover/btn:translate-x-1 transition-transform" />
                      </a>
                    </Button>
                  </CardContent>
                </Card>
              </motion.div>
            );
          })}
        </motion.div>

        {/* Call to Action */}
        <motion.div
          initial={{ opacity: 0, y: 40 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.4 }}
          viewport={{ once: true }}
          className="text-center mt-16"
        >
          <p className="text-lg text-muted-foreground mb-6">
            Ready to transform your business with integrated solutions?
          </p>
          <Button size="lg" className="text-lg px-8 py-6 rounded-full">
            Schedule Your Consultation
            <ArrowRight className="ml-2 h-5 w-5" />
          </Button>
        </motion.div>
      </div>
    </section>
  );
};

export default ExpertiseAreas;