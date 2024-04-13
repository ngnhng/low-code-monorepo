import { observer } from "mobx-react-lite";
import { FC } from "react";
import { useMobxStore } from "../../../../lib/mobx/store-provider";
import { AuthService } from "../../../../services/auth.service";
import { GoogleSignInButton } from "./google-sign-in-button";
import { toast } from "sonner";

const authService = new AuthService();

type Props = {
    handleSignInRedirection: () => Promise<void>;
    type: "sign_in" | "sign_up";
};

export const OAuthOptions: FC<Props> = observer((props) => {
    const { handleSignInRedirection, type } = props;

    const {
        appConfig: { envConfig },
    } = useMobxStore();

    const handleGoogleSignIn = async ({ clientId, credential }: any) => {
        try {
            if (clientId && credential) {
                const socialAuthPayload = {
                    medium: "google",
                    credential,
                    clientId,
                };
                const response =
                    await authService.socialAuth(socialAuthPayload);

                if (response) handleSignInRedirection();
            } else throw new Error("Cant find credentials");
        } catch (error: any) {
            toast.error(error.message);
        }
    };

    return (
        <div>
            <h2 className="text-2xl font-bold mb-4">Or sign in with:</h2>
            {envConfig?.google_oauth.client_id && (
                <div className="flex gap-4">
                    <GoogleSignInButton
                        clientId={envConfig?.google_oauth.client_id}
                        handleSignIn={handleGoogleSignIn}
                        type={type}
                    />
                </div>
            )}
        </div>
    );
});
