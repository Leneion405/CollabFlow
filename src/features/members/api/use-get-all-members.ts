import { useEffect, useState } from "react";

export function useGetAllMembers() {
  const [data, setData] = useState<{ documents: any[] } | null>(null);
  const [error, setError] = useState(false);

  useEffect(() => {
    const fetchAll = async () => {
      try {
        const res = await fetch("/api/users");
        const json = await res.json();
        setData({ documents: json.users }); // Match structure
      } catch (err) {
        console.error("Error fetching users", err);
        setError(true);
      }
    };

    fetchAll();
  }, []);

  return {
    data,
    isLoading: !data && !error,
    isError: error,
  };
}
