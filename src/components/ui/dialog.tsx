
import * as React from "react"
import * as DialogPrimitive from "@radix-ui/react-dialog"
import { X } from "lucide-react"
import { cn } from "@/lib/utils"

const Dialog = ({
  children,
  ...props
}: DialogPrimitive.DialogProps) => {
  // Store original body style when dialog opens
  const originalStyles = React.useRef<{
    overflow: string;
    pointerEvents: string;
    paddingRight: string;
  } | null>(null);

  const handleOpenChange = (open: boolean) => {
    if (open) {
      // Store current body styles before modifying
      originalStyles.current = {
        overflow: document.body.style.overflow,
        pointerEvents: document.body.style.pointerEvents,
        paddingRight: document.body.style.paddingRight
      };
      
      // Apply modal styles
      document.body.style.overflow = 'hidden';
      document.body.style.paddingRight = '0px';
    } else {
      // Force clean all body styles that might interfere with interactions
      document.body.style.overflow = '';
      document.body.style.pointerEvents = '';
      document.body.style.paddingRight = '';

      // Force inline style cleanup for pointer-events specifically
      document.body.setAttribute(
        'style', 
        document.body.getAttribute('style')?.replace(/pointer-events:\s*none;?/gi, '') || ''
      );
      
      // Add a class that will force pointer-events to auto
      document.body.classList.add('pointer-events-auto');
      
      // Remove the class after animation completes
      setTimeout(() => {
        document.body.classList.remove('pointer-events-auto');
      }, 500);
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
      onEscapeKeyDown={() => {
        // Extra cleanup when escape key is used
        document.body.style.pointerEvents = '';
      }}
      onInteractOutside={() => {
        // Extra cleanup when clicking outside
        document.body.style.pointerEvents = '';
      }}
      onCloseAutoFocus={(event) => {
        // Cleanup pointer-events when dialog closes
        document.body.style.pointerEvents = '';
        
        // Force remove any pointer-events: none that might still exist
        document.body.setAttribute(
          'style', 
          document.body.getAttribute('style')?.replace(/pointer-events:\s*none;?/gi, '') || ''
        );
        
        // Prevent default focus to allow our custom handling
        event.preventDefault();
        
        // Call original handler if exists
        if (props.onCloseAutoFocus) {
          props.onCloseAutoFocus(event);
        }
      }}
      {...props}
    >
      {children}
      <DialogPrimitive.Close 
        className="absolute right-4 top-4 rounded-sm opacity-70 ring-offset-background transition-opacity hover:opacity-100 focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 disabled:pointer-events-none data-[state=open]:bg-accent data-[state=open]:text-muted-foreground"
        onClick={() => {
          // Extra cleanup when close button is clicked
          document.body.style.pointerEvents = '';
        }}
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
