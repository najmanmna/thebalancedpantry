import { Category } from "@/sanity.types";
import Container from "./Container";
import Title from "./Title";
import Link from "next/link";
import Image from "next/image";
import { urlFor } from "@/sanity/lib/image";

interface Props {
  categories: Category[];
}



const HomeCategories = ({ categories }: Props) => {
  return (
    <Container className="w-full rounded-md py-20">
   
      <div className="text-center space-y-1.5 mb-5 md:mb-20">
        <Title className="text-4xl ">SHOP BY CATEGORY</Title>
        <p className="text-base font-medium md:text-sm">
           Find Your Perfect Bag from Our Featured Collections!
        </p>
      </div>
      <div className="mt-20 grid grid-cols-2 md:grid-cols-5 gap-2.5">
        {categories?.map((category) => (
          <div
            key={category?._id}
            className="bg-white p-5 flex flex-col items-center gap-3 group rounded-lg border border-transparent hover:border-tech_orange hoverEffect"
          >
            {category?.image && (
              <div className="overflow-hidden w-14 h-14 md:w-24 md:h-24">
                <Link href={`/category/${category?.slug?.current}`}>
                  <Image
                    src={urlFor(category?.image).url()}
                    alt="categoryImage"
                    width={500}
                    height={500}
                    className="w-full h-full"
                  />
                </Link>
              </div>
            )}

            <p className="text-xs md:text-sm font-semibold text-center line-clamp-1">
              {category?.title}
            </p>
          </div>
        ))}
      </div>
    </Container>
  );
};

export default HomeCategories;
