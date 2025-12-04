"use client";

import { useEffect, useState } from "react";
import {
  Carousel,
  CarouselApi,
  CarouselContent,
  CarouselItem,
} from "@/components/ui/carousel";
import { TeamMember } from "@/hooks/team/useTeamMembersOptimized";
import { CarouselIndicators } from "@/components/ui/carousel-indicators";

export interface TeamMemberItem {
  id: string;
  name: string;
  role: string | null;
  image: string | null;
  backgroundImage?: string;
}

export interface TeamGalleryProps {
  members: TeamMember[];
  companyColor?: string;
}

// Função para obter a imagem de fundo - usa o avatar do usuário ou fallback
const getBackgroundImage = (
  avatar: string | null | undefined,
  companyColor: string,
  memberId: string
): string | null => {
  // Se o usuário tem avatar, usar como imagem de fundo
  if (avatar) {
    return avatar;
  }
  
  // Se não tem avatar, retornar null para usar gradiente como fallback
  return null;
};

// Converter membros para formato do carousel
const formatMembersForGallery = (
  members: TeamMember[], 
  companyColor: string
): TeamMemberItem[] => {
  return members.map((member) => ({
    id: member.id,
    name: member.display_name || 'Sem nome',
    role: member.roleName || member.cargo_id || null,
    image: member.avatar || null,
    backgroundImage: getBackgroundImage(member.avatar, companyColor, member.id),
  }));
};

const TeamGallery = ({
  members = [],
  companyColor = "#1EAEDB",
}: TeamGalleryProps) => {
  const [carouselApi, setCarouselApi] = useState<CarouselApi>();
  const [scrollProgress, setScrollProgress] = useState(0);

  const items = formatMembersForGallery(members, companyColor);

  useEffect(() => {
    if (!carouselApi) {
      return;
    }

    // Função para atualizar o progresso de scroll
    const updateScrollProgress = () => {
      const snapList = carouselApi.scrollSnapList();
      const selected = carouselApi.selectedScrollSnap();
      
      if (snapList.length <= 1) {
        setScrollProgress(0);
        return;
      }
      
      // Calcular progresso baseado na posição selecionada
      const progress = selected / (snapList.length - 1);
      setScrollProgress(Math.min(Math.max(progress, 0), 1));
    };

    // Atualizar progresso quando mudar de slide
    const onSelect = () => {
      updateScrollProgress();
    };

    // Atualizar progresso inicial
    updateScrollProgress();
    
    // Listener para mudanças de seleção
    carouselApi.on("select", onSelect);
    carouselApi.on("reInit", onSelect);

    // Listener para scroll (quando arrasta)
    const onScroll = () => {
      updateScrollProgress();
    };
    
    carouselApi.on("scroll", onScroll);

    return () => {
      carouselApi.off("select", onSelect);
      carouselApi.off("reInit", onSelect);
      carouselApi.off("scroll", onScroll);
    };
  }, [carouselApi]);

  // Se não houver membros, não renderizar
  if (items.length === 0) {
    return null;
  }

  return (
    <section className="w-full">
      <div className="w-full flex flex-col items-center">
        <Carousel
          setApi={setCarouselApi}
          opts={{
            align: "center",
            startIndex: Math.floor(items.length / 2),
            breakpoints: {
              "(max-width: 768px)": {
                dragFree: true,
                align: "center",
                startIndex: Math.floor(items.length / 2),
              },
            },
          }}
          className="w-full"
        >
          <CarouselContent className="ml-0 justify-center">
            {items.map((item) => (
              <CarouselItem
                key={item.id}
                className="max-w-[320px] pl-[20px] lg:max-w-[380px] xl:max-w-[420px]"
              >
                <TeamMemberCard
                  item={item}
                  companyColor={companyColor}
                />
              </CarouselItem>
            ))}
          </CarouselContent>
        </Carousel>

        {/* Indicadores de slide - usando componente padrão */}
        <div className="mt-12 lg:mt-16">
          <CarouselIndicators
            scrollProgress={scrollProgress}
            carouselApi={carouselApi}
          />
        </div>
      </div>
    </section>
  );
};

// Componente interno para o card do membro (com estado para erro de imagem)
const TeamMemberCard = ({ item, companyColor }: { item: TeamMemberItem; companyColor: string }) => {
  const [imageError, setImageError] = useState(false);
  const [hasImage] = useState(!!item.backgroundImage);

  return (
    <div className="group rounded-xl cursor-pointer">
      <div className="group relative h-full min-h-[28rem] max-w-full overflow-hidden rounded-xl md:aspect-[5/4] lg:aspect-[16/9] md:min-h-[30rem] lg:min-h-[32rem]">
        {/* Background - foto do usuário ou gradiente fallback */}
        {hasImage && !imageError ? (
          <img
            src={item.backgroundImage!}
            alt={item.name}
            className="absolute h-full w-full object-cover object-center transition-transform duration-300 group-hover:scale-105"
            onError={() => {
              setImageError(true);
            }}
          />
        ) : (
          /* Gradiente fallback baseado na cor da empresa */
          <div
            className="absolute h-full w-full bg-gradient-to-br"
            style={{
              background: `linear-gradient(135deg, ${companyColor} 0%, ${companyColor}dd 50%, ${companyColor}aa 100%)`,
            }}
          />
        )}

        {/* Overlay gradiente escuro de cima para baixo - igual ao Gallery4 */}
        <div className="absolute inset-0 h-full bg-[linear-gradient(hsl(var(--primary)/0),hsl(var(--primary)/0.4),hsl(var(--primary)/0.8)_100%)] mix-blend-multiply" />

        {/* Conteúdo do card no bottom */}
        <div className="absolute inset-x-0 bottom-0 flex flex-col items-start p-6 text-primary-foreground md:p-8">
          {/* Nome/Título */}
          <div className="mb-2 pt-4 text-2xl font-semibold md:mb-3 md:pt-4 lg:pt-4 md:text-3xl text-white">
            {item.name}
          </div>

          {/* Cargo/Role como descrição */}
          {item.role && (
            <div className="mb-8 line-clamp-2 md:mb-12 lg:mb-9 text-white/90 text-base md:text-lg">
              {item.role}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export { TeamGallery };
