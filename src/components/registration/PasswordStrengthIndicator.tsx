
interface PasswordStrengthIndicatorProps {
  strength: 'weak' | 'medium' | 'strong';
}

export function PasswordStrengthIndicator({ strength }: PasswordStrengthIndicatorProps) {
  return (
    <div className="mt-1">
      <div className="flex gap-1 h-1">
        <div className={`flex-1 rounded-full ${
          strength === 'weak' ? 'bg-red-500' : 
          strength === 'medium' ? 'bg-yellow-500' : 'bg-green-500'
        }`}></div>
        <div className={`flex-1 rounded-full ${
          strength === 'weak' ? 'bg-gray-200' : 
          strength === 'medium' ? 'bg-yellow-500' : 'bg-green-500'
        }`}></div>
        <div className={`flex-1 rounded-full ${
          strength === 'strong' ? 'bg-green-500' : 'bg-gray-200'
        }`}></div>
      </div>
      <p className="text-xs mt-1 text-muted-foreground">
        {strength === 'weak' ? 'Mot de passe faible' : 
         strength === 'medium' ? 'Mot de passe moyen' : 'Mot de passe fort'}
      </p>
    </div>
  );
}
