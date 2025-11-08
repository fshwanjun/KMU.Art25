"use client";

import React, { useCallback, useEffect, useMemo, useState } from "react";

type ImageLightboxProps = {
  children: React.ReactElement;
  backdropClassName?: string;
  contentClassName?: string;
};

export default function ImageLightbox({
  children,
  backdropClassName,
  contentClassName,
}: ImageLightboxProps) {
  const [open, setOpen] = useState(false);

  const openModal = useCallback(
    (e: React.MouseEvent) => {
      e.preventDefault();
      e.stopPropagation();
      setOpen(true);
    },
    [setOpen]
  );
  const closeModal = useCallback(() => setOpen(false), []);

  useEffect(() => {
    function onKeyDown(e: KeyboardEvent) {
      if (e.key === "Escape") {
        setOpen(false);
      }
    }
    if (open) {
      document.addEventListener("keydown", onKeyDown);
      document.body.style.overflow = "hidden";
    }
    return () => {
      document.removeEventListener("keydown", onKeyDown);
      document.body.style.overflow = "";
    };
  }, [open]);

  const trigger = useMemo(() => {
    return React.cloneElement(children, {
      onClick: (e: React.MouseEvent) => {
        children.props?.onClick?.(e);
        if (!e.defaultPrevented) openModal(e);
      },
      style: {
        ...(children.props?.style ?? {}),
        cursor: "zoom-in",
      },
    });
  }, [children, openModal]);

  const modalContent = useMemo(() => {
    // Clone child and force max sizing to fit viewport
    return React.cloneElement(children, {
      onClick: (e: React.MouseEvent) => {
        // prevent image click from closing immediately if needed
        e.stopPropagation();
      },
      draggable: false,
      style: {
        ...(children.props?.style ?? {}),
        maxWidth: "90vw",
        maxHeight: "90vh",
        width: "auto",
        height: "auto",
        objectFit: "contain",
        cursor: "zoom-out",
      },
      className: [
        children.props?.className ?? "",
        "block",
      ]
        .join(" ")
        .trim(),
    });
  }, [children]);

  return (
    <>
      {trigger}
      {open && (
        <div
          role="dialog"
          aria-modal="true"
          className={[
            "fixed inset-0 z-[1000] flex items-center justify-center bg-black/80",
            backdropClassName ?? "",
          ]
            .join(" ")
            .trim()}
          onClick={closeModal}
        >
          <div
            className={["p-0 m-0", contentClassName ?? ""].join(" ").trim()}
            onClick={(e) => e.stopPropagation()}
          >
            {modalContent}
          </div>
        </div>
      )}
    </>
  );
}


