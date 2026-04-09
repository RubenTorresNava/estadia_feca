import { useState } from 'react';
import { Camera } from 'lucide-react';

interface ComprobanteUploadProps {
  ordenId: number;
  onUpload: (file: File) => Promise<void>;
}

export const ComprobanteUpload = ({ ordenId, onUpload }: ComprobanteUploadProps) => {
  const [file, setFile] = useState<File | null>(null);
  const [preview, setPreview] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  const allowedImageTypes = ['image/jpeg', 'image/png', 'image/jpg'];
  const allowedImageExtensions = ['.jpg', '.jpeg', '.png'];
  const maxImageSizeBytes = 5 * 1024 * 1024;

  const isValidImageFile = (selected: File) => {
    const extension = `.${selected.name.split('.').pop()?.toLowerCase() || ''}`;
    return allowedImageTypes.includes(selected.type) && allowedImageExtensions.includes(extension) && selected.size <= maxImageSizeBytes;
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const selected = e.target.files[0];
      if (!isValidImageFile(selected)) {
        setError('Tipo de archivo no permitido. Solo se permiten imágenes (.jpeg, .png, .jpg) y hasta 5MB.');
        setSuccess('');
        setFile(null);
        setPreview(null);
        e.target.value = '';
        return;
      }
      setFile(selected);
      setPreview(URL.createObjectURL(selected));
      setError('');
      setSuccess('');
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setSuccess('');
    if (!file) {
      setError('Selecciona un archivo de imagen.');
      return;
    }
    setIsSubmitting(true);
    try {
      await onUpload(file);
      setSuccess('Comprobante subido con éxito. Tu pedido está en revisión.');
      setFile(null);
      setPreview(null);
    } catch (err) {
      setError('Error al subir el comprobante. Intenta de nuevo.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="w-full rounded-2xl border border-black/5 bg-white p-3 sm:p-4">
      <h3 className="mb-3 text-center text-2xl font-extrabold text-dark">Subir comprobante</h3>

      <label
        htmlFor={`comprobante-${ordenId}`}
        className="group block cursor-pointer rounded-2xl border-2 border-dashed border-black/15 bg-light/50 p-6 text-center transition-colors hover:border-primary/40"
      >
        <input
          id={`comprobante-${ordenId}`}
          type="file"
          accept=".jpg,.jpeg,.png,image/jpeg,image/png"
          onChange={handleFileChange}
          className="hidden"
        />
        <div className="flex justify-center">
          <Camera className="h-10 w-10 text-primary" />
        </div>
        <p className="mt-2 font-semibold text-dark/80">{file ? file.name : 'Seleccionar archivo'}</p>
        <p className="mt-1 text-xs text-dark/50">JPG o PNG, maximo 5MB</p>
      </label>

      {preview && (
        <img src={preview} alt="Vista previa" className="mt-3 h-40 w-full rounded-xl border border-black/10 bg-white object-contain" />
      )}

      {error && <p className="mt-3 rounded-lg bg-red-50 px-3 py-2 text-sm text-red-700">{error}</p>}
      {success && <p className="mt-3 rounded-lg bg-green-50 px-3 py-2 text-sm text-green-700">{success}</p>}

      <button
        type="submit"
        disabled={isSubmitting}
        className="mt-4 w-full rounded-xl bg-primary px-4 py-3 text-xl font-bold text-white shadow-md transition hover:bg-primary-dark disabled:bg-gray"
      >
        {isSubmitting ? 'Enviando...' : 'Enviar Pago'}
      </button>
    </form>
  );
};
