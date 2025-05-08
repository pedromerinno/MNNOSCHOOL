
import * as React from "react"
import * as DialogPrimitive from "@radix-ui/react-dialog"
import { X } from "lucide-react"
import { cn } from "@/lib/utils"

const Dialog = ({
  children,
  ...props
}: DialogPrimitive.DialogProps) => {
  const originalBodyStyles = React.useRef({
    overflow: '',
    pointerEvents: '',
    paddingRight: ''
  });

  // Completely reimplemented handling of body styles
  const handleOpenChange = (open: boolean) => {
    if (open) {
      // Store original body styles before modifying
      originalBodyStyles.current = {
        overflow: document.body.style.overflow,
        pointerEvents: document.body.style.pointerEvents,
        paddingRight: document.body.style.paddingRight
      };
      
      // Apply dialog styles
      document.body.style.overflow = 'hidden';
      document.body.style.paddingRight = '0px';
    } else {
      // Reset all body styles immediately
      document.body.style.removeProperty('overflow');
      document.body.style.removeProperty('pointerEvents');
      document.body.style.removeProperty('paddingRight');
      
      // Add a force-enable pointer-events class
      document.body.classList.add('pointer-events-auto');
      
      // Create a reliable cleanup mechanism using MutationObserver
      const observer = new MutationObserver((mutations) => {
        mutations.forEach((mutation) => {
          if (mutation.attributeName === 'style') {
            const bodyStyle = window.getComputedStyle(document.body);
            if (bodyStyle.pointerEvents === 'none') {
              console.log('MutationObserver: detected pointer-events: none - fixing');
              document.body.style.removeProperty('pointerEvents');
              document.body.setAttribute('style', document.body.getAttribute('style')?.replace(/pointer-events:\s*none;?/gi, '') || '');
            }
          }
        });
      });
      
      // Start observing style changes on body
      observer.observe(document.body, { attributes: true, attributeFilter: ['style'] });
      
      // Cleanup after a short delay
      setTimeout(() => {
        // Force reset pointerEvents
        if (window.getComputedStyle(document.body).pointerEvents === 'none') {
          console.log('Timeout cleanup: fixing pointer-events');
          document.body.style.removeProperty('pointerEvents');
          document.body.setAttribute('style', document.body.getAttribute('style')?.replace(/pointer-events:\s*none;?/gi, '') || '');
        }
        
        // Stop observing and remove the class
        observer.disconnect();
        document.body.classList.remove('pointer-events-auto');
      }, 300);
    }
    
    // Call the original onOpenChange if provided
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
      "fixed inset-0 z-50 bg-black/20 backdrop-blur-[0.5px] data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0",
      className
    )}
    {...props}
  />
))
DialogOverlay.displayName = DialogPrimitive.Overlay.displayName

const DialogContent = React.forwardRef<
  React.ElementRef<typeof DialogPrimitive.Content>,
  React.ComponentPropsWithoutRef<typeof DialogPrimitive.Content>
>(({ className, children, ...props }, ref) => (
  <DialogPortal>
    <DialogOverlay />
    <DialogPrimitive.Content
      ref={ref}
      className={cn(
        "fixed left-[50%] top-[50%] z-50 grid w-full max-w-xl translate-x-[-50%] translate-y-[-50%] gap-4 border bg-background p-6 shadow-lg sm:rounded-lg pointer-events-auto data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0 data-[state=closed]:zoom-out-95 data-[state=open]:zoom-in-95 data-[state=closed]:slide-out-to-left-1/2 data-[state=closed]:slide-out-to-top-[48%] data-[state=open]:slide-in-from-left-1/2 data-[state=open]:slide-in-from-top-[48%]",
        className
      )}
      onCloseAutoFocus={(event) => {
        // Força a remoção do pointer-events no body ao fechar
        document.body.style.pointerEvents = '';
        document.body.style.removeProperty('pointerEvents');
        event.preventDefault();
      }}
      {...props}
    >
      {children}
      <DialogPrimitive.Close 
        className="absolute right-4 top-4 rounded-sm opacity-70 ring-offset-background transition-opacity hover:opacity-100 focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 disabled:pointer-events-none data-[state=open]:bg-accent data-[state=open]:text-muted-foreground"
      >
        <X className="h-4 w-4" />
        <span className="sr-only">Close</span>
      </DialogPrimitive.Close>
    </DialogPrimitive.Content>
  </DialogPortal>
))
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

