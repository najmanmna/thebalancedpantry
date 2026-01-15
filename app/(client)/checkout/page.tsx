"use client";

import { useEffect, useState, useRef } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";
import { motion, AnimatePresence } from "framer-motion";
import { 
  ArrowLeft, 
  CreditCard, 
  Truck, 
  ShieldCheck, 
  Tag, 
  MapPin, 
  User, 
  Phone, 
  Mail,
  CheckCircle2,
  AlertCircle
} from "lucide-react";
import toast from "react-hot-toast";

import useCartStore from "@/store";
import PriceFormatter from "@/components/PriceFormatter";
import Container from "@/components/Container";
import Loading from "@/components/Loading"; 
import { client } from "@/sanity/lib/client";
import { urlFor } from "@/sanity/lib/image";
import { DISTRICTS } from "@/constants/SrilankaDistricts";

// UI Components (styled via className)
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Separator } from "@/components/ui/separator";

// --- INTERFACES ---
interface SanityPromoCode {
  _id: string;
  code: string;
  isActive: boolean;
  discountPercentage: number;
  minOrderAmount: number;
  firstOrderOnly: boolean;
  isFreeShipping: boolean;
}

const DISCOUNT_ELIGIBILITY_DATE = "2025-11-05T00:00:00Z";

const SHIPPING_QUERY = `*[_type == "settings"][0]{
  deliveryCharges {
    colombo,
    suburbs,
    others
  }
}`;

// --- CONSTANTS ---
const colomboCityAreas = [
  "Colombo 01 - Fort", "Colombo 02 - Slave Island", "Colombo 03 - Kollupitiya",
  "Colombo 04 - Bambalapitiya", "Colombo 05 - Havelock Town", "Colombo 06 - Wellawatte",
  "Colombo 07 - Cinnamon Gardens", "Colombo 08 - Borella", "Colombo 09 - Dematagoda",
  "Colombo 10 - Maradana", "Colombo 11 - Pettah", "Colombo 12 - Hulftsdorp",
  "Colombo 13 - Kotahena", "Colombo 14 - Grandpass", "Colombo 15 - Modara",
];

const colomboSuburbs = [
  "Sri Jayawardenepura Kotte", "Dehiwala", "Mount Lavinia", "Moratuwa", "Kaduwela",
  "Maharagama", "Kesbewa", "Homagama", "Kolonnawa", "Rajagiriya", "Nugegoda",
  "Pannipitiya", "Boralesgamuwa", "Malabe", "Kottawa", "Pelawatta", "Ratmalana",
  "Kohuwala", "Battaramulla", "Thalawathugoda", "Nawinna", "Piliyandala", "Angoda", "Athurugiriya",
];

export default function CheckoutPage() {
  const router = useRouter();
  const items = useCartStore((s) => s.items);
  
  const [isPlacingOrder, setIsPlacingOrder] = useState(false);
  const placingRef = useRef(false);

  // --- FORM STATE ---
  const [form, setForm] = useState({
    firstName: "",
    lastName: "",
    address: "",
    district: "",
    city: "",
    phone: "",
    alternativePhone: "",
    notes: "",
    payment: "COD",
  });

  const [email, setEmail] = useState("");
  const [deliveryCharges, setDeliveryCharges] = useState<{
    colombo: number;
    suburbs: number;
    others: number;
  } | null>(null);

  const [shippingCost, setShippingCost] = useState<number>(0);

  // --- DISCOUNT STATE ---
  const [discountStatus, setDiscountStatus] = useState<"IDLE" | "CHECKING" | "ELIGIBLE" | "ALREADY_USED" | "NOT_ELIGIBLE">("IDLE");
  const [promoCodeInput, setPromoCodeInput] = useState("");
  const [promoStatus, setPromoStatus] = useState<"IDLE" | "CHECKING" | "APPLIED" | "ERROR">("IDLE");
  const [promoError, setPromoError] = useState<string | null>(null);
  const [appliedPromoCode, setAppliedPromoCode] = useState<SanityPromoCode | null>(null);

  const [emailError, setEmailError] = useState<string | null>(null);
  const [phoneError, setPhoneError] = useState<string | null>(null);

  // --- VALIDATION ---
  const isValidEmail = (email: string) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
  const isValidPhone = (phone: string) => {
    const digits = phone.replace(/\D/g, "");
    return /^(07[0-9]{8}|947[0-9]{8})$/.test(digits);
  };

  const validateEmailField = () => {
    if (email && !isValidEmail(email)) {
      setEmailError("Please enter a valid email address.");
      return false;
    }
    setEmailError(null);
    return true;
  };

  const validatePhoneField = () => {
    if (form.phone && !isValidPhone(form.phone)) {
      setPhoneError("Please enter a valid 10/11 digit mobile number.");
      return false;
    }
    setPhoneError(null);
    return true;
  };

  // --- EFFECTS ---
  
  // 1. Check Subscriber Discount
  useEffect(() => {
    const normalizedEmail = email.toLowerCase();
    if (!isValidEmail(normalizedEmail) && !isValidPhone(form.phone)) {
      setDiscountStatus("IDLE");
      return;
    }

    const handler = setTimeout(() => {
      async function checkDiscount() {
        setDiscountStatus("CHECKING");
        try {
          const orderClauses = [];
          const queryParams: any = { discountDate: DISCOUNT_ELIGIBILITY_DATE };
          let subscriberCheckQuery = "false";

          if (isValidEmail(normalizedEmail)) {
            orderClauses.push("email == $email");
            queryParams.email = normalizedEmail;
            subscriberCheckQuery = `count(*[_type == "subscribers" && email == $email && _createdAt < $discountDate]) > 0`;
          }
          if (isValidPhone(form.phone)) {
            orderClauses.push("phone == $phone");
            queryParams.phone = form.phone;
          }

          const orderCountQuery = orderClauses.length > 0
            ? `count(*[_type == "order" && (${orderClauses.join(" || ")}) && status != "cancelled"])`
            : "0";

          const data = await client.fetch(`{
              "isEarlySubscriber": ${subscriberCheckQuery},
              "orderCount": ${orderCountQuery}
            }`, queryParams);

          if (data.isEarlySubscriber) {
            setDiscountStatus(data.orderCount === 0 ? "ELIGIBLE" : "ALREADY_USED");
          } else {
            setDiscountStatus("NOT_ELIGIBLE");
          }
        } catch (err) {
          console.error(err);
          setDiscountStatus("IDLE");
        }
      }
      checkDiscount();
    }, 500);
    return () => clearTimeout(handler);
  }, [email, form.phone]);

  // 2. Fetch Shipping Rates
  useEffect(() => {
    client.fetch(SHIPPING_QUERY).then((data) => setDeliveryCharges(data?.deliveryCharges));
  }, []);

  // 3. Calculate Shipping Logic
  useEffect(() => {
    if (appliedPromoCode?.isFreeShipping) {
      setShippingCost(0);
      return;
    }
    if (!deliveryCharges || !form.district || !form.city) {
        setShippingCost(0); 
        return;
    }

    let fee = deliveryCharges.others;
    if (form.district === "Colombo") {
      if (colomboCityAreas.includes(form.city)) fee = deliveryCharges.colombo;
      else if (colomboSuburbs.includes(form.city)) fee = deliveryCharges.suburbs;
    }
    setShippingCost(fee);
  }, [form.district, form.city, deliveryCharges, appliedPromoCode]);

  // 4. Redirect Empty Cart
  useEffect(() => {
    if (items.length === 0) router.push("/shop");
  }, [items, router]);

  // 5. Calculate Totals
  const subtotal = items.reduce((t, it) => t + (it.product.price ?? 0) * it.quantity, 0);
  
  // 6. Validate Promo Requirements
  useEffect(() => {
    if (appliedPromoCode && subtotal < appliedPromoCode.minOrderAmount) {
      setAppliedPromoCode(null);
      setPromoStatus("ERROR");
      setPromoError(`Promo removed: Min order is Rs. ${appliedPromoCode.minOrderAmount}`);
      toast.error("Promo removed due to low total");
    }
  }, [subtotal, appliedPromoCode]);

  // 7. Prioritize Subscriber Discount
  useEffect(() => {
    if (discountStatus === "ELIGIBLE" && appliedPromoCode) {
      setAppliedPromoCode(null);
      setPromoStatus("IDLE");
      toast("Subscriber discount auto-applied (It's better!)", { icon: "🎉" });
    }
  }, [discountStatus, appliedPromoCode]);

  // --- DISCOUNT CALCULATIONS ---
  const isSubscriberDiscount = discountStatus === "ELIGIBLE";
  const isPromoDiscount = appliedPromoCode && !isSubscriberDiscount && subtotal >= appliedPromoCode.minOrderAmount;

  let discountAmount = 0;
  let discountLabel = "";

  if (isSubscriberDiscount) {
    discountAmount = subtotal * 0.15;
    discountLabel = "Subscriber (15%)";
  } else if (isPromoDiscount) {
    if (appliedPromoCode.isFreeShipping) {
        discountAmount = 0;
        discountLabel = "Free Shipping";
    } else {
        const percent = (appliedPromoCode.discountPercentage || 0) / 100;
        discountAmount = subtotal * percent;
        discountLabel = `Code: ${appliedPromoCode.code}`;
    }
  }

  const total = subtotal - discountAmount + shippingCost;

  // --- HANDLERS ---
  const handleApplyPromo = async () => {
    setPromoStatus("CHECKING");
    setPromoError(null);
    const code = promoCodeInput.trim().toUpperCase();
    
    if (!code) { setPromoStatus("ERROR"); return; }
    if (!email || !form.phone) { 
        setPromoStatus("ERROR"); 
        setPromoError("Enter email & phone first."); 
        return; 
    }

    try {
      const promo = await client.fetch<SanityPromoCode | null>(
        `*[_type == "promoCode" && code == $code][0]`, { code }
      );

      if (!promo || !promo.isActive) throw new Error("Invalid or inactive code.");
      if (subtotal < promo.minOrderAmount) throw new Error(`Min order Rs. ${promo.minOrderAmount} required.`);
      if (isSubscriberDiscount) throw new Error("Subscriber discount already active.");

      // Check First Order Only
      if (promo.firstOrderOnly) {
         const count = await client.fetch(
            `count(*[_type == "order" && (email == $email || phone == $phone) && status != "cancelled"])`,
            { email: email.toLowerCase(), phone: form.phone }
         );
         if (count > 0) throw new Error("This code is for first-time customers only.");
      }

      setAppliedPromoCode(promo);
      setPromoStatus("APPLIED");
      toast.success("Code Applied!");
    } catch (err: any) {
      setPromoStatus("ERROR");
      setPromoError(err.message || "Invalid code");
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validateEmailField() || !validatePhoneField()) {
        toast.error("Please fix errors in the form.");
        return;
    }
    
    if (placingRef.current) return;
    placingRef.current = true;
    setIsPlacingOrder(true);

    try {
      const payload = {
        form: { ...form, email },
        total,
        discountAmount,
        discountLabel,
        shippingCost,
        items: items.map((i) => ({
          product: { _id: i.product._id },
          quantity: i.quantity,
          price: i.product.price,
          productName: i.product.name,
          productImage: i.product.mainImage || i.product.images?.[0]
        })),
      };

      const res = await fetch("/api/checkout", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Checkout failed");

      toast.success("Order Confirmed!");
      sessionStorage.setItem("orderPlaced", "true");
      router.replace(`/success?orderNumber=${data.orderId}&payment=${form.payment}&total=${total}`);
    } catch (err) {
      console.error(err);
      toast.error("Failed to place order.");
      placingRef.current = false;
      setIsPlacingOrder(false);
    }
  };

  return (
    <Container className="py-10 bg-cream min-h-screen">
      {isPlacingOrder && <Loading />}
      
      {/* HEADER */}
      <div className="mb-8 flex flex-col md:flex-row justify-between items-start md:items-end gap-4">
        <div>
          <span className="font-sans text-xs font-bold tracking-[0.2em] text-brandRed uppercase">
            Secure Checkout
          </span>
          <h1 className="font-serif text-4xl sm:text-5xl font-black text-charcoal mt-2">
            Finish Your <span className="italic font-light">Order.</span>
          </h1>
        </div>
        <button onClick={() => router.back()} className="flex items-center gap-2 text-charcoal/60 hover:text-charcoal transition-colors text-sm font-bold">
            <ArrowLeft size={16} /> Back to Pantry
        </button>
      </div>

      <form onSubmit={handleSubmit} className="grid grid-cols-1 lg:grid-cols-3 gap-12 items-start">
        
        {/* --- LEFT COLUMN: BILLING DETAILS --- */}
        <div className="lg:col-span-2 space-y-8">
            
            {/* 1. Contact Info */}
            <section className="bg-white p-8 rounded-[2rem] border border-charcoal/5 shadow-sm">
                <div className="flex items-center gap-3 mb-6">
                    <div className="w-8 h-8 rounded-full bg-brandRed/10 flex items-center justify-center text-brandRed"><User size={16} /></div>
                    <h2 className="font-serif text-2xl font-bold text-charcoal">Contact Info</h2>
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="space-y-2">
                        <Label className="text-xs font-bold uppercase tracking-wider text-charcoal/50">First Name</Label>
                        <Input 
                            value={form.firstName} 
                            onChange={e => setForm({...form, firstName: e.target.value})} 
                            required 
                            className="bg-cream/30 border-charcoal/10 rounded-xl h-12 focus:border-brandRed focus:ring-0" 
                        />
                    </div>
                    <div className="space-y-2">
                        <Label className="text-xs font-bold uppercase tracking-wider text-charcoal/50">Last Name</Label>
                        <Input 
                            value={form.lastName} 
                            onChange={e => setForm({...form, lastName: e.target.value})} 
                            required 
                            className="bg-cream/30 border-charcoal/10 rounded-xl h-12 focus:border-brandRed focus:ring-0" 
                        />
                    </div>
                    
                    <div className="space-y-2">
                        <Label className="text-xs font-bold uppercase tracking-wider text-charcoal/50">Email</Label>
                        <div className="relative">
                            <Mail className="absolute left-4 top-1/2 -translate-y-1/2 text-charcoal/30 w-4 h-4" />
                            <Input 
                                type="email" 
                                value={email} 
                                onChange={e => setEmail(e.target.value)} 
                                onBlur={validateEmailField}
                                required 
                                className={`bg-cream/30 border-charcoal/10 rounded-xl h-12 pl-10 focus:border-brandRed focus:ring-0 ${emailError ? 'border-red-500 bg-red-50' : ''}`} 
                            />
                        </div>
                        {discountStatus === "ELIGIBLE" && (
                            <p className="text-xs text-green-600 font-bold flex items-center gap-1 mt-1">
                                <CheckCircle2 size={12} /> Subscriber Discount Unlocked!
                            </p>
                        )}
                        {emailError && <p className="text-xs text-red-500 mt-1">{emailError}</p>}
                    </div>

                    <div className="space-y-2">
                        <Label className="text-xs font-bold uppercase tracking-wider text-charcoal/50">Mobile</Label>
                        <div className="relative">
                            <Phone className="absolute left-4 top-1/2 -translate-y-1/2 text-charcoal/30 w-4 h-4" />
                            <Input 
                                type="tel" 
                                value={form.phone} 
                                onChange={e => setForm({...form, phone: e.target.value})} 
                                onBlur={validatePhoneField}
                                required 
                                className="bg-cream/30 border-charcoal/10 rounded-xl h-12 pl-10 focus:border-brandRed focus:ring-0" 
                            />
                        </div>
                        {phoneError && <p className="text-xs text-red-500 mt-1">{phoneError}</p>}
                    </div>
                </div>
            </section>

            {/* 2. Shipping Address */}
            <section className="bg-white p-8 rounded-[2rem] border border-charcoal/5 shadow-sm">
                <div className="flex items-center gap-3 mb-6">
                    <div className="w-8 h-8 rounded-full bg-brandRed/10 flex items-center justify-center text-brandRed"><MapPin size={16} /></div>
                    <h2 className="font-serif text-2xl font-bold text-charcoal">Delivery Details</h2>
                </div>

                <div className="space-y-6">
                    <div className="space-y-2">
                        <Label className="text-xs font-bold uppercase tracking-wider text-charcoal/50">Address</Label>
                        <Input 
                            value={form.address} 
                            onChange={e => setForm({...form, address: e.target.value})} 
                            required 
                            className="bg-cream/30 border-charcoal/10 rounded-xl h-12 focus:border-brandRed focus:ring-0"
                            placeholder="House No, Street Name" 
                        />
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div className="space-y-2">
                            <Label className="text-xs font-bold uppercase tracking-wider text-charcoal/50">District</Label>
                            <select
                                value={form.district}
                                onChange={e => setForm({...form, district: e.target.value, city: ""})}
                                required
                                className="w-full bg-cream/30 border border-charcoal/10 rounded-xl h-12 px-4 focus:border-brandRed focus:ring-0 text-sm"
                            >
                                <option value="">Select District</option>
                                {Object.keys(DISTRICTS).map(d => <option key={d} value={d}>{d}</option>)}
                            </select>
                        </div>

                        <div className="space-y-2">
                            <Label className="text-xs font-bold uppercase tracking-wider text-charcoal/50">City</Label>
                            <select
                                value={form.city}
                                onChange={e => setForm({...form, city: e.target.value})}
                                required
                                disabled={!form.district}
                                className="w-full bg-cream/30 border border-charcoal/10 rounded-xl h-12 px-4 focus:border-brandRed focus:ring-0 text-sm disabled:opacity-50"
                            >
                                <option value="">Select City</option>
                                {form.district && DISTRICTS[form.district]?.map(c => <option key={c} value={c}>{c}</option>)}
                            </select>
                        </div>
                    </div>

                    <div className="space-y-2">
                        <Label className="text-xs font-bold uppercase tracking-wider text-charcoal/50">Delivery Instructions (Optional)</Label>
                        <Textarea 
                            value={form.notes} 
                            onChange={e => setForm({...form, notes: e.target.value})} 
                            className="bg-cream/30 border-charcoal/10 rounded-xl focus:border-brandRed focus:ring-0 min-h-[100px]" 
                            placeholder="Gate code, landmark, etc."
                        />
                    </div>
                </div>
            </section>
        </div>


        {/* --- RIGHT COLUMN: SUMMARY & PAYMENT --- */}
        <div className="lg:col-span-1">
            <div className="sticky top-8 space-y-6">
                
                {/* Order Summary Card */}
                <div className="bg-white p-6 rounded-[2.5rem] border border-charcoal/5 shadow-xl relative overflow-hidden">
                    <div className="absolute top-0 right-0 w-32 h-32 bg-brandRed/5 rounded-full blur-3xl -mr-16 -mt-16 pointer-events-none"></div>
                    
                    <h3 className="font-serif text-xl font-black text-charcoal mb-6">Order Summary</h3>

                    {/* Scrollable Item List */}
                    <div className="max-h-[240px] overflow-y-auto pr-2 mb-6 scrollbar-thin scrollbar-thumb-charcoal/10">
                        {items.map((item) => (
                            <div key={item.itemKey} className="flex gap-4 mb-4 items-center">
                                <div className="relative w-12 h-12 bg-cream rounded-lg overflow-hidden flex-shrink-0 border border-charcoal/5">
                                    <Image 
                                        src={urlFor(item.product.mainImage || item.product.images?.[0]).url()} 
                                        alt={item.product.name} 
                                        fill 
                                        className="object-cover" 
                                    />
                                    <div className="absolute bottom-0 right-0 bg-charcoal text-cream text-[9px] px-1.5 font-bold rounded-tl-md">
                                        x{item.quantity}
                                    </div>
                                </div>
                                <div className="flex-1 min-w-0">
                                    <p className="text-xs font-bold text-charcoal truncate">{item.product.name}</p>
                                    <p className="text-[10px] text-charcoal/50 truncate">
                                        {item.bundleTitle || "Single Pack"}
                                    </p>
                                </div>
                                <PriceFormatter amount={(item.product.price ?? 0) * item.quantity} className="text-sm font-medium" />
                            </div>
                        ))}
                    </div>

                    <Separator className="bg-charcoal/10 mb-6" />

                    {/* Promo Code */}
                    {/* <div className="mb-6">
                        <div className="flex gap-2">
                            <div className="relative flex-1">
                                <Tag className="absolute left-3 top-1/2 -translate-y-1/2 text-charcoal/30 w-3.5 h-3.5" />
                                <Input 
                                    placeholder="Promo Code" 
                                    value={promoCodeInput}
                                    onChange={e => setPromoCodeInput(e.target.value)}
                                    disabled={discountStatus === "ELIGIBLE"}
                                    className="h-10 pl-8 text-xs bg-cream/30 border-charcoal/10 rounded-lg focus:border-brandRed focus:ring-0"
                                />
                            </div>
                            <Button 
                                onClick={handleApplyPromo}
                                disabled={promoStatus === "CHECKING" || discountStatus === "ELIGIBLE"}
                                size="sm" 
                                className="bg-charcoal text-white rounded-lg h-10 px-4 text-xs font-bold hover:bg-black"
                            >
                                {promoStatus === "CHECKING" ? "..." : "Apply"}
                            </Button>
                        </div>
                        {promoError && <p className="text-[10px] text-red-500 mt-1.5 pl-1">{promoError}</p>}
                        {promoStatus === "APPLIED" && <p className="text-[10px] text-green-600 mt-1.5 pl-1 font-bold">Promo Applied!</p>}
                    </div> */}

                    {/* Calculations */}
                    <div className="space-y-3 mb-6">
                        <div className="flex justify-between text-xs text-charcoal/60">
                            <span>Subtotal</span>
                            <PriceFormatter amount={subtotal} />
                        </div>
                        
                        {(isSubscriberDiscount || isPromoDiscount) && (
                            <div className="flex justify-between text-xs font-bold text-green-600 bg-green-50 px-2 py-1 rounded-md">
                                <span>{discountLabel}</span>
                                <span>- Rs. {discountAmount.toLocaleString()}</span>
                            </div>
                        )}

                        <div className="flex justify-between text-xs text-charcoal/60">
                            <span>Shipping</span>
                            <span>{shippingCost === 0 ? (form.city ? "Calculating..." : "--") : `Rs. ${shippingCost}`}</span>
                        </div>
                    </div>

                    <Separator className="bg-charcoal/10 mb-6" />

                    <div className="flex justify-between items-end mb-8">
                        <span className="font-serif text-lg font-bold text-charcoal">Total</span>
                        <PriceFormatter amount={total} className="text-xl font-black text-brandRed" />
                    </div>

                    {/* Payment Method */}
                    <div className="mb-6">
                        <Label className="text-xs font-bold uppercase tracking-wider text-charcoal/50 mb-3 block">Payment Method</Label>
                        <RadioGroup defaultValue="COD" onValueChange={v => setForm({...form, payment: v})} className="grid grid-cols-1 gap-3">
                            <div>
                                <RadioGroupItem value="COD" id="cod" className="peer sr-only" />
                                <Label htmlFor="cod" className="flex items-center justify-between p-4 rounded-xl border border-charcoal/10 bg-white hover:bg-cream/30 peer-data-[state=checked]:border-brandRed peer-data-[state=checked]:bg-brandRed/5 cursor-pointer transition-all">
                                    <div className="flex items-center gap-3">
                                        <Truck className="w-5 h-5 text-charcoal/60" />
                                        <span className="font-bold text-sm text-charcoal">Cash On Delivery</span>
                                    </div>
                                    <div className="w-4 h-4 rounded-full border border-charcoal/20 peer-data-[state=checked]:bg-brandRed peer-data-[state=checked]:border-brandRed"></div>
                                </Label>
                            </div>
                            <div>
                                <RadioGroupItem value="BANK" id="bank" className="peer sr-only" />
                                <Label htmlFor="bank" className="flex items-center justify-between p-4 rounded-xl border border-charcoal/10 bg-white hover:bg-cream/30 peer-data-[state=checked]:border-brandRed peer-data-[state=checked]:bg-brandRed/5 cursor-pointer transition-all">
                                    <div className="flex items-center gap-3">
                                        <CreditCard className="w-5 h-5 text-charcoal/60" />
                                        <span className="font-bold text-sm text-charcoal">Bank Transfer</span>
                                    </div>
                                    <div className="w-4 h-4 rounded-full border border-charcoal/20 peer-data-[state=checked]:bg-brandRed peer-data-[state=checked]:border-brandRed"></div>
                                </Label>
                            </div>
                        </RadioGroup>
                    </div>

                    {/* Terms */}
                    <div className="flex items-start gap-2 mb-6">
                        <input type="checkbox" id="terms" required className="mt-1 w-4 h-4 rounded border-charcoal/20 text-brandRed focus:ring-brandRed" />
                        <label htmlFor="terms" className="text-[10px] text-charcoal/60 leading-tight">
                            I agree to the <a href="/terms" className="underline hover:text-brandRed">Terms of Service</a> & <a href="/privacy" className="underline hover:text-brandRed">Privacy Policy</a>.
                        </label>
                    </div>

                    {/* Submit */}
                    <Button 
                        type="submit" 
                        disabled={isPlacingOrder}
                        className="w-full bg-brandRed hover:bg-brandRed/90 text-cream font-serif font-bold text-lg h-14 rounded-2xl shadow-[4px_4px_0px_0px_#4A3728] hover:shadow-[2px_2px_0px_0px_#4A3728] hover:translate-y-[2px] transition-all"
                    >
                        {isPlacingOrder ? "Processing..." : "Place Order"}
                    </Button>

                    <div className="mt-4 flex items-center justify-center gap-2 text-charcoal/40">
                        <ShieldCheck size={12} />
                        <span className="text-[10px] font-bold uppercase tracking-widest">Secure SSL Encrypted</span>
                    </div>
                </div>
            </div>
        </div>

      </form>
    </Container>
  );
}