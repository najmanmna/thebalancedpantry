import React from "react";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import Container from "@/components/Container";

export const metadata = {
  title: "Terms of Service | The Balanced Pantry",
  description: "Terms and conditions for using The Balanced Pantry website and services.",
};

export default function TermsPage() {
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
          Terms of Service.
        </h1>
        <p className="font-sans text-charcoal/60">
          Last Updated: January 21, 2026
        </p>
      </div>

      {/* Content */}
      <div className="max-w-3xl mx-auto font-sans text-charcoal/80 leading-relaxed space-y-10">
        
        <section>
          <h2 className="font-serif text-2xl font-bold text-charcoal mb-4">1. Overview</h2>
          <p>
            This website is operated by <strong>The Balanced Pantry</strong>. Throughout the site, the terms “we”, “us” and “our” refer to The Balanced Pantry. By visiting our site and/or purchasing something from us, you engage in our “Service” and agree to be bound by the following terms and conditions.
          </p>
        </section>

        <section>
          <h2 className="font-serif text-2xl font-bold text-charcoal mb-4">2. General Conditions</h2>
          <p>
            We reserve the right to refuse service to anyone for any reason at any time. You understand that your content (not including credit card information), may be transferred unencrypted and involve transmissions over various networks. Credit card information is always encrypted during transfer over networks.
          </p>
        </section>

        <section>
          <h2 className="font-serif text-2xl font-bold text-charcoal mb-4">3. Products & Nature of Goods</h2>
          <ul className="list-disc pl-5 space-y-2 mt-2">
            <li>
              <strong>Freeze-Dried Nature:</strong> Our products are fragile by nature. While we package them securely, minor breakage or "dust" at the bottom of the bag is normal and does not constitute a defect.
            </li>
            <li>
              <strong>Storage:</strong> Freeze-dried fruit is highly sensitive to humidity. We are not liable for spoilage (loss of crunch) if the product is left unsealed or stored improperly after opening.
            </li>
            <li>
              <strong>Appearance:</strong> We have made every effort to display as accurately as possible the colors and images of our products. We cannot guarantee that your computer monitor's display of any color will be accurate.
            </li>
          </ul>
        </section>

        <section>
          <h2 className="font-serif text-2xl font-bold text-charcoal mb-4">4. Accuracy of Billing & Account Information</h2>
          <p>
            We reserve the right to refuse any order you place with us. In the event that we make a change to or cancel an order, we may attempt to notify you by contacting the e-mail and/or billing address/phone number provided at the time the order was made.
          </p>
          <p className="mt-4">
            You agree to provide current, complete, and accurate purchase and account information for all purchases made at our store.
          </p>
        </section>

        <section>
          <h2 className="font-serif text-2xl font-bold text-charcoal mb-4">5. Pricing & Payments</h2>
          <p>
            Prices for our products are stated in <strong>Sri Lankan Rupees (LKR)</strong> and are subject to change without notice. We reserve the right at any time to modify or discontinue the Service (or any part or content thereof) without notice at any time.
          </p>
        </section>

        <section>
          <h2 className="font-serif text-2xl font-bold text-charcoal mb-4">6. Delivery & Shipping</h2>
          <p>
            We deliver islandwide within Sri Lanka. Delivery times (2-4 working days) are estimates and may vary due to external factors such as weather, strikes, or courier delays. We are not responsible for delays caused by the courier service once the package has left our facility.
          </p>
        </section>

        <section>
          <h2 className="font-serif text-2xl font-bold text-charcoal mb-4">7. Governing Law</h2>
          <p>
            These Terms of Service and any separate agreements whereby we provide you Services shall be governed by and construed in accordance with the laws of the <strong>Democratic Socialist Republic of Sri Lanka</strong>.
          </p>
        </section>

        <section>
          <h2 className="font-serif text-2xl font-bold text-charcoal mb-4">8. Limitation of Liability</h2>
          <p>
            In no case shall The Balanced Pantry, our directors, officers, employees, affiliates, agents, contractors, interns, suppliers, service providers or licensors be liable for any injury, loss, claim, or any direct, indirect, incidental, punitive, special, or consequential damages of any kind.
          </p>
        </section>

        <section>
          <h2 className="font-serif text-2xl font-bold text-charcoal mb-4">9. Contact Information</h2>
          <p>
            Questions about the Terms of Service should be sent to us at:
          </p>
          <div className="mt-4 p-6 bg-white border border-charcoal/10 rounded-xl">
             <p className="font-bold text-charcoal">The Balanced Pantry</p>
             <p>Colombo, Sri Lanka</p>
             <p>Email: hello@thebalancedpantry.lk</p>
             <p>Phone: +94 77 123 4567</p>
          </div>
        </section>

      </div>
    </Container>
  );
}