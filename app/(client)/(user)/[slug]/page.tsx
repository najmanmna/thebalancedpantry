import React from "react";
import { client } from "@/sanity/lib/client";
import Container from "@/components/Container";
import { PortableText, PortableTextComponents } from "@portabletext/react";

const components: PortableTextComponents = {
  block: {
    normal: ({ children }) => (
      <p className="leading-relaxed whitespace-pre-wrap mb-4">
        {Array.isArray(children)
          ? children.map((child, i) =>
              typeof child === "string"
                ? child.split("\n").map((line, j) => (
                    <React.Fragment key={`${i}-${j}`}>
                      {line}
                      {j < child.split("\n").length - 1 && <br />}
                    </React.Fragment>
                  ))
                : child
            )
          : children}
      </p>
    ),
    h1: ({ children }) => (
      <h1 className="text-3xl font-bold mt-8 mb-4">{children}</h1>
    ),
    h2: ({ children }) => (
      <h2 className="text-2xl font-bold mt-6 mb-3">{children}</h2>
    ),
    h3: ({ children }) => (
      <h3 className="text-xl font-semibold mt-4 mb-2">{children}</h3>
    ),
  },
  list: {
    bullet: ({ children }) => (
      <ul className="list-disc pl-6 my-3 space-y-1">{children}</ul>
    ),
    number: ({ children }) => (
      <ol className="list-decimal pl-6 my-3 space-y-1">{children}</ol>
    ),
  },
  listItem: {
    bullet: ({ children }) => <li>{children}</li>,
    number: ({ children }) => <li>{children}</li>,
  },
  marks: {
    strong: ({ children }) => <strong>{children}</strong>,
    em: ({ children }) => <em>{children}</em>,
    code: ({ children }) => (
      <code className="bg-gray-100 px-1 rounded">{children}</code>
    ),
  },
};

const PAGE_QUERY = `*[_type == "page" && slug.current == $slug][0]{
  title,
  content
}`;

export default async function Page({ params }: { params: { slug: string } }) {
  const data = await client.fetch(PAGE_QUERY, { slug: params.slug });

  if (!data) return <div className="p-8">Page not found</div>;

  return (
    <main className="bg-tech_white">
      <section>
        <Container className="max-w-6xl px-4 lg:px-8 py-12">
          <h1 className="text-3xl font-bold mb-6">{data.title}</h1>
          <div className="prose prose-gray max-w-5xl">
            <PortableText value={data.content} components={components} />
          </div>
        </Container>
      </section>
    </main>
  );
}
