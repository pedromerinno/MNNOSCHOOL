import { ComponentPlayground } from "@/components/ui/component-playground";
import { Typewriter } from "@/components/ui/typewriter-text";

const ComponentPlaygroundDemo = () => {
  const usageCode = `import { Typewriter } from "@/components/ui/typewriter-text";

function Example() {
  return (
    <Typewriter
      text={["Welcome to HextaUI", "Build awesome web"]}
      speed={100}
      loop={true}
      className="text-2xl font-bold"
    />
  );
}`;

  return (
    <ComponentPlayground
      breadcrumbs={[
        { label: "Components" },
        { label: "Hextaui" },
        { label: "Typewriter Text" },
      ]}
      title="Typewriter Text"
      description="Animated Text component that types itself out like a typewriter."
      creator={{
        name: "HextaUI",
        handle: "hextaui",
        logo: "H",
      }}
      installation={{
        command: "npx shadcn@latest add https://21st.dev/r/preetsuthar17/typewrit",
      }}
      usage={{
        code: usageCode,
        prompt: "Create a typewriter text component",
      }}
      website="hextaui.com/docs/text/typewriter"
      createdDate="17/01/2025"
      updatedDate="17/01/2025"
      preview={
        <div className="flex items-center justify-center min-h-[400px]">
          <Typewriter
            text={["Welcome to HextaUI", "Build awesome web"]}
            speed={100}
            loop={true}
            className="text-4xl font-bold text-gray-900 dark:text-gray-50"
          />
        </div>
      }
    />
  );
};

export default ComponentPlaygroundDemo;

