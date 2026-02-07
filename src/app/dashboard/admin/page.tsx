import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";

export default async function AdminPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/login");
  }

  const { data: profile } = await supabase
    .from("users")
    .select("*")
    .eq("id", user.id)
    .single();

  if (profile?.role !== "admin") {
    return (
      <div className="container mx-auto px-4 py-8">
        <Card className="bg-gray-900/50 border-gray-800 backdrop-blur-sm">
          <CardHeader>
            <CardTitle className="text-white">Admin</CardTitle>
            <CardDescription className="text-gray-400">Access denied</CardDescription>
          </CardHeader>
          <CardContent className="text-gray-300">
            Your account does not have admin access.
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="mb-6">
        <h1 className="text-3xl font-bold text-white">Admin</h1>
        <p className="text-gray-400">System overview (MVP)</p>
      </div>

      <Card className="bg-gray-900/50 border-gray-800 backdrop-blur-sm">
        <CardHeader>
          <CardTitle className="text-white">Admin Tools</CardTitle>
          <CardDescription className="text-gray-400">
            Role is stored in the users table. RLS still limits data access.
          </CardDescription>
        </CardHeader>
        <CardContent className="text-gray-300">
          You are an admin. Add service-role backed actions if you need cross-user visibility.
        </CardContent>
      </Card>
    </div>
  );
}
