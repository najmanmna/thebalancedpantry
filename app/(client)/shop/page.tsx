import Container from "@/components/Container";
import CategoryProducts from "@/components/CategoryProducts";
import Title from "@/components/Title";
import { getCategories, getMaterials } from "@/sanity/queries";
import React from "react";

export const revalidate = 0;

const ShopPage = async () => {
  // 1. Fetch data on the server
  const categories = await getCategories();
  const materials = await getMaterials();

  return (
    <Container className="py-5">
      {/* <Title className="text-3xl font-bold mb-8 text-center">
        All Products
      </Title> */}
      
      {/* 2. Pass data to the powerful component
          slug="all" tells it to load everything initially 
      */}
      <CategoryProducts
        categories={categories}
        slug="all"
        materials={materials}
      />
    </Container>
  );
};

export default ShopPage;