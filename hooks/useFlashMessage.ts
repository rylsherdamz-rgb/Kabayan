import { useCallback, useEffect, useState } from "react";
import type { FlashMessage, FlashVariant } from "@/components/CustomComponents/AppFlashMessage";

export default function useFlashMessage(timeoutMs = 3200) {
  const [flashMessage, setFlashMessage] = useState<FlashMessage | null>(null);

  const showFlashMessage = useCallback(
    (title: string, description?: string, variant: FlashVariant = "info") => {
      setFlashMessage({ title, description, variant });
    },
    []
  );

  const hideFlashMessage = useCallback(() => {
    setFlashMessage(null);
  }, []);

  useEffect(() => {
    if (!flashMessage) return;
    const timer = setTimeout(() => {
      setFlashMessage(null);
    }, timeoutMs);

    return () => clearTimeout(timer);
  }, [flashMessage, timeoutMs]);

  return {
    flashMessage,
    showFlashMessage,
    hideFlashMessage,
  };
}
