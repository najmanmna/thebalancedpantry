"use client";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { CheckCircle } from "lucide-react";
import { FormEvent, useState } from "react";
import { motion } from "motion/react";

const ContactPage = () => {
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    message: "",
  });

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>,
  ) => {
    const { name, value } = e.target;
    setFormData((prevData) => ({
      ...prevData,
      [name]: value,
    }));
  };

  const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const form = new FormData();
    const currentDateTime = new Date().toLocaleString();
    form.append("Name", formData.name);
    form.append("Email", formData.email);
    form.append("Message", formData.message);
    form.append("DateTime", currentDateTime);
    setLoading(true);
    setSuccess(false);

    try {
      // Get your getform.io endpoint from the dashboard
      // and replace the empty string with your endpoint
      // --------------------- xxx ---------------------
      // const response = await fetch('', {
      //   method: "POST",
      //   body: form,
      // });

      // if (response?.ok) {
      //   setFormData({
      //     name: "",
      //     email: "",
      //     interest: "",
      //     budget: "",
      //     message: "",
      //   });
      // }
      setFormData({
        name: "",
        email: "",
        message: "",
      });
    } catch (error) {
      console.log("Form submitting Error", error);
    } finally {
      setLoading(false);
      setSuccess(true);
    }
  };
  return (
    <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-12 bg-tech_white my-5">
      <div>
        <h1 className="text-3xl font-bold mb-6">Contact Us</h1>
        <p className="mb-6">
          We&apos;d love to hear from you. Please fill out the form below and
          we&apos;ll get back to you as soon as possible.
        </p>
        <form className="space-y-4" onSubmit={handleSubmit}>
          <div className="space-y-0.5">
            <Label htmlFor="name">Name</Label>
            <Input
              disabled={loading}
              type="text"
              name="name"
              placeholder="Enter your name"
              value={formData.name}
              onChange={handleChange}
              required
              className="w-full px-3 py-2 border border-gray-300 rounded-md"
            />
          </div>
          <div className="space-y-0.5">
            <Label htmlFor="email">Email</Label>
            <Input
              disabled={loading}
              type="email"
              name="email"
              placeholder="Your email"
              value={formData.email}
              onChange={handleChange}
              required
              className="w-full px-3 py-2 border border-gray-300 rounded-md"
            />
          </div>
          <div className="space-y-0.5">
            <Label htmlFor="message">Message</Label>
            <Textarea
              disabled={loading}
              value={formData.message}
              onChange={handleChange}
              id="message"
              name="message"
              rows={6}
              className="w-full px-3 py-2 border border-gray-300 rounded-md resize-none"
              required
            />
          </div>
          <button
            type="submit"
            className="bg-tech_orange/80 text-white px-6 py-3 rounded-md text-sm font-semibold hover:bg-tech_orange hoverEffect"
          >
            Send Message
          </button>
        </form>
      </div>
      {success && (
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.3 }}
          className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50 z-50"
        >
          <div className="bg-white rounded-lg shadow-xl p-8 max-w-md w-full mx-4">
            <div className="text-center">
              <motion.div
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                transition={{
                  delay: 0.2,
                  type: "spring",
                  stiffness: 200,
                  damping: 10,
                }}
              >
                <CheckCircle className="w-16 h-16 mx-auto text-green-500" />
              </motion.div>
              <h2 className="mt-6 text-3xl font-bold text-gray-900">
                Success!
              </h2>
              <p className="mt-2 text-base font-medium text-gray-600">
                Your message has been sent successfully. We&apos;ll get back to
                you soon!
              </p>
            </div>
            <div className="mt-5 bg-tech_orange/80 text-white py-2 rounded-lg font-semibold tracking-wide hover:bg-tech_orange hoverEffect">
              <button onClick={() => setSuccess(false)} className="w-full">
                Close
              </button>
            </div>
          </div>
        </motion.div>
      )}
    </div>
  );
};
export default ContactPage;
