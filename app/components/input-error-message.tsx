export function InputErrorMessage({ error }: { error?: string }) {
    if (!error) return null;
    return (
      <div className="text-red-600 text-sm mt-1" role="alert">
        {error}
      </div>
    );
  }
