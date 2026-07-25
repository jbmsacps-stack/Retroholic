import { Clerk } from "@clerk/clerk-js";
import { ui } from "@clerk/ui";

const clerk = new Clerk(import.meta.env.VITE_CLERK_PUBLISHABLE_KEY);

await clerk.load({ ui });

clerk.mountSignIn(
    document.getElementById("clerk-sign-in"),
    {
        appearance: {

            layout: {
                socialButtonsPlacement: "top",
                socialButtonsVariant: "block"
            },

            variables: {

                colorPrimary: "#ff4040",
                colorBackground: "transparent",
                colorText: "#ffffff",
                colorInputBackground: "#1a1a1a",
                colorInputText: "#ffffff",
                borderRadius: "0px"

            },

            elements: {

                rootBox: {
                    width: "100%"
                },

                card: {
                    background: "transparent",
                    border: "none",
                    boxShadow: "none",
                    padding: "0"
                },

                footer: {
                    background: "transparent"
                }

            }

        }

    }
);

const { data } = await supabase
    .from("profiles")
    .select("id")
    .eq("clerk_id", clerk.user.id)
    .maybeSingle();

if (data) {

    window.location.href = "/profile.html";

} else {

    window.location.href = "/profile-setup.html";

}