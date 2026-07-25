import { Clerk } from "@clerk/clerk-js";
import { ui } from "@clerk/ui";

const clerk = new Clerk(import.meta.env.VITE_CLERK_PUBLISHABLE_KEY);

await clerk.load({ ui });

clerk.mountSignUp(
    document.getElementById("clerk-sign-up"),
    {
        appearance: {

            layout:{
                socialButtonsPlacement:"bottom"
            },

            variables:{
                colorPrimary:"#ff4040",
                colorBackground:"#181818",
                colorText:"#ffffff",
                colorInputBackground:"#111111",
                colorInputText:"#ffffff",
                borderRadius:"0px"
            }

        }
    }
);