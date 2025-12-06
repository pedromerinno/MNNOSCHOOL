import { ArticleCard } from "@/components/ui/blog-post-card";

/**
 * Example usage of the ArticleCard component
 * This can be used as inspiration for document cards
 */
export default function ArticleCardExample() {
  return (
    <div className="flex w-full justify-center p-6 bg-background">
      <ArticleCard
        headline="Shaping Tomorrow: AI & The Web"
        excerpt="From automated coding assistants to intelligent design workflows, AI is redefining how developers build and ship modern applications."
        cover="https://images.unsplash.com/photo-1677442136019-21780ecad995?w=800&h=450&fit=crop"
        tag="Innovation"
        readingTime={420}
        writer="John Doe"
        publishedAt={new Date("2025-09-01")}
      />
    </div>
  );
}





