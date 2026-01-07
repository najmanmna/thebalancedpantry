import { twMerge } from "tailwind-merge";

interface Props {
  amount: number | undefined;
  className?: string;
}

const PriceFormatter = ({ amount, className }: Props) => {
  if (amount == null) return null;

  const formattedPrice = new Intl.NumberFormat("en-US", {
    currency: "LKR",
    style: "currency",
    minimumFractionDigits: 0,
  }).format(amount);

  return (
    <span
      className={twMerge(
        "text-sm font-semibold", // base styles
        className ?? "text-tech_dark_color" // default color, can be overridden
      )}
    >
      {formattedPrice}
    </span>
  );
};

export default PriceFormatter;
