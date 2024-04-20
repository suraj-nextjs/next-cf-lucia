import { validateRequest } from "@/auth";
import { CardWrapper } from "@/components/auth/card-wrapper";
import { LogoutButton } from "@/components/auth/log-out-button";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { LOGIN_PATH } from "@/routes";
import { redirect } from "next/navigation";

export default async function Profile() {
  const { user } = await validateRequest();
  if (!user) {
    return redirect(LOGIN_PATH);
  }

  return (
    <div className="flex h-full flex-col items-center justify-center">
      <Card className="w-[350px]">
        <CardHeader>
          <CardTitle>Profile</CardTitle>
          <CardDescription>Profile Details</CardDescription>
        </CardHeader>
        <CardContent>
          <h1>Hi, {user?.username}!</h1>
          <p>Your user ID is {user.id}.</p>
        </CardContent>
        <CardFooter>
          <LogoutButton>
            <Button>Sign out</Button>
          </LogoutButton>
        </CardFooter>
      </Card>
    </div>
  );
}
