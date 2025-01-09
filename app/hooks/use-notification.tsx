import { useSearchParams } from "@remix-run/react";
import { useEffect } from "react";
import { toast } from "react-toastify";

export default function useNotifications() {
  const [params, setParams] = useSearchParams();
  useEffect(() => {
    const err = params.get("error");
    if (err) {
      toast.error(err);
      params.delete("error");
      setParams([...params.entries()]);
    }
    const success = params.get("success");
    if (success) {
      toast.success(success);
      params.delete("success");
      setParams([...params.entries()]);
    }
  }, [params]);

  return null;
}
