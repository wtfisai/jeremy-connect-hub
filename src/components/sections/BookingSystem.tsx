import { useState } from "react";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Calendar } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { Calendar as CalendarIcon, Clock, MessageSquare, CheckCircle } from "lucide-react";
import { format } from "date-fns";

const BookingSystem = () => {
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    consultation_type: "",
    message: "",
    preferred_date: "",
    preferred_time: ""
  });
  const [selectedDate, setSelectedDate] = useState<Date>();
  const [isLoading, setIsLoading] = useState(false);
  const { toast } = useToast();

  const consultationTypes = [
    {
      id: "supply_chain",
      title: "Supply Chain Consulting",
      description: "Optimize your operations, logistics, and fleet management",
      duration: "60 minutes",
      features: ["Operations Analysis", "Process Optimization", "Cost Reduction Strategies"]
    },
    {
      id: "it_tech", 
      title: "IT & Technology Solutions",
      description: "AI/ML implementation, software development, and digital transformation",
      duration: "45 minutes",
      features: ["AI/ML Strategy", "Software Solutions", "Digital Transformation"]
    },
    {
      id: "design_marketing",
      title: "Marketing & Brand Development", 
      description: "Brand strategy, design services, and digital marketing optimization",
      duration: "45 minutes",
      features: ["Brand Strategy", "Logo & Design", "SEO & Marketing"]
    },
    {
      id: "networking",
      title: "Professional Networking",
      description: "Collaboration opportunities and industry connections",
      duration: "30 minutes", 
      features: ["Industry Insights", "Partnership Opportunities", "Career Guidance"]
    },
    {
      id: "question",
      title: "Quick Question / Advice",
      description: "Brief consultation for specific questions or guidance",
      duration: "15 minutes",
      features: ["Quick Advice", "Specific Questions", "Industry Insights"]
    }
  ];

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      const { error } = await supabase
        .from('bookings')
        .insert([{
          ...formData,
          preferred_date: formData.preferred_date && formData.preferred_time 
            ? new Date(`${formData.preferred_date}T${formData.preferred_time}:00`).toISOString() 
            : null
        }]);

      if (error) throw error;

      toast({
        title: "Booking Request Submitted!",
        description: "I'll review your request and get back to you within 24 hours to schedule.",
      });

      setFormData({
        name: "",
        email: "",
        consultation_type: "",
        message: "",
        preferred_date: "",
        preferred_time: ""
      });
      setSelectedDate(undefined);
    } catch (error) {
      toast({
        title: "Error",
        description: "Something went wrong. Please try again or contact me directly.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const selectedConsultation = consultationTypes.find(
    type => type.id === formData.consultation_type
  );

  return (
    <section id="booking" className="py-24 bg-background">
      <div className="container-max section-padding">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          viewport={{ once: true }}
          className="text-center mb-16"
        >
          <h2 className="mobile-heading font-bold mb-6">
            Book a <span className="gradient-text">Consultation</span>
          </h2>
          <p className="text-lg sm:text-xl text-muted-foreground max-w-3xl mx-auto">
            Ready to transform your business? Schedule a consultation to discuss your specific needs 
            and explore how my expertise can drive your success.
          </p>
        </motion.div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 lg:gap-12">
          {/* Consultation Types */}
          <motion.div
            initial={{ opacity: 0, x: -40 }}
            whileInView={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.6 }}
            viewport={{ once: true }}
            className="space-y-6"
          >
            <h3 className="text-2xl font-bold mb-8">Choose Your Consultation Type:</h3>
            
            <div className="space-y-4">
              {consultationTypes.map((type, index) => (
                <motion.div
                  key={type.id}
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.4, delay: index * 0.1 }}
                  viewport={{ once: true }}
                  className={`cursor-pointer transition-all duration-300 ${
                    formData.consultation_type === type.id 
                      ? 'ring-2 ring-primary' 
                      : 'hover:ring-1 hover:ring-border'
                  }`}
                  onClick={() => setFormData(prev => ({ ...prev, consultation_type: type.id }))}
                >
                  <Card>
                    <CardContent className="p-6">
                      <div className="flex items-start justify-between mb-3">
                        <h4 className="font-semibold text-lg">{type.title}</h4>
                        <div className="flex items-center gap-1 text-sm text-muted-foreground">
                          <Clock className="h-4 w-4" />
                          {type.duration}
                        </div>
                      </div>
                      
                      <p className="text-muted-foreground text-sm mb-4">{type.description}</p>
                      
                      <div className="flex flex-wrap gap-2">
                        {type.features.map((feature, idx) => (
                          <span
                            key={idx}
                            className="text-xs bg-accent/50 text-accent-foreground px-2 py-1 rounded-md"
                          >
                            {feature}
                          </span>
                        ))}
                      </div>
                    </CardContent>
                  </Card>
                </motion.div>
              ))}
            </div>
          </motion.div>

          {/* Booking Form */}
          <motion.div
            initial={{ opacity: 0, x: 40 }}
            whileInView={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.6 }}
            viewport={{ once: true }}
          >
            <Card className="border-0 shadow-2xl bg-card/50 backdrop-blur-sm">
              <CardHeader>
                <CardTitle className="text-2xl flex items-center gap-2">
                  <Calendar className="h-6 w-6 text-primary" />
                  Schedule Your Session
                </CardTitle>
                {selectedConsultation && (
                  <div className="bg-primary/10 border border-primary/20 rounded-lg p-4 mt-4">
                    <h4 className="font-semibold text-primary mb-1">
                      {selectedConsultation.title}
                    </h4>
                    <p className="text-sm text-muted-foreground">
                      {selectedConsultation.description} • {selectedConsultation.duration}
                    </p>
                  </div>
                )}
              </CardHeader>
              
              <CardContent>
                <form onSubmit={handleSubmit} className="space-y-6">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="text-sm font-medium mb-2 block">Full Name *</label>
                      <Input
                        placeholder="Your full name"
                        value={formData.name}
                        onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
                        required
                      />
                    </div>
                    
                    <div>
                      <label className="text-sm font-medium mb-2 block">Email Address *</label>
                      <Input
                        type="email"
                        placeholder="your.email@example.com"
                        value={formData.email}
                        onChange={(e) => setFormData(prev => ({ ...prev, email: e.target.value }))}
                        required
                      />
                    </div>
                  </div>

                  <div>
                    <label className="text-sm font-medium mb-2 block">Consultation Type *</label>
                    <Select 
                      value={formData.consultation_type} 
                      onValueChange={(value) => setFormData(prev => ({ ...prev, consultation_type: value }))}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Select consultation type" />
                      </SelectTrigger>
                      <SelectContent>
                        {consultationTypes.map((type) => (
                          <SelectItem key={type.id} value={type.id}>
                            <div className="flex items-center justify-between w-full">
                              <span>{type.title}</span>
                              <span className="text-xs text-muted-foreground ml-2">
                                {type.duration}
                              </span>
                            </div>
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="text-sm font-medium mb-2 block">Preferred Date</label>
                      <Popover>
                        <PopoverTrigger asChild>
                          <Button
                            variant="outline"
                            className="w-full justify-start text-left font-normal"
                          >
                            <CalendarIcon className="mr-2 h-4 w-4" />
                            {selectedDate ? format(selectedDate, "PPP") : "Pick a date"}
                          </Button>
                        </PopoverTrigger>
                        <PopoverContent className="w-auto p-0 z-50" align="start">
                          <Calendar
                            mode="single"
                            selected={selectedDate}
                            onSelect={(date) => {
                              setSelectedDate(date);
                              setFormData(prev => ({ 
                                ...prev, 
                                preferred_date: date ? format(date, "yyyy-MM-dd") : "" 
                              }));
                            }}
                            disabled={(date) => date < new Date(new Date().setHours(0, 0, 0, 0))}
                            initialFocus
                            className="bg-background border shadow-lg"
                          />
                        </PopoverContent>
                      </Popover>
                    </div>
                    
                    <div>
                      <label className="text-sm font-medium mb-2 block">Preferred Time</label>
                      <Select 
                        value={formData.preferred_time} 
                        onValueChange={(value) => setFormData(prev => ({ ...prev, preferred_time: value }))}
                      >
                        <SelectTrigger>
                          <SelectValue placeholder="Select time" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="09:00">9:00 AM</SelectItem>
                          <SelectItem value="10:00">10:00 AM</SelectItem>
                          <SelectItem value="11:00">11:00 AM</SelectItem>
                          <SelectItem value="13:00">1:00 PM</SelectItem>
                          <SelectItem value="14:00">2:00 PM</SelectItem>
                          <SelectItem value="15:00">3:00 PM</SelectItem>
                          <SelectItem value="16:00">4:00 PM</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>
                  
                  <div className="text-xs text-muted-foreground">
                    <p>Available Monday-Friday, 9 AM - 5 PM EST. I'll confirm availability and suggest alternatives if needed.</p>
                  </div>

                  <div>
                    <label className="text-sm font-medium mb-2 block">
                      Message <span className="text-muted-foreground">(Optional)</span>
                    </label>
                    <Textarea
                      placeholder="Tell me about your project, challenges, or specific goals..."
                      value={formData.message}
                      onChange={(e) => setFormData(prev => ({ ...prev, message: e.target.value }))}
                      rows={4}
                    />
                  </div>

                  <Button 
                    type="submit" 
                    size="lg" 
                    className="w-full rounded-full"
                    disabled={isLoading || !formData.consultation_type}
                  >
                    {isLoading ? "Submitting..." : "Request Consultation"}
                    <MessageSquare className="ml-2 h-4 w-4" />
                  </Button>

                  <div className="text-center">
                    <p className="text-xs text-muted-foreground">
                      I'll respond within 24 hours to confirm your booking. 
                      Sessions are conducted via video call or phone.
                    </p>
                  </div>
                </form>
              </CardContent>
            </Card>
          </motion.div>
        </div>
      </div>
    </section>
  );
};

export default BookingSystem;