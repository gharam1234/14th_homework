"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type PropsWithChildren,
  type ReactNode,
} from "react";
import { createPortal } from "react-dom";
import type { MouseEvent as ReactMouseEvent } from "react";

type ModalRenderer = (helpers: { close: () => void }) => ReactNode;

interface ModalOptions {
  ariaLabel?: string;
  className?: string;
  closeOnBackdrop?: boolean;
  closeOnEsc?: boolean;
  role?: "dialog" | "alertdialog";
}

interface ModalContextValue {
  closeModal: () => void;
  isOpen: boolean;
  openModal: (renderer: ModalRenderer, options?: ModalOptions) => void;
}

interface ModalState {
  options: ModalResolvedOptions;
  renderer: ModalRenderer | null;
}

type ModalResolvedOptions = Required<
  Pick<ModalOptions, "closeOnBackdrop" | "closeOnEsc" | "role">
> &
  Omit<ModalOptions, "closeOnBackdrop" | "closeOnEsc" | "role">;

const MODAL_ROOT_ID = "modal-root";
const BLOCKED_WRAPPER_CLASSES = ["max-w-md", "max-wd-md", "w-full"];

const sanitizeWrapperClassName = (className?: string) => {
  if (!className) {
    return "";
  }

  return className
    .split(/\s+/)
    .filter(Boolean)
    .filter((token) => !BLOCKED_WRAPPER_CLASSES.includes(token))
    .join(" ");
};

const defaultOptions: ModalResolvedOptions = {
  closeOnBackdrop: true,
  closeOnEsc: true,
  role: "dialog",
};

const ModalContext = createContext<ModalContextValue | null>(null);

export const ModalProvider = ({ children }: PropsWithChildren) => {
  const [state, setState] = useState<ModalState>({
    options: defaultOptions,
    renderer: null,
  });

  const closeModal = useCallback(() => {
    setState({ renderer: null, options: defaultOptions });
  }, []);

  const openModal = useCallback(
    (renderer: ModalRenderer, options?: ModalOptions) => {
      setState({
        renderer,
        options: { ...defaultOptions, ...options },
      });
    },
    []
  );

  const isOpen = Boolean(state.renderer);

  const value = useMemo<ModalContextValue>(
    () => ({
      closeModal,
      isOpen,
      openModal,
    }),
    [closeModal, isOpen, openModal]
  );

  return (
    <ModalContext.Provider value={value}>
      {children}
      <ModalPortal
        isOpen={isOpen}
        options={state.options}
        renderer={state.renderer}
        onClose={closeModal}
      />
    </ModalContext.Provider>
  );
};

export const useModal = () => {
  const context = useContext(ModalContext);

  if (!context) {
    throw new Error("useModal must be used within ModalProvider");
  }

  return context;
};

export default ModalProvider;

interface ModalPortalProps {
  isOpen: boolean;
  onClose: () => void;
  options: ModalResolvedOptions;
  renderer: ModalRenderer | null;
}

const ModalPortal = ({
  isOpen,
  onClose,
  options,
  renderer,
}: ModalPortalProps) => {
  const [portalElement, setPortalElement] = useState<HTMLElement | null>(null);

  useEffect(() => {
    if (typeof document === "undefined") {
      return;
    }

    let element = document.getElementById(MODAL_ROOT_ID) as HTMLElement | null;
    let created = false;

    if (!element) {
      element = document.createElement("div");
      element.setAttribute("id", MODAL_ROOT_ID);
      document.body.appendChild(element);
      created = true;
    }

    setPortalElement(element);

    return () => {
      if (created && element?.parentNode) {
        element.parentNode.removeChild(element);
      }
    };
  }, []);

  useEffect(() => {
    if (!isOpen || typeof document === "undefined") {
      return;
    }

    const { body } = document;
    const originalOverflow = body.style.overflow;

    body.style.overflow = "hidden";

    return () => {
      body.style.overflow = originalOverflow;
    };
  }, [isOpen]);

  useEffect(() => {
    if (!isOpen || !options.closeOnEsc) {
      return;
    }

    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        onClose();
      }
    };

    window.addEventListener("keydown", handleKeyDown);

    return () => {
      window.removeEventListener("keydown", handleKeyDown);
    };
  }, [isOpen, onClose, options.closeOnEsc]);

  if (!portalElement || !renderer || !isOpen) {
    return null;
  }

  const { ariaLabel, className, closeOnBackdrop, role } = options;
  const sanitizedWrapperClassName = sanitizeWrapperClassName(className);
  const baseWrapperClassName = "relative rounded-2xl bg-white p-6 shadow-2xl";
  const wrapperClassName = sanitizedWrapperClassName
    ? `${baseWrapperClassName} ${sanitizedWrapperClassName}`
    : baseWrapperClassName;

  const handleBackdropClick = (
    event: ReactMouseEvent<HTMLDivElement, MouseEvent>
  ) => {
    if (!closeOnBackdrop) {
      return;
    }

    if (event.target === event.currentTarget) {
      onClose();
    }
  };

  const content = renderer({ close: onClose });

  return createPortal(
    <div
      className="fixed inset-0 z-[9999] flex items-center justify-center bg-black/50 px-4 py-8"
      onMouseDown={handleBackdropClick}
    >
      <div
        aria-label={ariaLabel}
        aria-modal
        className={wrapperClassName}
        role={role}
      >
        {content}
      </div>
    </div>,
    portalElement
  );
};
