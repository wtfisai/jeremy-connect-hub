import { useState } from "react";
import { motion } from "framer-motion";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { ExternalLink, Github, Eye } from "lucide-react";

const Portfolio = () => {
  const projects = [
    {
      title: "Supply Chain Optimization Platform",
      description: "AI-powered analytics platform for real-time supply chain visibility and optimization",
      category: "Supply Chain",
      technologies: ["Python", "Machine Learning", "PostgreSQL", "React"],
      image: "/placeholder-project1.jpg",
      liveUrl: "#",
      githubUrl: "#",
      featured: true
    },
    {
      title: "Fleet Management Dashboard",
      description: "Comprehensive fleet tracking and maintenance management system",
      category: "Technology",
      technologies: ["JavaScript", "Node.js", "MongoDB", "Vue.js"],
      image: "/placeholder-project2.jpg",
      liveUrl: "#",
      githubUrl: "#",
      featured: true
    },
    {
      title: "Brand Identity Package",
      description: "Complete brand development for sustainable logistics company",
      category: "Design",
      technologies: ["Adobe Creative Suite", "Figma", "Brand Strategy"],
      image: "/placeholder-project3.jpg",
      behanceUrl: "https://www.behance.net/jeremywilliams62",
      featured: false
    },
    {
      title: "E-commerce SEO Strategy",
      description: "Comprehensive SEO overhaul increasing organic traffic by 300%",
      category: "Marketing",
      technologies: ["SEO", "Google Analytics", "Content Strategy"],
      image: "/placeholder-project4.jpg",
      liveUrl: "#",
      featured: false
    },
    {
      title: "Transportation Safety Analytics",
      description: "Data visualization platform for safety incident tracking and prevention",
      category: "Supply Chain",
      technologies: ["Python", "Tableau", "SQL", "Predictive Analytics"],
      image: "/placeholder-project5.jpg",
      liveUrl: "#",
      githubUrl: "#",
      featured: true
    },
    {
      title: "Small Business Automation Suite",
      description: "Custom workflow automation reducing manual processes by 80%",
      category: "Technology",
      technologies: ["Python", "APIs", "Automation", "Cloud Functions"],
      image: "/placeholder-project6.jpg",
      githubUrl: "#",
      featured: false
    }
  ];

  const categories = ["All", "Supply Chain", "Technology", "Design", "Marketing"];
  const [selectedCategory, setSelectedCategory] = useState("All");

  const filteredProjects = selectedCategory === "All" 
    ? projects 
    : projects.filter(project => project.category === selectedCategory);

  const featuredProjects = projects.filter(project => project.featured);

  return (
    <section id="portfolio" className="py-24 bg-accent/5">
      <div className="container-max section-padding">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          viewport={{ once: true }}
          className="text-center mb-16"
        >
          <h2 className="text-3xl md:text-5xl font-bold mb-6">
            Featured <span className="gradient-text">Portfolio</span>
          </h2>
          <p className="text-xl text-muted-foreground max-w-3xl mx-auto">
            A showcase of successful projects across supply chain optimization, 
            technology solutions, and brand development initiatives.
          </p>
        </motion.div>

        {/* Featured Projects */}
        <motion.div
          initial={{ opacity: 0, y: 40 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          viewport={{ once: true }}
          className="mb-16"
        >
          <h3 className="text-2xl font-bold mb-8 text-center">Featured Work</h3>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {featuredProjects.map((project, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.4, delay: index * 0.1 }}
                viewport={{ once: true }}
                className="group"
              >
                <Card className="h-full overflow-hidden border-0 bg-card/50 backdrop-blur-sm hover:shadow-xl transition-all duration-500">
                  <div className="aspect-video bg-gradient-to-br from-primary/20 to-accent/20 relative overflow-hidden">
                    <div className="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent" />
                    <Badge 
                      variant="secondary" 
                      className="absolute top-4 left-4 z-10 bg-background/90"
                    >
                      {project.category}
                    </Badge>
                    <div className="absolute inset-0 flex items-center justify-center">
                      <div className="text-center text-white">
                        <h4 className="font-bold text-lg mb-2">{project.title}</h4>
                        <p className="text-sm opacity-90">Project Preview</p>
                      </div>
                    </div>
                  </div>
                  
                  <CardContent className="p-6">
                    <h4 className="font-bold text-lg mb-2 group-hover:text-primary transition-colors">
                      {project.title}
                    </h4>
                    <p className="text-muted-foreground text-sm mb-4">
                      {project.description}
                    </p>
                    
                    <div className="flex flex-wrap gap-2 mb-4">
                      {project.technologies.slice(0, 3).map((tech, techIndex) => (
                        <Badge key={techIndex} variant="outline" className="text-xs">
                          {tech}
                        </Badge>
                      ))}
                      {project.technologies.length > 3 && (
                        <Badge variant="outline" className="text-xs">
                          +{project.technologies.length - 3} more
                        </Badge>
                      )}
                    </div>
                    
                    <div className="flex gap-2">
                      {project.liveUrl && (
                        <Button size="sm" variant="outline" className="flex-1" disabled>
                          <Eye className="w-4 h-4 mr-1" />
                          View
                        </Button>
                      )}
                      {project.githubUrl && (
                        <Button size="sm" variant="outline" className="flex-1" disabled>
                          <Github className="w-4 h-4 mr-1" />
                          Code
                        </Button>
                      )}
                      {project.behanceUrl && (
                        <Button size="sm" variant="outline" className="flex-1" asChild>
                          <a href={project.behanceUrl} target="_blank" rel="noopener noreferrer">
                            <ExternalLink className="w-4 h-4 mr-1" />
                            Behance
                          </a>
                        </Button>
                      )}
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </div>
        </motion.div>

        {/* Portfolio Links */}
        <motion.div
          initial={{ opacity: 0, y: 40 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.2 }}
          viewport={{ once: true }}
          className="text-center"
        >
          <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
            <Button size="lg" variant="outline" asChild>
              <a 
                href="https://www.behance.net/jeremywilliams62"
                target="_blank"
                rel="noopener noreferrer"
                className="group"
              >
                View Full Portfolio on Behance
                <ExternalLink className="ml-2 h-4 w-4 group-hover:translate-x-1 transition-transform" />
              </a>
            </Button>
            
            <Button size="lg" asChild>
              <a href="#booking">
                Start Your Project
              </a>
            </Button>
          </div>
          
          <p className="text-sm text-muted-foreground mt-4">
            Portfolio includes confidential client work under NDA. 
            Contact me for detailed case studies and references.
          </p>
        </motion.div>
      </div>
    </section>
  );
};

export default Portfolio;