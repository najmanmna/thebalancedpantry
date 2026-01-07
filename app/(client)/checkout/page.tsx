"use client";

import { useEffect, useState, useRef } from "react";
import { useRouter } from "next/navigation";
import useCartStore from "@/store";
import PriceFormatter from "@/components/PriceFormatter";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Separator } from "@/components/ui/separator";
import { client } from "@/sanity/lib/client";
import { urlFor } from "@/sanity/lib/image";
import Image from "next/image";
import toast from "react-hot-toast";
import Container from "@/components/Container";
import { DISTRICTS } from "@/constants/SrilankaDistricts";
import Loading from "@/components/Loading"; 

// --- START: Promo Code Interface ---
interface SanityPromoCode {
  _id: string;
  code: string;
  isActive: boolean;
  discountPercentage: number;
  minOrderAmount: number;
  firstOrderOnly: boolean;
  isFreeShipping: boolean;
}
// --- END: Promo Code Interface ---

const DISCOUNT_ELIGIBILITY_DATE = "2025-11-05T00:00:00Z";

const SHIPPING_QUERY = `*[_type == "settings"][0]{
  deliveryCharges {
    colombo,
    suburbs,
    others
  }
}`;

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

  // --- START: All Discount States ---
  const [discountStatus, setDiscountStatus] = useState<
    "IDLE" | "CHECKING" | "ELIGIBLE" | "ALREADY_USED" | "NOT_ELIGIBLE"
  >("IDLE");

  const [promoCodeInput, setPromoCodeInput] = useState("");
  const [promoStatus, setPromoStatus] = useState<
    "IDLE" | "CHECKING" | "APPLIED" | "ERROR"
  >("IDLE");
  const [promoError, setPromoError] = useState<string | null>(null);
  const [appliedPromoCode, setAppliedPromoCode] = useState<SanityPromoCode | null>(null);
  // --- END: All Discount States ---

  const [emailError, setEmailError] = useState<string | null>(null);
  const [phoneError, setPhoneError] = useState<string | null>(null);

  // --- START: Validation Helpers ---
  const isValidEmail = (email: string): boolean => {
    if (!email) return false;
    return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
  };

  const isValidPhone = (phone: string): boolean => {
    if (!phone) return false;
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
      setPhoneError("Please enter a valid 10-digit (07...) or 11-digit (+947...) number.");
      return false;
    }
    setPhoneError(null);
    return true;
  };
  // --- END: Validation Helpers ---

  useEffect(() => {
    const normalizedEmail = email.toLowerCase();
    const validEmail = isValidEmail(normalizedEmail);
    const validPhone = isValidPhone(form.phone);

    if (!validEmail && !validPhone) {
      setDiscountStatus("IDLE");
      return;
    }

    const handler = setTimeout(() => {
      async function checkFullDiscountLogic() {
        setDiscountStatus("CHECKING");
        try {
          const orderClauses = [];
          const queryParams: any = {
            discountDate: DISCOUNT_ELIGIBILITY_DATE,
          };

          let subscriberCheckQuery = "false";

          if (validEmail) {
            orderClauses.push("email == $email");
            queryParams.email = normalizedEmail;
            subscriberCheckQuery = `count(*[_type == "subscribers" && email == $email && _createdAt < $discountDate]) > 0`;
          }
          if (validPhone) {
            orderClauses.push("phone == $phone");
            queryParams.phone = form.phone;
          }

          const orderCountQuery =
            orderClauses.length > 0
              ? `count(*[_type == "order" && (${orderClauses.join(" || ")}) && status != "cancelled"])`
              : "0";

          const data = await client.fetch(
            `{
              "isEarlySubscriber": ${subscriberCheckQuery},
              "orderCount": ${orderCountQuery}
            }`,
            queryParams
          );

          if (data.isEarlySubscriber) {
            if (data.orderCount === 0) {
              setDiscountStatus("ELIGIBLE");
            } else {
              setDiscountStatus("ALREADY_USED");
            }
          } else {
            setDiscountStatus("NOT_ELIGIBLE");
          }
        } catch (err) {
          console.error("Failed to check discount eligibility:", err);
          setDiscountStatus("IDLE");
        }
      }
      checkFullDiscountLogic();
    }, 500);

    return () => clearTimeout(handler);
  }, [email, form.phone]);

  useEffect(() => {
    async function fetchShipping() {
      try {
        const data = await client.fetch(SHIPPING_QUERY);
        setDeliveryCharges(data?.deliveryCharges ?? null);
      } catch (err) {
        console.error("Failed to fetch shipping:", err);
      }
    }
    fetchShipping();
  }, []);

  useEffect(() => {
    if (appliedPromoCode?.isFreeShipping) {
      setShippingCost(0);
      return;
    }

    if (!deliveryCharges || !form.district || !form.city) return;

    let fee = deliveryCharges.others;

    if (form.district === "Colombo") {
      if (colomboCityAreas.includes(form.city)) {
        fee = deliveryCharges.colombo;
      } else if (colomboSuburbs.includes(form.city)) {
        fee = deliveryCharges.suburbs;
      } else {
        fee = deliveryCharges.others;
      }
    }

    setShippingCost(fee);
  }, [form.district, form.city, deliveryCharges, appliedPromoCode]);

  useEffect(() => {
    if (items.length === 0) {
      router.push("/cart");
    }
  }, [items, router]);

  const subtotal = items.reduce(
    (t, it) => t + (it.product.price ?? 0) * it.quantity,
    0
  );

  useEffect(() => {
    if (appliedPromoCode && subtotal < appliedPromoCode.minOrderAmount) {
      setAppliedPromoCode(null);
      setPromoStatus("ERROR");
      setPromoError(`Promo removed: order total is now below Rs. ${appliedPromoCode.minOrderAmount}.`);
      toast.error(`Promo code '${appliedPromoCode.code}' removed (minimum not met).`);
    }
  }, [subtotal, appliedPromoCode]);

  useEffect(() => {
    if (discountStatus === "ELIGIBLE" && appliedPromoCode) {
      setAppliedPromoCode(null);
      setPromoStatus("ERROR");
      setPromoError("The 15% subscriber discount has been auto-applied instead.");
      toast.success("Subscriber discount applied!");
    }
  }, [discountStatus, appliedPromoCode]);

  useEffect(() => {
    setAppliedPromoCode(null);
    setPromoStatus("IDLE");
    setPromoError(null);
  }, [email]);

  const totalBeforeDiscount = subtotal;
  const isSubscriberDiscount = discountStatus === "ELIGIBLE";
  
  const isPromoDiscount =
    appliedPromoCode &&
    !isSubscriberDiscount &&
    subtotal >= appliedPromoCode.minOrderAmount;

  let discountAmount = 0;
  let discountLabel = "";

  if (isSubscriberDiscount) {
    discountAmount = totalBeforeDiscount * 0.15;
    discountLabel = "Subscriber Discount (15%)";
  } else if (isPromoDiscount) {
    if (appliedPromoCode.isFreeShipping) {
      discountAmount = 0; 
      discountLabel = `Free Shipping Applied (${appliedPromoCode.code})`;
    } else {
      const percent = (appliedPromoCode.discountPercentage || 0) / 100;
      discountAmount = totalBeforeDiscount * percent;
      discountLabel = `Promo Code '${appliedPromoCode.code}' (${appliedPromoCode.discountPercentage}%)`;
    }
  }

  const total = totalBeforeDiscount - discountAmount + shippingCost;

  const handleApplyPromo = async () => {
    setPromoStatus("CHECKING");
    setPromoError(null);
    setAppliedPromoCode(null);

    const code = promoCodeInput.trim().toUpperCase();
    if (!code) {
      setPromoStatus("ERROR");
      setPromoError("Please enter a promo code.");
      return;
    }

    const isEmailFormatValid = validateEmailField();
    const isPhoneFormatValid = validatePhoneField();

    if (!email) {
      setPromoStatus("ERROR");
      setPromoError("Please enter your email address to apply a code.");
      return;
    }
    if (!form.phone) {
      setPromoStatus("ERROR");
      setPromoError("Please enter your phone number to apply a code.");
      return;
    }

    if (!isEmailFormatValid || !isPhoneFormatValid) {
      setPromoStatus("ERROR");
      setPromoError("Please fix the errors in your billing details.");
      return;
    }

    try {
      const promo = await client.fetch<SanityPromoCode | null>(
        `*[_type == "promoCode" && code == $code][0]`,
        { code }
      );

      if (!promo) {
        setPromoStatus("ERROR");
        setPromoError("Invalid promo code.");
        return;
      }
      if (!promo.isActive) {
        setPromoStatus("ERROR");
        setPromoError("This promo code is currently inactive.");
        return;
      }

      if (subtotal < promo.minOrderAmount) {
        setPromoStatus("ERROR");
        setPromoError(`This code requires a minimum order of Rs. ${promo.minOrderAmount}.`);
        return;
      }

      if (discountStatus === "ELIGIBLE") {
        setPromoStatus("ERROR");
        setPromoError("Your 15% subscriber discount is already applied!");
        return;
      }

      if (promo.firstOrderOnly) {
        const orderClauses = ["email == $email", "phone == $phone"];
        const queryParams = {
          email: email.toLowerCase(),
          phone: form.phone,
        };

        const orderCount = await client.fetch(
          `count(*[_type == "order" && (${orderClauses.join(" || ")}) && status != "cancelled"])`,
          queryParams
        );

        if (orderCount > 0) {
          setPromoStatus("ERROR");
          setPromoError("This promo code is for first-time orders only.");
          return;
        }
      }

      setPromoStatus("APPLIED");
      setAppliedPromoCode(promo);
      toast.success(`Promo code '${promo.code}' applied!`);
    } catch (err) {
      console.error("Promo check failed:", err);
      setPromoStatus("ERROR");
      setPromoError("Could not validate promo code. Please try again.");
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    const isEmailFormatValid = validateEmailField();
    const isPhoneFormatValid = validatePhoneField();

    if (!isEmailFormatValid || !isPhoneFormatValid) {
      toast.error("Please fix the errors in your billing details.");
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
        // 🔹 SIMPLIFIED PAYLOAD (Removed variant/variantKey)
        items: items.map((i) => ({
          product: { _id: i.product._id }, // Reference only ID
          quantity: i.quantity,
          price: i.product.price, // For Snapshot
          productName: i.product.name, // For Snapshot
          // Send image asset if available
          productImage: i.product.images?.[0] 
        })),
      };

      const res = await fetch("/api/checkout", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      const data = await res.json();

      if (!res.ok) {
        if (res.status === 409) {
          toast.error(data.error || "Some items are out of stock.");
        } else {
          toast.error(data.error || "Checkout failed.");
        }

        placingRef.current = false;
        setIsPlacingOrder(false);
        return;
      }
      window.scrollTo(0, 0);

      toast.success("Order placed successfully!");
      sessionStorage.setItem("orderPlaced", "true");

      router.replace(
        `/success?orderNumber=${data.orderId}&payment=${form.payment}&total=${total}`
      );

      setTimeout(() => {
        if (window.location.pathname !== "/success") {
          window.location.href = `/success?orderNumber=${data.orderId}&payment=${form.payment}&total=${total}`;
        }
      }, 2000);
    } catch (err) {
      console.error("❌ Checkout error:", err);
      toast.error("Failed to place order.");
      placingRef.current = false;
      setIsPlacingOrder(false);
    }
  };

  return (
    <Container className="py-10 ">
      {isPlacingOrder && <Loading />}
      <form
        onSubmit={handleSubmit}
        className="space-y-6 grid grid-cols-1 lg:grid-cols-2 gap-8"
      >
        {/* LEFT: Form Inputs */}
        <div>
          <Card>
            <CardHeader>
              <CardTitle>Billing Details</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label>First Name *</Label>
                  <Input
                    value={form.firstName}
                    onChange={(e) => setForm({ ...form, firstName: e.target.value })}
                    required
                  />
                </div>
                <div>
                  <Label>Last Name *</Label>
                  <Input
                    value={form.lastName}
                    onChange={(e) => setForm({ ...form, lastName: e.target.value })}
                    required
                  />
                </div>
              </div>

              <div>
                <Label>Address *</Label>
                <Input
                  value={form.address}
                  onChange={(e) => setForm({ ...form, address: e.target.value })}
                  required
                />
              </div>

              <div>
                <Label htmlFor="district">District *</Label>
                <select
                  id="district"
                  className="w-full border rounded-md p-2"
                  value={form.district}
                  onChange={(e) =>
                    setForm((prev) => ({
                      ...prev,
                      district: e.target.value,
                      city: "",
                    }))
                  }
                  required
                >
                  <option value="">Select District</option>
                  {Object.keys(DISTRICTS).map((district) => (
                    <option key={district} value={district}>
                      {district}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <Label htmlFor="city">Town / City *</Label>
                <select
                  id="city"
                  className="w-full border rounded-md p-2"
                  value={form.city}
                  onChange={(e) =>
                    setForm((prev) => ({
                      ...prev,
                      city: e.target.value,
                    }))
                  }
                  disabled={!form.district}
                  required
                >
                  <option value="">Select City</option>
                  {form.district &&
                    DISTRICTS[form.district]?.map((city) => (
                      <option key={city} value={city}>
                        {city}
                      </option>
                    ))}
                </select>
              </div>

              <div>
                <Label>Phone *</Label>
                <Input
                  type="tel"
                  value={form.phone}
                  onChange={(e) => setForm({ ...form, phone: e.target.value })}
                  onBlur={validatePhoneField}
                  required
                  placeholder="e.g., +94771234567 or 0712345678"
                />
                {phoneError && (
                  <p className="text-red-600 text-sm mt-1">{phoneError}</p>
                )}
              </div>
              <div>
                <div className="flex justify-between">
                  <Label>Alternative Phone</Label>
                  <span className="text-xs text-gray-400">(Optional)</span>
                </div>
                <Input
                  type="tel"
                  value={form.alternativePhone}
                  onChange={(e) =>
                    setForm({ ...form, alternativePhone: e.target.value })
                  }
                  placeholder="Home or second mobile"
                />
              </div>

              <div>
                <Label>Email *</Label>
                <Input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  onBlur={validateEmailField}
                  required
                />
                {discountStatus === "CHECKING" && (
                  <div className="text-gray-500 font-medium text-sm mt-2">
                    Checking for discounts...
                  </div>
                )}
                {discountStatus === "ELIGIBLE" && (
                  <div className="text-green-700 font-medium text-sm mt-2">
                    🎉 Welcome! First-order subscriber discount applied (15% off).
                  </div>
                )}
                {discountStatus === "ALREADY_USED" && (
                  <div className="text-blue-700 font-medium text-sm mt-2">
                    Welcome back, early subscriber! (First-order discount already used).
                  </div>
                )}
                {emailError && (
                  <p className="text-red-600 text-sm mt-1">{emailError}</p>
                )}
              </div>

              <div>
                <Label>Order Notes (optional)</Label>
                <Textarea
                  value={form.notes}
                  onChange={(e) => setForm({ ...form, notes: e.target.value })}
                />
              </div>
            </CardContent>
          </Card>
        </div>

        {/* RIGHT: Order Summary */}
        <div>
          <div className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Your Order</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {items.map(({ product, quantity, itemKey }) => {
                  // 🔹 SIMPLIFIED: Use top-level image only
                  const imageSource = product.images?.[0];
                  const imageUrl = imageSource
                    ? urlFor(imageSource).url()
                    : "/fallback.png";

                  return (
                    <div
                      key={itemKey}
                      className="flex justify-between items-center border-b pb-2"
                    >
                      <div className="flex items-center space-x-3">
                        <Image
                          src={imageUrl}
                          alt={product?.name || "Product image"}
                          width={50}
                          height={50}
                          className="rounded-md border object-cover"
                        />
                        <div>
                          <p className="text-sm font-medium">{product?.name}</p>
                          <p className="text-xs text-gray-500">x {quantity}</p>
                        </div>
                      </div>
                      <PriceFormatter
                        amount={(product.price ?? 0) * quantity}
                      />
                    </div>
                  );
                })}

                {/* Promo Code Input */}
                <div className="space-y-2 pt-2">
                  <div className="flex gap-2">
                    <Input
                      placeholder="Promo code"
                      value={promoCodeInput}
                      onChange={(e) => setPromoCodeInput(e.target.value)}
                      disabled={discountStatus === "ELIGIBLE"}
                    />
                    <Button
                      type="button"
                      onClick={handleApplyPromo}
                      disabled={
                        promoStatus === "CHECKING" ||
                        discountStatus === "ELIGIBLE"
                      }
                      className="w-24"
                    >
                      {promoStatus === "CHECKING" ? "..." : "Apply"}
                    </Button>
                  </div>
                  {promoStatus === "ERROR" && promoError && (
                    <p className="text-red-600 text-sm">{promoError}</p>
                  )}
                  {promoStatus === "APPLIED" && appliedPromoCode && (
                    <p className="text-green-600 text-sm">
                      Code '{appliedPromoCode.code}' applied!
                    </p>
                  )}
                </div>

                <div className="flex justify-between">
                  <span>Subtotal</span>
                  <PriceFormatter amount={subtotal} />
                </div>

                {/* Discount Display */}
                {(isSubscriberDiscount || isPromoDiscount) && (
                  <div className="flex justify-between text-green-600 font-semibold">
                    <span>{discountLabel}</span>
                    <span>- Rs. {discountAmount.toFixed(2)}</span>
                  </div>
                )}

                <div className="flex justify-between items-center">
                  <span>Shipping</span>
                  {appliedPromoCode?.isFreeShipping ? (
                    <span className="text-green-600 font-bold flex flex-col items-end">
                      <span>FREE</span>
                      <span className="text-[10px] bg-green-100 px-2 py-0.5 rounded-full">
                        {appliedPromoCode.code}
                      </span>
                    </span>
                  ) : (
                    <span>
                      {shippingCost === 0 ? "FREE" : `Rs. ${shippingCost}`}
                    </span>
                  )}
                </div>

                <div className="text-xs text-gray-500">
                  Estimated Delivery: 3-5 Working Days
                </div>

                <Separator />

                <div className="flex justify-between font-semibold text-lg">
                  <span>Total</span>
                  <PriceFormatter amount={total} />
                </div>
              </CardContent>
            </Card>

            {/* Payment */}
            <Card>
              <CardHeader>
                <CardTitle>Payment Method</CardTitle>
              </CardHeader>
              <CardContent>
                <RadioGroup
                  defaultValue="COD"
                  onValueChange={(v) => setForm({ ...form, payment: v })}
                >
                  <div className="flex items-center space-x-4">
                    <RadioGroupItem value="COD" id="cod" />
                    <Label htmlFor="cod" className="text-base">
                      Cash on Delivery (COD)
                    </Label>
                  </div>
                  <div className="flex items-center space-x-4">
                    <RadioGroupItem value="BANK" id="bank" />
                    <Label htmlFor="bank" className="text-base">
                      Bank Transfer
                    </Label>
                  </div>
                </RadioGroup>

                {form.payment === "BANK" && (
                  <div className="mt-4 p-3 rounded-md border bg-gray-50 text-sm text-gray-700">
                    <p className="font-medium mb-2">
                      You’ll get bank details after order placement.
                    </p>
                    <p className="mt-2 text-xs text-gray-600 italic">
                      ⚠️ Please mention your <strong>name</strong> or{" "}
                      <strong>Order Number </strong>
                      as the payment reference when doing the transfer.
                    </p>
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Terms */}
            <Card>
              <CardContent className="space-y-3 py-5">
                <p className="text-sm text-gray-600">
                  Your personal data will only be used to process your order,
                  support your experience throughout this website, and for other
                  purposes described in our{" "}
                  <a
                    href="/privacy-policy"
                    className="text-blue-600 underline hover:text-blue-800"
                    target="_blank"
                  >
                    Privacy Policy
                  </a>.
                </p>

                <div className="flex items-center space-x-2">
                  <input
                    type="checkbox"
                    id="terms"
                    required
                    className="h-4 w-4"
                  />
                  <Label htmlFor="terms" className="text-sm">
                    I agree to the website{" "}
                    <a
                      href="/terms-and-conditions"
                      className="text-blue-600 underline hover:text-blue-800"
                      target="_blank"
                    >
                      Terms of Service
                    </a>.
                  </Label>
                </div>
              </CardContent>
            </Card>

            <Button
              type="submit"
              disabled={isPlacingOrder}
              className="w-full font-semibold tracking-wide mx-2 mt-4 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isPlacingOrder ? "Placing Order..." : "Confirm Order"}
            </Button>
          </div>
        </div>
      </form>
    </Container>
  );
}