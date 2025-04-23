import React from 'react';
import { cn } from '@/lib/utils';

interface FormattedTextProps {
  text: string;
  className?: string;
  highlightKeywords?: boolean;
}

/**
 * Composant qui formate automatiquement le texte brut en HTML structuré
 * - Détecte et formate les paragraphes
 * - Détecte et formate les listes (avec tirets, astérisques ou numéros)
 * - Met en évidence les mots-clés importants (optionnel)
 */
export const FormattedText: React.FC<FormattedTextProps> = ({
  text,
  className,
  highlightKeywords = true,
}) => {
  if (!text) return null;

  // Fonction pour mettre en évidence les mots-clés importants
  const highlightText = (text: string): string => {
    if (!highlightKeywords) return text;

    // Liste de mots-clés importants dans le contexte des stages
    const keywords = [
      'expérience', 'compétences', 'requis', 'obligatoire', 'impératif',
      'souhaité', 'apprécié', 'idéalement', 'formation', 'diplôme',
      'bac', 'master', 'licence', 'ingénieur', 'développeur', 'stage',
      'alternance', 'rémunération', 'salaire', 'gratification',
      'télétravail', 'remote', 'présentiel', 'hybride',
      'temps plein', 'temps partiel', 'CDI', 'CDD', 'mission'
    ];

    // Créer une expression régulière pour tous les mots-clés
    const regex = new RegExp(`\\b(${keywords.join('|')})\\b`, 'gi');
    
    // Remplacer les mots-clés par des spans avec une classe spéciale
    return text.replace(regex, '<span class="text-primary font-medium">$1</span>');
  };

  // Traiter le texte pour détecter les différents formats
  const processText = () => {
    // Diviser le texte en paragraphes
    const paragraphs = text.split(/\n\s*\n/);
    
    return paragraphs.map((paragraph, index) => {
      // Vérifier si le paragraphe est une liste
      if (paragraph.trim().match(/^[-*•]\s+/m)) {
        // C'est une liste à puces
        const items = paragraph.split(/\n/).filter(item => item.trim());
        return (
          <ul key={index} className="list-disc list-outside ml-5 my-3">
            {items.map((item, itemIndex) => (
              <li 
                key={itemIndex} 
                className="mb-1"
                dangerouslySetInnerHTML={{ 
                  __html: highlightText(item.replace(/^[-*•]\s+/, '').trim()) 
                }} 
              />
            ))}
          </ul>
        );
      } else if (paragraph.trim().match(/^\d+[.)]\s+/m)) {
        // C'est une liste numérotée
        const items = paragraph.split(/\n/).filter(item => item.trim());
        return (
          <ol key={index} className="list-decimal list-outside ml-5 my-3">
            {items.map((item, itemIndex) => (
              <li 
                key={itemIndex} 
                className="mb-1"
                dangerouslySetInnerHTML={{ 
                  __html: highlightText(item.replace(/^\d+[.)]\s+/, '').trim()) 
                }} 
              />
            ))}
          </ol>
        );
      } else {
        // C'est un paragraphe normal
        return (
          <p 
            key={index} 
            className="mb-4"
            dangerouslySetInnerHTML={{ __html: highlightText(paragraph) }} 
          />
        );
      }
    });
  };

  return (
    <div className={cn("text-gray-700 leading-relaxed", className)}>
      {processText()}
    </div>
  );
};

export default FormattedText;
