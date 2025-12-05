import * as React from "react"

import { useEffect, useState, useRef } from "react";

 

export interface TypewriterProps {

  text: string | string[];

  speed?: number;

  cursor?: string;

  loop?: boolean;

  deleteSpeed?: number;

  delay?: number;

  className?: string;

}

 

export function Typewriter({

  text,

  speed = 100,

  cursor = "|",

  loop = false,

  deleteSpeed = 50,

  delay = 1500,

  className,

}: TypewriterProps) {

  const [displayText, setDisplayText] = useState("");

  const [currentIndex, setCurrentIndex] = useState(0);

  const [isDeleting, setIsDeleting] = useState(false);

  const [textArrayIndex, setTextArrayIndex] = useState(0);

  const delayTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const previousTextKeyRef = useRef<string>("");
  const animationStartedRef = useRef<boolean>(false);

 

  // Validate and process input text

  const textArray = Array.isArray(text) ? text : [text];
  const textKey = JSON.stringify(textArray);

  const currentText = textArray[textArrayIndex] || "";

  // Reset apenas quando o conteúdo do texto realmente mudar (não a referência do array)
  useEffect(() => {
    const textChanged = previousTextKeyRef.current !== textKey;
    
    if (textChanged) {
      previousTextKeyRef.current = textKey;
      // Resetar apenas se o conteúdo realmente mudou
      setDisplayText("");
      setCurrentIndex(0);
      setIsDeleting(false);
      setTextArrayIndex(0);
      animationStartedRef.current = false;
      if (delayTimeoutRef.current) {
        clearTimeout(delayTimeoutRef.current);
        delayTimeoutRef.current = null;
      }
    }
  }, [textKey]);

  useEffect(() => {

    if (!currentText) return;

 
    // Limpar timeout de delay anterior se existir
    if (delayTimeoutRef.current) {
      clearTimeout(delayTimeoutRef.current);
      delayTimeoutRef.current = null;
    }

    // Marcar que a animação começou quando começar a digitar
    if (!animationStartedRef.current && currentIndex === 0 && !isDeleting && currentText.length > 0) {
      animationStartedRef.current = true;
    }

    const timeout = setTimeout(

      () => {

        if (!isDeleting) {

          if (currentIndex < currentText.length) {

            setDisplayText((prev) => prev + currentText[currentIndex]);

            setCurrentIndex((prev) => prev + 1);

          } else if (loop) {

            // Usar ref para rastrear o timeout de delay
            delayTimeoutRef.current = setTimeout(() => {
              setIsDeleting(true);
              delayTimeoutRef.current = null;
            }, delay);

          }

        } else {

          if (displayText.length > 0) {

            setDisplayText((prev) => prev.slice(0, -1));

          } else {

            setIsDeleting(false);

            setCurrentIndex(0);

            setTextArrayIndex((prev) => (prev + 1) % textArray.length);

          }

        }

      },

      isDeleting ? deleteSpeed : speed,

    );

 

    return () => {
      clearTimeout(timeout);
      if (delayTimeoutRef.current) {
        clearTimeout(delayTimeoutRef.current);
        delayTimeoutRef.current = null;
      }
    };

  }, [

    currentIndex,

    isDeleting,

    currentText,

    loop,

    speed,

    deleteSpeed,

    delay,

    displayText,

    textArray.length,

  ]);

 

  return (

    <span className={className}>

      {displayText}

      <span className="animate-pulse">{cursor}</span>

    </span>

  );

}
