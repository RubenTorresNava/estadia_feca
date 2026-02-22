import { X, AlertTriangle } from "lucide-react";

interface ConfirmationModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
  title: string;
  message: string;
}

export const ConfirmationModal = ({
  isOpen,
  onClose,
  onConfirm,
  title,
  message,
}: ConfirmationModalProps) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg shadow-xl w-full max-w-md">
        <div className="p-6 text-center">
          <div className="mx-auto flex items-center justify-center h-12 w-12 rounded-full bg-red-100">
            <AlertTriangle className="h-6 w-6 text-primary" />
          </div>
          <h3 className="mt-5 text-lg font-semibold text-dark">{title}</h3>
          <div className="mt-2">
            <p className="text-sm text-gray">{message}</p>
          </div>
        </div>
        <div className="bg-light px-6 py-4 flex flex-col-reverse sm:flex-row sm:justify-end sm:gap-3">
          <button
            type="button"
            onClick={onClose}
            className="w-full sm:w-auto justify-center rounded-md border border-gray/40 px-4 py-2 text-sm font-medium text-dark shadow-sm hover:bg-gray/10"
          >
            Cancelar
          </button>
          <button
            type="button"
            onClick={onConfirm}
            className="w-full sm:w-auto justify-center rounded-md border border-transparent bg-primary px-4 py-2 text-sm font-medium text-white shadow-sm hover:bg-primary-dark"
          >
            Confirmar
          </button>
        </div>
      </div>
    </div>
  );
};
