import { motion } from "framer-motion";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { GraduationCap, Award, MapPin, Calendar } from "lucide-react";

const About = () => {
  const experience = [
    {
      company: "Fortune 500 Food Distribution",
      role: "Supply Chain Operations",
      period: "2020 - Present",
      location: "Northeast Region",
      highlights: [
        "Led comprehensive safety and operational initiatives across large-scale distribution networks",
        "Drove continuous improvement in workplace culture and regulatory compliance",
        "Managed cross-functional teams and training programs for 600+ personnel"
      ]
    },
    {
      company: "Regional Food Distribution Leader",
      role: "Transportation & Logistics Management",
      period: "2018 - 2020",
      location: "New Jersey Region",
      highlights: [
        "Directed multi-site logistics operations with substantial fleet oversight",
        "Improved operational compliance metrics from 65% to 95%",
        "Developed strategic partnerships for long-term fleet management"
      ]
    },
    {
      company: "Technology & Brand Development",
      role: "Consulting & Solutions Architecture",
      period: "2015 - Present",
      location: "Remote / Multi-region",
      highlights: [
        "Designed and deployed custom software solutions for enterprise clients",
        "Developed comprehensive brand strategies and digital marketing campaigns",
        "Integrated AI/ML technologies into business processes"
      ]
    }
  ];

  const certifications = [
    "Six Sigma: Green Belt",
    "Demonstrating Accountability as a Leader", 
    "Holding Your Team Accountable",
    "Java Certification Course",
    "Root Cause Analysis: Getting to the Root of Business Problems"
  ];

  const education = [
    {
      degree: "Master's in Integrated Supply Chain Management",
      institution: "Top-Tier Business School",
      achievement: "Graduate Leadership Recognition"
    }
  ];

  return (
    <section id="about" className="py-24 bg-background">
      <div className="container-max section-padding">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          viewport={{ once: true }}
          className="text-center mb-16"
        >
          <h2 className="text-3xl md:text-5xl font-bold mb-6">
            About <span className="gradient-text">Dobeu Tech Solutions</span>
          </h2>
          <p className="text-xl text-muted-foreground max-w-4xl mx-auto leading-relaxed">
            15+ years of expertise in transportation, logistics, and supply chain management combined 
            with cutting-edge technology consulting and innovative brand development. We specialize in 
            freight optimization, KPIs, SOPs, custom software development, and strategic business solutions.
          </p>
        </motion.div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 mb-16">
          {/* Experience */}
          <motion.div
            initial={{ opacity: 0, x: -40 }}
            whileInView={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.6 }}
            viewport={{ once: true }}
          >
            <h3 className="text-2xl font-bold mb-8 flex items-center gap-3">
              <Calendar className="h-6 w-6 text-primary" />
              Professional Experience
            </h3>
            
            <div className="space-y-6">
              {experience.map((job, index) => (
                <Card key={index} className="border-l-4 border-l-primary">
                  <CardContent className="p-6">
                    <div className="mb-4">
                      <h4 className="text-lg font-semibold text-foreground">{job.role}</h4>
                      <p className="text-primary font-medium">{job.company}</p>
                      <div className="flex flex-wrap gap-4 text-sm text-muted-foreground mt-2">
                        <span className="flex items-center gap-1">
                          <Calendar className="h-3 w-3" />
                          {job.period}
                        </span>
                        <span className="flex items-center gap-1">
                          <MapPin className="h-3 w-3" />
                          {job.location}
                        </span>
                      </div>
                    </div>
                    
                    <ul className="space-y-2">
                      {job.highlights.map((highlight, idx) => (
                        <li key={idx} className="text-sm text-muted-foreground">
                          • {highlight}
                        </li>
                      ))}
                    </ul>
                  </CardContent>
                </Card>
              ))}
            </div>
          </motion.div>

          {/* Education & Certifications */}
          <motion.div
            initial={{ opacity: 0, x: 40 }}
            whileInView={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.6 }}
            viewport={{ once: true }}
            className="space-y-8"
          >
            {/* Education */}
            <div>
              <h3 className="text-2xl font-bold mb-6 flex items-center gap-3">
                <GraduationCap className="h-6 w-6 text-primary" />
                Education
              </h3>
              
              {education.map((edu, index) => (
                <Card key={index} className="mb-4">
                  <CardContent className="p-6">
                    <h4 className="text-lg font-semibold text-foreground mb-2">{edu.degree}</h4>
                    <p className="text-primary font-medium mb-2">{edu.institution}</p>
                    <Badge variant="secondary">{edu.achievement}</Badge>
                  </CardContent>
                </Card>
              ))}
            </div>

            {/* Certifications */}
            <div>
              <h3 className="text-2xl font-bold mb-6 flex items-center gap-3">
                <Award className="h-6 w-6 text-primary" />
                Certifications
              </h3>
              
              <div className="space-y-3">
                {certifications.map((cert, index) => (
                  <motion.div
                    key={index}
                    initial={{ opacity: 0, y: 10 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.4, delay: index * 0.1 }}
                    viewport={{ once: true }}
                  >
                    <Card>
                      <CardContent className="p-4">
                        <p className="text-sm font-medium">{cert}</p>
                      </CardContent>
                    </Card>
                  </motion.div>
                ))}
              </div>
            </div>

            {/* Skills Tags */}
            <div>
              <h3 className="text-xl font-bold mb-4">Core Skills</h3>
              <div className="flex flex-wrap gap-2">
                {[
                  "Supply Chain", "Logistics", "Fleet Management", "Team Leadership", 
                  "Python", "JavaScript", "AI/ML", "Database Design", "Linux", 
                  "Graphic Design", "SEO", "Brand Strategy"
                ].map((skill, index) => (
                  <Badge key={index} variant="outline" className="text-xs">
                    {skill}
                  </Badge>
                ))}
              </div>
            </div>
          </motion.div>
        </div>
      </div>
    </section>
  );
};

export default About;