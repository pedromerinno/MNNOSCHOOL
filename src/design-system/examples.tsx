/**
 * Design System - Exemplos Práticos
 * Componentes de exemplo baseados nas páginas favoritas
 */

import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarImage, AvatarFallback } from '@/components/ui/avatar';
import { ArrowRight, Play } from 'lucide-react';
import { getPageBackgroundClasses, getCardClasses, getTransitionClasses, getFadeInClasses } from './tokens';

// ============================================================================
// Exemplo 1: Card Padrão (Quick Links - Home)
// ============================================================================

interface QuickLinkCardProps {
  icon: React.ElementType;
  label: string;
  description: string;
  index?: number;
  onClick?: () => void;
}

export const QuickLinkCard: React.FC<QuickLinkCardProps> = ({
  icon: Icon,
  label,
  description,
  index = 0,
  onClick,
}) => {
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    requestAnimationFrame(() => {
      setIsVisible(true);
    });
  }, []);

  return (
    <Card
      className={`${getCardClasses('hover')} border-0 shadow-none rounded-[30px] cursor-pointer ${getTransitionClasses('slow')} hover:scale-105 ${
        isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-6'
      }`}
      style={{
        transitionDelay: `${index * 50 + 100}ms`,
      }}
      onClick={onClick}
    >
      <CardContent className="p-6 flex flex-col text-left">
        <div className="flex items-center mb-2">
          <span className="mr-3 bg-gray-100 dark:bg-[#1F1F1F] p-2 rounded-lg">
            <Icon className="h-5 w-5 text-gray-700 dark:text-gray-300" strokeWidth={1.5} />
          </span>
          <span className="font-medium dark:text-white">{label}</span>
        </div>
        <p className="text-sm text-gray-500 dark:text-[#757576] text-left">
          {description}
        </p>
      </CardContent>
    </Card>
  );
};

// ============================================================================
// Exemplo 2: Hero Banner (My Courses)
// ============================================================================

interface HeroBannerProps {
  title: string;
  tags?: string[];
  instructorName: string;
  instructorInitials: string;
  imageUrl: string;
  onWatchNow?: () => void;
}

export const HeroBanner: React.FC<HeroBannerProps> = ({
  title,
  tags = [],
  instructorName,
  instructorInitials,
  imageUrl,
  onWatchNow,
}) => {
  return (
    <div className="relative w-full rounded-3xl overflow-hidden mb-8">
      <div className="relative aspect-[16/7] w-full min-h-[300px] md:min-h-[400px] lg:min-h-[450px]">
        <img
          src={imageUrl}
          alt={title}
          className="w-full h-full object-cover"
        />
        {/* Gradient overlay */}
        <div className="absolute inset-0 bg-gradient-to-tr from-black/60 via-black/30 to-transparent" />
        
        {/* Content Overlay */}
        <div className="absolute inset-0 flex flex-col justify-between p-6 md:p-8 lg:p-10 xl:p-12 text-white z-10">
          {/* Title and Tags */}
          <div className="flex flex-col gap-4 md:gap-5 max-w-2xl lg:max-w-3xl">
            <h2 className="text-2xl md:text-3xl lg:text-4xl font-bold leading-tight text-white">
              {title}
            </h2>
            
            {tags.length > 0 && (
              <div className="flex flex-wrap gap-2">
                {tags.slice(0, 3).map((tag, index) => (
                  <Badge
                    key={index}
                    variant="outline"
                    className="bg-transparent text-white border-white/80 hover:border-white rounded-full px-4 py-1.5 text-sm font-medium"
                  >
                    {tag}
                  </Badge>
                ))}
              </div>
            )}
          </div>

          {/* Bottom Section */}
          <div className="flex items-end justify-between flex-wrap gap-4 mt-auto">
            <div className="flex items-center gap-3">
              <Avatar className="h-10 w-10 md:h-12 md:w-12 border-2 border-white/30">
                <AvatarFallback className="bg-white/20 text-white text-sm md:text-base font-semibold">
                  {instructorInitials}
                </AvatarFallback>
              </Avatar>
              <span className="text-white font-medium text-sm md:text-base lg:text-lg">
                {instructorName}
              </span>
            </div>

            <Button
              onClick={onWatchNow}
              className="bg-white hover:bg-white/90 text-black rounded-full px-5 py-4 md:px-6 md:py-5 h-auto font-semibold text-sm md:text-base flex items-center gap-2 shadow-lg transition-all hover:scale-105"
            >
              <span>Assistir agora</span>
              <Play className="h-4 w-4 md:h-5 md:w-5 fill-black" />
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
};

// ============================================================================
// Exemplo 3: Card de Métrica (Dashboard)
// ============================================================================

interface MetricCardProps {
  title: string;
  value: string;
  change?: string;
  isPositive?: boolean;
  showChart?: boolean;
  chartData?: Array<{ name: string; value: number }>;
}

export const MetricCard: React.FC<MetricCardProps> = ({
  title,
  value,
  change,
  isPositive,
  showChart = false,
}) => {
  return (
    <Card className="border border-gray-100 dark:border-gray-800 shadow-sm">
      <CardContent className="p-4">
        <div className="space-y-1">
          <h3 className="text-xs font-medium text-gray-500 dark:text-gray-400">
            {title}
          </h3>
          <div className="flex justify-between items-center">
            <p className="text-2xl font-bold">{value}</p>
            {showChart && (
              <div className="h-8 w-16">
                {/* Placeholder para gráfico */}
                <div className="h-full w-full bg-gray-100 dark:bg-gray-800 rounded"></div>
              </div>
            )}
          </div>
          {change && (
            <div className="mt-0.5 flex items-center gap-1">
              <span className={`text-xs ${isPositive ? 'text-green-500' : 'text-red-500'}`}>
                {isPositive ? '↑' : '↓'} {change}
              </span>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
};

// ============================================================================
// Exemplo 4: Welcome Section (Home)
// ============================================================================

interface WelcomeSectionProps {
  userName: string;
  companyPhrase: string;
  onLearnMore?: () => void;
}

export const WelcomeSection: React.FC<WelcomeSectionProps> = ({
  userName,
  companyPhrase,
  onLearnMore,
}) => {
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    requestAnimationFrame(() => {
      setIsVisible(true);
    });
  }, []);

  return (
    <div className={`mb-16 mt-10 ${getTransitionClasses('slow')} ${
      isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-6'
    }`}>
      <div className="flex flex-col items-center">
        <p
          className={`text-gray-700 dark:text-gray-200 mb-6 text-center bg-[#FFF5E4] dark:bg-[#333333] py-1.5 px-6 rounded-full max-w-fit text-sm font-semibold ${getTransitionClasses('slow')} ${
            isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'
          }`}
          style={{ transitionDelay: '50ms' }}
        >
          Olá, {userName}
        </p>
        
        <p
          className={`text-foreground text-center text-[24px] md:text-[40px] font-normal max-w-[90%] md:max-w-[50%] leading-[1.1] mb-5 ${getTransitionClasses('slow')} ${
            isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'
          }`}
          style={{ transitionDelay: '100ms' }}
        >
          {companyPhrase}
        </p>
        
        <Button
          onClick={onLearnMore}
          className={`mt-1 flex items-center gap-2 text-white dark:text-black rounded-full text-sm bg-black dark:bg-white hover:bg-black/90 dark:hover:bg-white/90 ${getTransitionClasses('slow')} ${
            isVisible ? 'opacity-100 translate-y-0 scale-100' : 'opacity-0 translate-y-4 scale-95'
          }`}
          style={{ transitionDelay: '150ms' }}
        >
          Saiba mais
          <ArrowRight className="h-4 w-4" />
        </Button>
      </div>
    </div>
  );
};

// ============================================================================
// Exemplo 5: Header com Greeting (My Courses)
// ============================================================================

interface HeaderWithGreetingProps {
  firstName: string;
  currentTime: string;
  onSearch?: (query: string) => void;
  userAvatars?: Array<{ id: string; name: string; avatar?: string; initials: string }>;
}

export const HeaderWithGreeting: React.FC<HeaderWithGreetingProps> = ({
  firstName,
  currentTime,
  userAvatars = [],
}) => {
  return (
    <div className="mb-8">
      {/* Desktop Layout */}
      <div className="hidden md:flex items-center justify-between gap-4">
        {/* Left: Greeting */}
        <div className="flex items-center gap-4 flex-shrink-0">
          <h1 className="text-2xl md:text-3xl font-semibold text-gray-900 dark:text-white">
            Olá, {firstName}
          </h1>
        </div>

        {/* Center: Search */}
        <div className="flex-1 max-w-md mx-4">
          {/* SearchBar component would go here */}
          <div className="w-full h-10 bg-gray-100 dark:bg-gray-800 rounded-lg"></div>
        </div>

        {/* Right: Time, Theme, Avatars */}
        <div className="flex items-center gap-4 flex-shrink-0">
          <div className="text-lg font-medium text-gray-700 dark:text-gray-300">
            {currentTime}
          </div>

          {/* User Avatars */}
          {userAvatars.length > 0 && (
            <div className="flex items-center -space-x-2">
              {userAvatars.slice(0, 3).map((user) => (
                <Avatar
                  key={user.id}
                  className="h-10 w-10 border-2 border-white dark:border-gray-800"
                >
                  {user.avatar ? (
                    <AvatarImage src={user.avatar} alt={user.name} />
                  ) : (
                    <AvatarFallback className="bg-gray-200 dark:bg-gray-700 text-sm font-semibold">
                      {user.initials}
                    </AvatarFallback>
                  )}
                </Avatar>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Mobile Layout */}
      <div className="md:hidden space-y-4">
        <div className="flex items-center justify-between">
          <h1 className="text-2xl font-semibold text-gray-900 dark:text-white">
            Olá, {firstName}
          </h1>
          <div className="flex items-center gap-3">
            <div className="text-base font-medium text-gray-700 dark:text-gray-300">
              {currentTime}
            </div>
          </div>
        </div>
        <div className="w-full">
          <div className="w-full h-10 bg-gray-100 dark:bg-gray-800 rounded-lg"></div>
        </div>
      </div>
    </div>
  );
};






