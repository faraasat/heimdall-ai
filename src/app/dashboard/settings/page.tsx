import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";

export default async function SettingsPage() {
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

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="mb-6">
        <h1 className="text-3xl font-bold text-white">Settings</h1>
        <p className="text-gray-400">Profile and preferences</p>
      </div>

      <div className="grid md:grid-cols-2 gap-6">
        <Card className="bg-gray-900/50 border-gray-800 backdrop-blur-sm">
          <CardHeader>
            <CardTitle className="text-white">Profile</CardTitle>
            <CardDescription className="text-gray-400">Your account details</CardDescription>
          </CardHeader>
          <CardContent className="space-y-2 text-gray-300">
            <div>
              <div className="text-xs text-gray-500">Email</div>
              <div className="text-white">{profile?.email || user.email}</div>
            </div>
            <div>
              <div className="text-xs text-gray-500">Full name</div>
              <div className="text-white">{profile?.full_name || "—"}</div>
            </div>
            <div>
              <div className="text-xs text-gray-500">Organization</div>
              <div className="text-white">{profile?.organization || "—"}</div>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-gray-900/50 border-gray-800 backdrop-blur-sm">
          <CardHeader>
            <CardTitle className="text-white">Preferences</CardTitle>
            <CardDescription className="text-gray-400">Notification and timezone defaults</CardDescription>
          </CardHeader>
          <CardContent className="space-y-2 text-gray-300">
            <div>
              <div className="text-xs text-gray-500">Timezone</div>
              <div className="text-white">{profile?.preferences?.timezone || "UTC"}</div>
            </div>
            <div>
              <div className="text-xs text-gray-500">Notifications</div>
              <div className="text-white">
                {profile?.preferences?.notifications === false ? "Disabled" : "Enabled"}
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
