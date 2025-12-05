
import * as React from "react"
import * as DialogPrimitive from "@radix-ui/react-dialog"
import { X } from "lucide-react"
import { cn } from "@/lib/utils"

const Dialog = ({
  children,
  ...props
}: DialogPrimitive.DialogProps) => {
  // Use uma ref para monitorar o estado do diálogo
  const dialogStateRef = React.useRef<boolean>(false);
  
  // Use uma ref para observar mudanças no estilo do body
  const observerRef = React.useRef<MutationObserver | null>(null);

  // Função para limpar completamente os estilos de pointer-events
  const cleanupPointerEvents = React.useCallback(() => {
    // Verificar se o body ainda existe
    if (!document.body) return;
    
    try {
      // Remova a propriedade específica
      document.body.style.removeProperty('pointer-events');
      
      // Garanta que pointer-events não está definido como 'none'
      if (document.body.style.pointerEvents === 'none') {
        document.body.style.pointerEvents = '';
      }
      
      // Adicione uma classe temporária para forçar pointer-events: auto
      document.body.classList.add('pointer-events-auto');
      setTimeout(() => {
        if (document.body) {
          document.body.classList.remove('pointer-events-auto');
        }
      }, 100);
    } catch (error) {
      // Ignorar erros durante cleanup
      console.warn('Erro durante cleanup de pointer-events:', error);
    }
  }, []);

  // Configura o observador ao montar
  React.useEffect(() => {
    // Verifica se o body ainda existe antes de criar o observer
    if (!document.body) return;

    // Cria um MutationObserver para observar mudanças no atributo style
    observerRef.current = new MutationObserver((mutations) => {
      // Apenas corrija pointer-events quando o diálogo não estiver mais aberto
      if (!dialogStateRef.current && document.body) {
        mutations.forEach(mutation => {
          if (mutation.type === 'attributes' && 
              mutation.attributeName === 'style' &&
              document.body &&
              document.body.style.pointerEvents === 'none') {
            try {
              cleanupPointerEvents();
            } catch (error) {
              // Ignorar erros durante cleanup
              console.warn('Erro durante cleanup de pointer-events:', error);
            }
          }
        });
      }
    });

    // Inicia a observação das mudanças no atributo style do body
    try {
      if (document.body && observerRef.current) {
        observerRef.current.observe(document.body, { 
          attributes: true, 
          attributeFilter: ['style'] 
        });
      }
    } catch (error) {
      console.warn('Erro ao configurar MutationObserver:', error);
    }

    return () => {
      // Limpa o observador ao desmontar
      if (observerRef.current) {
        try {
          observerRef.current.disconnect();
        } catch (error) {
          // Ignorar erros ao desconectar observer
        }
        observerRef.current = null;
      }
      // Garante que pointer-events está limpo quando o componente é desmontado
      if (document.body) {
        try {
          cleanupPointerEvents();
        } catch (error) {
          // Ignorar erros durante cleanup final
        }
      }
    };
  }, [cleanupPointerEvents]);

  const handleOpenChange = (open: boolean) => {
    // Atualiza a ref de estado
    dialogStateRef.current = open;

    if (!document.body) {
      props.onOpenChange?.(open);
      return;
    }

    try {
      if (open) {
        // Quando abrimos, permitimos que o overflow seja hidden
        document.body.style.overflow = 'hidden';
      } else {
        // Quando fechamos, limpamos todos os estilos
        document.body.style.overflow = '';
        cleanupPointerEvents();
      }
    } catch (error) {
      console.warn('Erro ao manipular estilos do body:', error);
    }
    
    // Chama o handler original
    props.onOpenChange?.(open);
  };

  return (
    <DialogPrimitive.Root {...props} onOpenChange={handleOpenChange}>
      {children}
    </DialogPrimitive.Root>
  );
};

const DialogTrigger = DialogPrimitive.Trigger

const DialogPortal = DialogPrimitive.Portal

const DialogClose = DialogPrimitive.Close

const DialogOverlay = React.forwardRef<
  React.ElementRef<typeof DialogPrimitive.Overlay>,
  React.ComponentPropsWithoutRef<typeof DialogPrimitive.Overlay>
>(({ className, ...props }, ref) => (
  <DialogPrimitive.Overlay
    ref={ref}
    className={cn(
      "fixed inset-0 z-50 bg-black/20 data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0",
      className
    )}
    {...props}
  />
))
DialogOverlay.displayName = DialogPrimitive.Overlay.displayName

const DialogContent = React.forwardRef<
  React.ElementRef<typeof DialogPrimitive.Content>,
  React.ComponentPropsWithoutRef<typeof DialogPrimitive.Content>
>(({ className, children, ...props }, ref) => {
  // Referência para acessar o botão de fechar
  const closeButtonRef = React.useRef<HTMLButtonElement>(null);

  // Função para limpar os estilos
  const cleanupStyles = () => {
    document.body.style.removeProperty('pointer-events');
    document.body.style.pointerEvents = '';
  };

  return (
    <DialogPortal>
      <DialogOverlay />
      <DialogPrimitive.Content
        ref={ref}
        className={cn(
          "fixed left-[50%] top-[50%] z-50 grid w-full max-w-xl translate-x-[-50%] translate-y-[-50%] gap-4 border bg-background p-6 shadow-lg sm:rounded-lg pointer-events-auto data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0 data-[state=closed]:zoom-out-95 data-[state=open]:zoom-in-95 data-[state=closed]:slide-out-to-left-1/2 data-[state=closed]:slide-out-to-top-[48%] data-[state=open]:slide-in-from-left-1/2 data-[state=open]:slide-in-from-top-[48%]",
          className
        )}
        onEscapeKeyDown={() => {
          cleanupStyles();
        }}
        onInteractOutside={() => {
          cleanupStyles();
        }}
        onCloseAutoFocus={(event) => {
          // Limpa estilos quando o diálogo é fechado
          cleanupStyles();
          
          // Força a remoção do inline style para pointer-events
          document.body.setAttribute(
            'style', 
            document.body.getAttribute('style')?.replace(/pointer-events:\s*none;?/gi, '') || ''
          );
          
          // Adiciona uma classe para forçar pointer-events: auto
          document.body.classList.add('pointer-events-auto');
          setTimeout(() => {
            document.body.classList.remove('pointer-events-auto');
          }, 100);
          
          // Evita o foco padrão para permitir nosso tratamento personalizado
          event.preventDefault();
          
          // Chama o handler original se existir
          if (props.onCloseAutoFocus) {
            props.onCloseAutoFocus(event);
          }
        }}
        {...props}
      >
        {children}
        <DialogPrimitive.Close 
          ref={closeButtonRef}
          className="absolute right-4 top-4 rounded-sm opacity-70 ring-offset-background transition-opacity hover:opacity-100 focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 disabled:pointer-events-none data-[state=open]:bg-accent data-[state=open]:text-muted-foreground"
          onClick={() => {
            // Limpa estilos quando o botão de fechar é clicado
            cleanupStyles();
          }}
        >
          <X className="h-4 w-4" />
          <span className="sr-only">Close</span>
        </DialogPrimitive.Close>
      </DialogPrimitive.Content>
    </DialogPortal>
  );
})
DialogContent.displayName = DialogPrimitive.Content.displayName

const DialogHeader = ({
  className,
  ...props
}: React.HTMLAttributes<HTMLDivElement>) => (
  <div
    className={cn(
      "flex flex-col space-y-1.5 text-center sm:text-left",
      className
    )}
    {...props}
  />
)
DialogHeader.displayName = "DialogHeader"

const DialogFooter = ({
  className,
  ...props
}: React.HTMLAttributes<HTMLDivElement>) => (
  <div
    className={cn(
      "flex flex-col-reverse sm:flex-row sm:justify-end sm:space-x-2",
      className
    )}
    {...props}
  />
)
DialogFooter.displayName = "DialogFooter"

const DialogTitle = React.forwardRef<
  React.ElementRef<typeof DialogPrimitive.Title>,
  React.ComponentPropsWithoutRef<typeof DialogPrimitive.Title>
>(({ className, ...props }, ref) => (
  <DialogPrimitive.Title
    ref={ref}
    className={cn(
      "text-lg font-semibold leading-none tracking-tight",
      className
    )}
    {...props}
  />
))
DialogTitle.displayName = DialogPrimitive.Title.displayName

const DialogDescription = React.forwardRef<
  React.ElementRef<typeof DialogPrimitive.Description>,
  React.ComponentPropsWithoutRef<typeof DialogPrimitive.Description>
>(({ className, ...props }, ref) => (
  <DialogPrimitive.Description
    ref={ref}
    className={cn("text-sm text-muted-foreground", className)}
    {...props}
  />
))
DialogDescription.displayName = DialogPrimitive.Description.displayName

export {
  Dialog,
  DialogPortal,
  DialogOverlay,
  DialogClose,
  DialogTrigger,
  DialogContent,
  DialogHeader,
  DialogFooter,
  DialogTitle,
  DialogDescription,
}
