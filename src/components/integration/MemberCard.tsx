"use client"

import * as React from "react"
import { motion, useMotionValue, useTransform } from "framer-motion"
import { Avatar, AvatarImage, AvatarFallback } from '@/components/ui/avatar'
import { Building2, User, BadgeCheck } from "lucide-react"
import { cn } from "@/lib/utils"

const PERSPECTIVE = 1000
const CARD_ANIMATION_DURATION = 0.6
const INITIAL_DELAY = 0.2

interface MemberCardProps extends React.HTMLAttributes<HTMLDivElement> {
  userName: string
  userAvatar?: string | null
  companyName: string
  companyLogo?: string | null
  companyColor: string
  roleTitle?: string | null
  employeeId?: string
  department?: string
  variant?: "gradient" | "dark" | "glass"
}

// Função para obter iniciais do nome
const getInitials = (name: string): string => {
  if (!name) return 'U'
  const parts = name.trim().split(' ')
  if (parts.length === 1) return parts[0].charAt(0).toUpperCase()
  return (parts[0].charAt(0) + parts[parts.length - 1].charAt(0)).toUpperCase()
}

// Converter cor hex para RGB
const hexToRgb = (hex: string) => {
  const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex)
  return result
    ? {
        r: parseInt(result[1], 16),
        g: parseInt(result[2], 16),
        b: parseInt(result[3], 16),
      }
    : { r: 30, g: 174, b: 219 }
}

export const MemberCard: React.FC<MemberCardProps> = ({
  userName,
  userAvatar,
  companyName,
  companyLogo,
  companyColor,
  roleTitle,
  department,
  variant = "gradient",
  className,
  ...props
}) => {
  const [isFlipped, setIsFlipped] = React.useState(false)
  const [isClicked, setIsClicked] = React.useState(false)

  const x = useMotionValue(0)
  const y = useMotionValue(0)
  const rotateX = useTransform(y, [-100, 100], [10, -10])
  const rotateY = useTransform(x, [-100, 100], [-10, 10])

  const rgb = hexToRgb(companyColor)
  const colorFrom = companyColor
  const colorTo = `rgb(${Math.min(255, rgb.r + 50)}, ${Math.min(255, rgb.g + 50)}, ${Math.min(255, rgb.b + 50)})`

  const handleMouseMove = (event: React.MouseEvent<HTMLDivElement>) => {
    const rect = event.currentTarget.getBoundingClientRect()
    const centerX = rect.left + rect.width / 2
    const centerY = rect.top + rect.height / 2
    x.set(event.clientX - centerX)
    y.set(event.clientY - centerY)
  }

  const handleMouseLeave = () => {
    x.set(0)
    y.set(0)
  }

  // Criar gradiente dinâmico baseado na cor da empresa
  const getGradientStyle = () => {
    switch (variant) {
      case "dark":
        return "bg-gradient-to-br from-gray-800 via-gray-700 to-gray-900"
      case "glass":
        return "bg-white/15 dark:bg-white/10 backdrop-blur-xl border border-white/20"
      default:
        return undefined // Usar style inline para gradiente dinâmico
    }
  }

  const dynamicGradient = `linear-gradient(135deg, ${colorFrom} 0%, ${colorTo} 50%, ${colorFrom} 100%)`

  return (
    <div className={cn("flex items-center justify-start relative w-full", className)} {...props}>

      <div className="relative w-full">
        <motion.div
          className="relative w-full"
          style={{ 
            perspective: PERSPECTIVE,
            aspectRatio: '1.586 / 1', // Proporção padrão de cartão de crédito (85.60mm x 53.98mm)
          }}
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: CARD_ANIMATION_DURATION }}
        >
          <motion.div
            className="relative w-full h-full cursor-pointer"
            style={{
              transformStyle: "preserve-3d",
              rotateX,
              rotateY: isFlipped ? 180 : rotateY,
            }}
            animate={{
              scale: isClicked ? 0.95 : 1,
            }}
            transition={{ duration: 0.6, type: "spring", stiffness: 100, damping: 20 }}
            onMouseMove={handleMouseMove}
            onMouseLeave={handleMouseLeave}
            onClick={() => {
              setIsClicked(true)
              setTimeout(() => setIsClicked(false), 200)
              setTimeout(() => setIsFlipped(!isFlipped), 100)
            }}
          >
            {/* Front of card */}
            <motion.div
              className={cn(
                "absolute inset-0 rounded-2xl p-6 shadow-2xl",
                "backface-hidden",
                getGradientStyle()
              )}
              style={{
                background: variant === "gradient" ? dynamicGradient : undefined,
                backfaceVisibility: "hidden",
                WebkitBackfaceVisibility: "hidden"
              }}
            >
              {/* Card shimmer effect */}
              <div className="absolute inset-0 rounded-2xl overflow-hidden">
                <motion.div
                  className="absolute inset-0 bg-gradient-to-tr from-white/0 via-white/20 to-white/0"
                  animate={{
                    x: ["-100%", "100%"],
                  }}
                  transition={{
                    duration: 3,
                    repeat: Infinity,
                    repeatDelay: 3,
                    ease: "linear",
                  }}
                />
              </div>

              {/* Card content */}
              <div className="relative h-full flex flex-col justify-between text-white">
                {/* Top section - Logo e Avatar à esquerda, Nome da empresa à direita */}
                <div className="flex items-start justify-between">
                  <div className="flex items-center gap-3">
                    <motion.div
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: INITIAL_DELAY }}
                    >
                      {companyLogo ? (
                        <div className="w-12 h-12 rounded-full bg-white/20 backdrop-blur-sm flex items-center justify-center overflow-hidden shadow-lg">
                          <img
                            src={companyLogo}
                            alt={companyName}
                            className="w-full h-full object-cover rounded-full"
                            onError={e => {
                              const target = e.target as HTMLImageElement
                              target.src = "/placeholder.svg"
                            }}
                          />
                        </div>
                      ) : (
                        <div className="w-12 h-12 rounded-full bg-white/20 backdrop-blur-sm flex items-center justify-center shadow-lg">
                          <Building2 className="w-6 h-6" />
                        </div>
                      )}
                    </motion.div>
                    
                    <motion.div
                      initial={{ opacity: 0, scale: 0 }}
                      animate={{ opacity: 1, scale: 1 }}
                      transition={{ delay: 0.3, type: "spring", stiffness: 200 }}
                    >
                      <Avatar className="w-12 h-12">
                        <AvatarImage src={userAvatar || undefined} alt={userName} />
                        <AvatarFallback className="text-base font-bold bg-white/20 text-white">
                          {getInitials(userName)}
                        </AvatarFallback>
                      </Avatar>
                    </motion.div>
                  </div>

                  <motion.div
                    className="text-lg font-bold italic"
                    initial={{ opacity: 0, scale: 0 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{
                      delay: 0.4,
                      type: "spring",
                      stiffness: 200
                    }}
                  >
                    {companyName}
                  </motion.div>
                </div>

                {/* Middle section - Espaço vazio para dar respiro */}
                <div className="flex-1"></div>

                {/* Bottom section - Nome e cargo alinhados à esquerda */}
                <div className="flex flex-col items-start gap-1">
                  {department && (
                    <motion.div
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: 0.5 }}
                    >
                      <div className="text-xs opacity-70 mb-1">DEPARTAMENTO</div>
                      <div className="font-medium text-sm truncate">
                        {department}
                      </div>
                    </motion.div>
                  )}

                  <div className="flex items-center gap-2">
                    <motion.div
                      className="text-xl font-bold tracking-wide"
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: 0.5 }}
                    >
                      {userName.toUpperCase()}
                    </motion.div>
                    <motion.div
                      initial={{ opacity: 0, scale: 0 }}
                      animate={{ opacity: 1, scale: 1 }}
                      transition={{ delay: 0.6, type: "spring", stiffness: 200 }}
                    >
                      <BadgeCheck className="w-4 h-4 flex-shrink-0" />
                    </motion.div>
                  </div>
                  {roleTitle && (
                    <motion.div
                      className="text-xs opacity-85 font-medium truncate"
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: 0.6 }}
                      title={roleTitle}
                    >
                      {roleTitle.length > 30 ? `${roleTitle.substring(0, 30)}...` : roleTitle}
                    </motion.div>
                  )}
                </div>
              </div>
            </motion.div>

            {/* Back of card */}
            <motion.div
              className={cn(
                "absolute inset-0 rounded-2xl shadow-2xl",
                "backface-hidden",
                "flex items-center justify-center p-8",
                getGradientStyle()
              )}
              style={{
                background: variant === "gradient" ? dynamicGradient : undefined,
                backfaceVisibility: "hidden",
                WebkitBackfaceVisibility: "hidden",
                transform: "rotateY(180deg)"
              }}
            >
              {/* Frase centralizada no verso */}
              <motion.div 
                className="text-center text-white"
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: 0.2, duration: 0.5 }}
              >
                <p className="text-lg lg:text-xl font-semibold mb-2">
                  Bem-vindo à {companyName}
                </p>
                <p className="text-sm lg:text-base opacity-90 max-w-xs mx-auto">
                  Sua jornada de integração começa aqui. Estamos felizes em ter você conosco!
                </p>
              </motion.div>
            </motion.div>
          </motion.div>

          {/* Floating elements - mais sutis */}
          <motion.div
            className="absolute -top-2 -right-2 w-16 h-16 rounded-full blur-xl"
            style={{ backgroundColor: `${companyColor}20` }}
            animate={{
              scale: isClicked ? [1, 1.3, 1] : [1, 1.1, 1],
              opacity: isClicked ? [0.15, 0.4, 0.15] : [0.15, 0.25, 0.15],
            }}
            transition={{
              duration: isClicked ? 0.3 : 4,
              repeat: isClicked ? 0 : Infinity,
              ease: "easeInOut",
            }}
          />
          <motion.div
            className="absolute -bottom-2 -left-2 w-20 h-20 rounded-full blur-xl"
            style={{ backgroundColor: `${companyColor}20` }}
            animate={{
              scale: isClicked ? [1, 1.4, 1] : [1, 1.2, 1],
              opacity: isClicked ? [0.15, 0.4, 0.15] : [0.15, 0.25, 0.15],
            }}
            transition={{
              duration: isClicked ? 0.3 : 5,
              repeat: isClicked ? 0 : Infinity,
              ease: "easeInOut",
            }}
          />

          {/* Click ripple effect */}
          {isClicked && (
            <motion.div
              className="absolute inset-0 rounded-2xl"
              initial={{ scale: 0.8, opacity: 0 }}
              animate={{ scale: 1.1, opacity: 0 }}
              transition={{ duration: 0.5 }}
            >
              <div className="h-full w-full rounded-2xl border-2 border-white/50 dark:border-white/30" />
            </motion.div>
          )}
        </motion.div>

      </div>
    </div>
  )
}

