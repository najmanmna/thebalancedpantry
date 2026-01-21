import React from "react";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import Container from "@/components/Container";

export const metadata = {
  title: "Privacy Policy | The Balanced Pantry",
  description: "How The Balanced Pantry collects, uses, and protects your personal information.",
};

export default function PrivacyPage() {
  return (
    <Container className="py-12 md:py-20 bg-cream min-h-screen">
      
      {/* Header */}
      <div className="max-w-3xl mx-auto mb-12">
        <Link 
          href="/" 
          className="inline-flex items-center gap-2 text-charcoal/60 hover:text-brandRed transition-colors text-sm font-bold mb-6"
        >
          <ArrowLeft size={16} /> Back to Home
        </Link>
        <h1 className="font-serif text-4xl md:text-5xl font-black text-charcoal mb-4">
          Privacy Policy.
        </h1>
        <p className="font-sans text-charcoal/60">
          Last Updated: January 21, 2026
        </p>
      </div>

      {/* Content */}
      <div className="max-w-3xl mx-auto font-sans text-charcoal/80 leading-relaxed space-y-10">
        
        <section>
          <h2 className="font-serif text-2xl font-bold text-charcoal mb-4">1. Introduction</h2>
          <p>
            At <strong>The Balanced Pantry</strong>, we value your privacy and are committed to protecting your personal information. This Privacy Policy explains how we collect, use, and safeguard your data when you visit our website or make a purchase.
          </p>
        </section>

        <section>
          <h2 className="font-serif text-2xl font-bold text-charcoal mb-4">2. Information We Collect</h2>
          <p>
            When you purchase something from our store, as part of the buying and selling process, we collect the personal information you give us such as:
          </p>
          <ul className="list-disc pl-5 space-y-2 mt-4">
            <li><strong>Identity Data:</strong> Name, username, or similar identifier.</li>
            <li><strong>Contact Data:</strong> Billing address, delivery address, email address, and telephone numbers.</li>
            <li><strong>Transaction Data:</strong> Details about payments to and from you and other details of products you have purchased from us.</li>
          </ul>
          <p className="mt-4">
            We do <strong>not</strong> store credit card details on our servers. All online payments are processed securely through third-party payment gateways.
          </p>
        </section>

        <section>
          <h2 className="font-serif text-2xl font-bold text-charcoal mb-4">3. How We Use Your Information</h2>
          <p>
            We use your information specifically for the following purposes:
          </p>
          <ul className="list-disc pl-5 space-y-2 mt-4">
            <li>To process and deliver your order (sharing details with our delivery partners).</li>
            <li>To communicate with you regarding your order status (via Email or SMS/WhatsApp).</li>
            <li>To screen our orders for potential risk or fraud.</li>
            <li>If you have opted in, to send you emails about our store, new products, and other updates.</li>
          </ul>
        </section>

        <section>
          <h2 className="font-serif text-2xl font-bold text-charcoal mb-4">4. Disclosure to Third Parties</h2>
          <p>
            We do not sell, trade, or otherwise transfer your personally identifiable information to outside parties. This does not include trusted third parties who assist us in operating our website, conducting our business, or servicing you (e.g., local courier services in Sri Lanka), so long as those parties agree to keep this information confidential.
          </p>
        </section>

        <section>
          <h2 className="font-serif text-2xl font-bold text-charcoal mb-4">5. Cookies</h2>
          <p>
            Our website uses cookies to enhance your browsing experience. Cookies are small data files stored on your device that help us remember your cart items and understand how you use our site. You can choose to disable cookies through your browser settings, but this may affect your ability to use our shopping cart.
          </p>
        </section>

        <section>
          <h2 className="font-serif text-2xl font-bold text-charcoal mb-4">6. Security</h2>
          <p>
            To protect your personal information, we take reasonable precautions and follow industry best practices to make sure it is not inappropriately lost, misused, accessed, disclosed, altered, or destroyed. Our store is secured using SSL (Secure Socket Layer) encryption technology.
          </p>
        </section>

        <section>
          <h2 className="font-serif text-2xl font-bold text-charcoal mb-4">7. Changes to This Policy</h2>
          <p>
            We reserve the right to modify this privacy policy at any time, so please review it frequently. Changes and clarifications will take effect immediately upon their posting on the website.
          </p>
        </section>

        <section>
          <h2 className="font-serif text-2xl font-bold text-charcoal mb-4">8. Contact Us</h2>
          <p>
            If you would like to: access, correct, amend or delete any personal information we have about you, register a complaint, or simply want more information, contact us at:
          </p>
          <div className="mt-4 p-6 bg-white border border-charcoal/10 rounded-xl">
             <p className="font-bold text-charcoal">The Balanced Pantry</p>
             <p>Email: hello@thebalancedpantry.lk</p>
             <p>Phone: +94 77 123 4567</p>
          </div>
        </section>

      </div>
    </Container>
  );
}