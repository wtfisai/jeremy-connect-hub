import { motion } from "framer-motion";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { GraduationCap, Award, MapPin, Calendar } from "lucide-react";

const About = () => {
  const experience = [
    {
      company: "Baldor Specialty Foods, Inc.",
      role: "Transportation Safety Manager",
      period: "June 2024 - Present",
      location: "Bronx, New York",
      highlights: [
        "Led safety initiatives across warehousing and transportation operations",
        "Drove continuous improvement in workplace safety culture",
        "Collaborated cross-functionally to mitigate risk and ensure regulatory alignment"
      ]
    },
    {
      company: "US Foods",
      role: "Transportation Manager III",
      period: "September 2022 - April 2023",
      location: "Perth Amboy, New Jersey",
      highlights: [
        "Directed large team with multiple dispatch locations",
        "Reduced workplace incidents through proactive safety audits",
        "Delivered training to 600+ drivers across four distribution facilities"
      ]
    },
    {
      company: "Maximum Quality Foods",
      role: "Transportation Manager",
      period: "March 2021 - September 2022",
      location: "Linden, New Jersey",
      highlights: [
        "Managed 45+ drivers and transportation supervisors",
        "Improved PM compliance from 65% to 95%",
        "Developed long-term fleet management partnerships"
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
      institution: "Temple University - Fox School of Business",
      achievement: "Senator Elect for Fox School of Business"
    }
  ];

  return (
    <>
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
            About <span className="gradient-text">Jeremy Williams</span>
          </h2>
          <p className="text-xl text-muted-foreground max-w-4xl mx-auto leading-relaxed">
            A skilled and versatile professional with over 15 years in transportation, logistics, 
            and supply chain management. Expert in freight optimization, KPIs, SOPs, ELD compliance, 
            fleet management, data analysis, and team leadership.
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
    
    {/* Experience Section with Company Photos and Icons */}
    <section id="experience" className="py-24 bg-accent/5">
      <div className="container-max section-padding">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          viewport={{ once: true }}
          className="text-center mb-16"
        >
          <h2 className="text-3xl md:text-5xl font-bold mb-6">
            My <span className="gradient-text">Professional Journey</span>
          </h2>
          <p className="text-xl text-muted-foreground max-w-3xl mx-auto">
            15+ years working with industry leaders, delivering transformational results
          </p>
        </motion.div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 mb-16">
          {/* Company Experience Cards */}
          <motion.div
            initial={{ opacity: 0, y: 40 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            viewport={{ once: true }}
          >
            <Card className="h-full border-0 shadow-lg overflow-hidden">
              <div className="h-48 bg-gradient-to-br from-blue-500 to-cyan-500 relative">
                <div className="absolute inset-0 flex items-center justify-center">
                  <div className="text-white text-4xl font-bold">Baldor</div>
                </div>
              </div>
              <CardContent className="p-6">
                <h3 className="text-xl font-bold mb-2">Transportation Safety Manager</h3>
                <p className="text-primary font-medium mb-2">Baldor Specialty Foods</p>
                <p className="text-sm text-muted-foreground mb-4">June 2024 - Present</p>
                <p className="text-sm">Leading safety initiatives across warehousing and transportation operations, driving continuous improvement in workplace culture.</p>
              </CardContent>
            </Card>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 40 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.1 }}
            viewport={{ once: true }}
          >
            <Card className="h-full border-0 shadow-lg overflow-hidden">
              <div className="h-48 bg-gradient-to-br from-green-500 to-emerald-500 relative">
                <div className="absolute inset-0 flex items-center justify-center">
                  <div className="text-white text-4xl font-bold">US Foods</div>
                </div>
              </div>
              <CardContent className="p-6">
                <h3 className="text-xl font-bold mb-2">Transportation Manager III</h3>
                <p className="text-primary font-medium mb-2">US Foods</p>
                <p className="text-sm text-muted-foreground mb-4">Sept 2022 - April 2023</p>
                <p className="text-sm">Trained 600+ drivers across four distribution facilities, reducing workplace incidents through proactive safety measures.</p>
              </CardContent>
            </Card>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 40 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.2 }}
            viewport={{ once: true }}
          >
            <Card className="h-full border-0 shadow-lg overflow-hidden">
              <div className="h-48 bg-gradient-to-br from-purple-500 to-pink-500 relative">
                <div className="absolute inset-0 flex items-center justify-center">
                  <div className="text-white text-3xl font-bold">MaxQuality</div>
                </div>
              </div>
              <CardContent className="p-6">
                <h3 className="text-xl font-bold mb-2">Transportation Manager</h3>
                <p className="text-primary font-medium mb-2">Maximum Quality Foods</p>
                <p className="text-sm text-muted-foreground mb-4">March 2021 - Sept 2022</p>
                <p className="text-sm">Improved PM compliance from 65% to 95%, managing 45+ drivers and developing strategic partnerships.</p>
              </CardContent>
            </Card>
          </motion.div>
        </div>

        {/* Software Proficiencies */}
        <motion.div
          initial={{ opacity: 0, y: 40 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          viewport={{ once: true }}
          className="text-center"
        >
          <h3 className="text-2xl font-bold mb-8">Software & Technology Proficiencies</h3>
          <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-6">
            {[
              { name: "Python", icon: "🐍" },
              { name: "JavaScript", icon: "⚡" },
              { name: "SQL", icon: "🗄️" },
              { name: "Tableau", icon: "📊" },
              { name: "Excel", icon: "📈" },
              { name: "PowerBI", icon: "📱" },
              { name: "Linux", icon: "🐧" },
              { name: "Git", icon: "🔀" },
              { name: "Adobe CS", icon: "🎨" },
              { name: "SAP", icon: "💼" },
              { name: "WMS", icon: "📦" },
              { name: "TMS", icon: "🚛" }
            ].map((software, index) => (
              <motion.div
                key={software.name}
                initial={{ opacity: 0, scale: 0.8 }}
                whileInView={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.4, delay: index * 0.05 }}
                viewport={{ once: true }}
                className="text-center"
              >
                <div className="w-16 h-16 mx-auto mb-3 bg-card border border-border rounded-xl flex items-center justify-center text-2xl hover:shadow-lg transition-shadow">
                  {software.icon}
                </div>
                <p className="text-sm font-medium">{software.name}</p>
              </motion.div>
            ))}
          </div>
        </motion.div>
      </div>
    </section>
    </>
  );
};

export default About;