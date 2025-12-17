import { useState, useCallback } from "react";

export const useConfirm = () => {
  const [confirmState, setConfirmState] = useState({
    isOpen: false,
    title: "Xác nhận",
    message: "",
    confirmText: "Xác nhận",
    cancelText: "Hủy",
    type: "warning",
    onConfirm: () => {},
    onCancel: () => {},
  });

  const showConfirm = useCallback(
    ({
      title = "Xác nhận",
      message,
      confirmText = "Xác nhận",
      cancelText = "Hủy",
      type = "warning",
    }) => {
      return new Promise((resolve) => {
        setConfirmState({
          isOpen: true,
          title,
          message,
          confirmText,
          cancelText,
          type,
          onConfirm: () => {
            setConfirmState((prev) => ({ ...prev, isOpen: false }));
            resolve(true);
          },
          onCancel: () => {
            setConfirmState((prev) => ({ ...prev, isOpen: false }));
            resolve(false);
          },
        });
      });
    },
    []
  );

  const hideConfirm = useCallback(() => {
    setConfirmState((prev) => ({ ...prev, isOpen: false }));
  }, []);

  return {
    confirmState,
    showConfirm,
    hideConfirm,
  };
};
