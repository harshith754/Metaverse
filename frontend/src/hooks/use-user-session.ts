import { useEffect } from 'react';
import { useRouter } from '@tanstack/react-router';

interface UseUserSessionProps {
  setName: (name: string) => void;
}

export const useUserSession = ({ setName }: UseUserSessionProps) => {
  const router = useRouter();

  useEffect(() => {
    const storedCredentials = sessionStorage.getItem("userCredentials");
    if (storedCredentials) {
      const { name } = JSON.parse(storedCredentials);
      setName(name);
    } else {
      router.navigate({ to: "/login" });
    }
  }, [router, setName]);
};
