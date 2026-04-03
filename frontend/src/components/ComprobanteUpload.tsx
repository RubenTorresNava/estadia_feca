import { useState } from 'react';

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
    <form onSubmit={handleSubmit} className="bg-white rounded-lg shadow-lg p-6 w-full max-w-md mx-auto mt-8">
      <h2 className="text-xl font-bold text-dark mb-4">Subir comprobante de pago</h2>
      <div className="mb-4">
        <input type="file" accept=".jpg,.jpeg,.png,image/jpeg,image/png" onChange={handleFileChange} className="block w-full" />
        {preview && (
          <img src={preview} alt="Vista previa" className="mt-4 h-40 object-contain mx-auto rounded-md border" />
        )}
      </div>
      {error && <p className="text-red-500 text-sm mb-2">{error}</p>}
      {success && <p className="text-green-600 text-sm mb-2">{success}</p>}
      <button
        type="submit"
        disabled={isSubmitting}
        className="w-full px-4 py-2 bg-primary text-white rounded-lg hover:bg-primary-dark disabled:bg-gray"
      >
        {isSubmitting ? 'Subiendo...' : 'Subir comprobante'}
      </button>
    </form>
  );
};
