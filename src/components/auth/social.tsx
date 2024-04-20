import { FcGoogle } from "react-icons/fc";
import { FaGithub } from "react-icons/fa";
import { Button } from "@/components/ui/button";

export const Social = () => {
  const onGithubClick = async () => {
    try {
      const response = await fetch("/api/login/github", {
        method: "GET",
      });
      const data = await response.json();
      window.location.href = data as string;
    } catch (e) {
      console.log(e);
    }
  };

  return (
    <div className="flex items-center w-full gap-x-2">
      <Button size="lg" className="w-full" variant="outline">
        <FcGoogle className="h-5 w-5" />
      </Button>

      <Button
        size="lg"
        className="w-full"
        variant="outline"
        onClick={onGithubClick}
      >
        <FaGithub className="h-5 w-5" />
      </Button>
    </div>
  );
};
