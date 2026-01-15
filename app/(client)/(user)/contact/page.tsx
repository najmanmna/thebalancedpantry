"use client";

import { useState, FormEvent } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Send, CheckCircle2, Mail, MapPin, Phone } from "lucide-react";

import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import Container from "@/components/Container";

const ContactPage = () => {
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    message: "",
  });

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    const { name, value } = e.target;
    setFormData((prevData) => ({
      ...prevData,
      [name]: value,
    }));
  };

  const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setLoading(true);
    
    // Simulate API Call
    await new Promise((resolve) => setTimeout(resolve, 1500));

    // Reset
    setFormData({ name: "", email: "", message: "" });
    setLoading(false);
    setSuccess(true);
  };

  return (
    <div className="bg-cream min-h-screen py-12 sm:py-20 relative overflow-hidden">
      
      {/* Decorative Blob */}
      <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-brandRed/5 rounded-full blur-[100px] -mr-20 -mt-20 pointer-events-none"></div>

      <Container>
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 lg:gap-24 items-start">
          
          {/* --- LEFT: INFO & VIBE --- */}
          <motion.div 
            initial={{ opacity: 0, x: -30 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.6 }}
            className="space-y-8"
          >
            <div>
              <span className="font-sans text-xs font-bold tracking-[0.2em] text-brandRed uppercase">
                Get In Touch
              </span>
              <h1 className="font-serif text-5xl sm:text-6xl font-black text-charcoal mt-4 leading-[0.9]">
                Let's Talk <br />
                <span className="italic font-light text-charcoal/60">Pantry.</span>
              </h1>
              <p className="mt-6 text-lg text-charcoal/70 max-w-md leading-relaxed font-sans">
                Have a question about our freeze-drying process? Want to suggest a new fruit? Or just want to say hi? We are all ears.
              </p>
            </div>

            <div className="space-y-6 pt-8 border-t border-charcoal/10">
              <div className="flex items-start gap-4 group">
                <div className="w-12 h-12 rounded-full bg-white border border-charcoal/10 flex items-center justify-center text-charcoal/60 group-hover:text-brandRed group-hover:border-brandRed/30 transition-all shadow-sm">
                  <Mail className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="font-serif font-bold text-xl text-charcoal">Email Us</h3>
                  <p className="text-charcoal/60">hello@balancedpantry.lk</p>
                </div>
              </div>

              <div className="flex items-start gap-4 group">
                <div className="w-12 h-12 rounded-full bg-white border border-charcoal/10 flex items-center justify-center text-charcoal/60 group-hover:text-brandRed group-hover:border-brandRed/30 transition-all shadow-sm">
                  <Phone className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="font-serif font-bold text-xl text-charcoal">Call Us</h3>
                  <p className="text-charcoal/60">+94 77 123 4567</p>
                </div>
              </div>

              {/* <div className="flex items-start gap-4 group">
                <div className="w-12 h-12 rounded-full bg-white border border-charcoal/10 flex items-center justify-center text-charcoal/60 group-hover:text-brandRed group-hover:border-brandRed/30 transition-all shadow-sm">
                  <MapPin className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="font-serif font-bold text-xl text-charcoal">Visit Us</h3>
                  <p className="text-charcoal/60">
                    No. 123, Pantry Lane,<br />
                    Colombo 07, Sri Lanka.
                  </p>
                </div>
              </div> */}
            </div>
          </motion.div>


          {/* --- RIGHT: THE FORM --- */}
          <motion.div 
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.2 }}
            className="relative"
          >
            <div className="bg-white p-8 sm:p-10 rounded-[2.5rem] shadow-xl border border-charcoal/5 relative z-10">
              <form onSubmit={handleSubmit} className="space-y-6">
                
                <div className="space-y-2">
                  <Label htmlFor="name" className="text-xs font-bold uppercase tracking-wider text-charcoal/50">Your Name</Label>
                  <Input
                    id="name"
                    name="name"
                    value={formData.name}
                    onChange={handleChange}
                    required
                    disabled={loading}
                    placeholder="e.g. John Doe"
                    className="bg-cream/30 border-charcoal/10 rounded-xl h-12 focus:border-brandRed focus:ring-0"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="email" className="text-xs font-bold uppercase tracking-wider text-charcoal/50">Email Address</Label>
                  <Input
                    id="email"
                    type="email"
                    name="email"
                    value={formData.email}
                    onChange={handleChange}
                    required
                    disabled={loading}
                    placeholder="john@example.com"
                    className="bg-cream/30 border-charcoal/10 rounded-xl h-12 focus:border-brandRed focus:ring-0"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="message" className="text-xs font-bold uppercase tracking-wider text-charcoal/50">Message</Label>
                  <Textarea
                    id="message"
                    name="message"
                    value={formData.message}
                    onChange={handleChange}
                    required
                    disabled={loading}
                    rows={5}
                    placeholder="How can we help you?"
                    className="bg-cream/30 border-charcoal/10 rounded-xl resize-none focus:border-brandRed focus:ring-0"
                  />
                </div>

                <Button 
                  type="submit" 
                  disabled={loading}
                  className="w-full bg-brandRed hover:bg-brandRed/90 text-cream font-serif font-bold text-lg h-14 rounded-2xl shadow-[4px_4px_0px_0px_#4A3728] hover:shadow-[2px_2px_0px_0px_#4A3728] hover:translate-y-[2px] transition-all flex items-center justify-center gap-2"
                >
                  {loading ? "Sending..." : "Send Message"}
                  {!loading && <Send className="w-4 h-4" />}
                </Button>

              </form>
            </div>

            {/* Decorative Card Underneath */}
            <div className="absolute inset-0 bg-charcoal rounded-[2.5rem] transform translate-y-4 translate-x-4 -z-0 opacity-5"></div>
          </motion.div>

        </div>
      </Container>

      {/* --- SUCCESS MODAL --- */}
      <AnimatePresence>
        {success && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 flex items-center justify-center bg-charcoal/40 backdrop-blur-sm z-50 px-4"
          >
            <motion.div
              initial={{ scale: 0.9, y: 20 }}
              animate={{ scale: 1, y: 0 }}
              exit={{ scale: 0.9, y: 20 }}
              className="bg-white rounded-[2rem] p-8 max-w-sm w-full text-center shadow-2xl relative overflow-hidden"
            >
              {/* Confetti / Decor */}
              <div className="absolute top-0 left-0 w-full h-2 bg-gradient-to-r from-brandRed to-orange-400"></div>

              <div className="w-16 h-16 bg-green-100 text-green-600 rounded-full flex items-center justify-center mx-auto mb-6">
                <CheckCircle2 className="w-8 h-8" />
              </div>
              
              <h2 className="font-serif text-2xl font-bold text-charcoal mb-2">Message Sent!</h2>
              <p className="text-charcoal/60 mb-8 font-sans">
                Thanks for reaching out. We'll get back to your inbox shortly.
              </p>

              <button 
                onClick={() => setSuccess(false)}
                className="w-full py-3 rounded-xl bg-charcoal text-white font-bold hover:bg-black transition-colors"
              >
                Close
              </button>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

    </div>
  );
};

export default ContactPage;