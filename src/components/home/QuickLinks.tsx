
import { Card, CardContent } from "@/components/ui/card";

export const QuickLinks = () => {
  const links = [
    { icon: "checkmark", label: "Integração" },
    { icon: "options", label: "Acessos" },
    { icon: "document", label: "Documentos" },
    { icon: "school", label: "Escola", hasDropdown: true },
    { icon: "globe", label: "Comunidade", hasDropdown: true }
  ];

  return (
    <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-5 gap-4 mb-12">
      {links.map((link, index) => (
        <Card key={index} className="border-0 shadow-none bg-transparent rounded-xl">
          <CardContent className="p-6 flex items-center justify-between">
            <div className="flex items-center">
              <span className="mr-3 bg-gray-100 p-2 rounded-lg">
                {link.icon === "checkmark" && (
                  <svg className="h-5 w-5" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <path d="M9 16.17L4.83 12l-1.42 1.41L9 19 21 7l-1.41-1.41L9 16.17z" fill="currentColor" />
                  </svg>
                )}
                {link.icon === "options" && (
                  <svg className="h-5 w-5" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <path d="M12 8c1.1 0 2-.9 2-2s-.9-2-2-2-2 .9-2 2 .9 2 2 2zm0 2c-1.1 0-2 .9-2 2s.9 2 2 2 2-.9 2-2-.9-2-2-2zm0 6c-1.1 0-2 .9-2 2s.9 2 2 2 2-.9 2-2-.9-2-2-2z" fill="currentColor" />
                  </svg>
                )}
                {link.icon === "document" && (
                  <svg className="h-5 w-5" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <path d="M19 3H5c-1.1 0-2 .9-2 2v14c0 1.1.9 2 2 2h14c1.1 0 2-.9 2-2V5c0-1.1-.9-2-2-2zm-2 16H7V5h10v14z" fill="currentColor" />
                  </svg>
                )}
                {link.icon === "school" && (
                  <svg className="h-5 w-5" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <path d="M5 13.18v4L12 21l7-3.82v-4L12 17l-7-3.82zM12 3L1 9l11 6 9-4.91V17h2V9L12 3z" fill="currentColor" />
                  </svg>
                )}
                {link.icon === "globe" && (
                  <svg className="h-5 w-5" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-1 17.93c-3.95-.49-7-3.85-7-7.93 0-.62.08-1.21.21-1.79L9 15v1c0 1.1.9 2 2 2v1.93zm6.9-2.54c-.26-.81-1-1.39-1.9-1.39h-1v-3c0-.55-.45-1-1-1H8v-2h2c.55 0 1-.45 1-1V7h2c1.1 0 2-.9 2-2v-.41c2.93 1.19 5 4.06 5 7.41 0 2.08-.8 3.97-2.1 5.39z" fill="currentColor" />
                  </svg>
                )}
              </span>
              <span className="font-medium">{link.label}</span>
            </div>
            {link.hasDropdown && (
              <svg className="h-4 w-4 text-gray-400" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path d="M7 10l5 5 5-5H7z" fill="currentColor" />
              </svg>
            )}
          </CardContent>
        </Card>
      ))}
    </div>
  );
};
