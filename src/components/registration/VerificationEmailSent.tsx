
import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";
import { Mail, Loader2 } from "lucide-react";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

interface VerificationEmailSentProps {
  email: string;
  loading: boolean;
  onResendEmail: () => Promise<void>;
}

export function VerificationEmailSent({ 
  email, 
  loading, 
  onResendEmail 
}: VerificationEmailSentProps) {
  return (
    <Card className="w-full max-w-md shadow-lg">
      <CardHeader className="space-y-1">
        <CardTitle className="text-2xl font-bold text-center">
          Vérifiez votre email
        </CardTitle>
        <CardDescription className="text-center">
          Un email de confirmation a été envoyé à {email}
        </CardDescription>
      </CardHeader>
      
      <CardContent className="flex flex-col items-center space-y-4 py-6">
        <Mail className="h-16 w-16 text-primary" />
        <p className="text-center text-muted-foreground">
          Cliquez sur le lien dans l'email pour activer votre compte. Si vous ne recevez pas l'email, vérifiez votre dossier spam.
        </p>
      </CardContent>
      
      <CardFooter className="flex flex-col space-y-4">
        <Button 
          variant="outline" 
          className="w-full" 
          onClick={onResendEmail}
          disabled={loading}
        >
          {loading ? (
            <>
              <Loader2 className="h-4 w-4 mr-2 animate-spin" />
              Envoi en cours...
            </>
          ) : (
            "Renvoyer l'email"
          )}
        </Button>
        <div className="text-sm text-center">
          <Link to="/connexion" className="text-primary hover:underline">
            Retour à la connexion
          </Link>
        </div>
      </CardFooter>
    </Card>
  );
}
