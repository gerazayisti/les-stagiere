import { useState } from "react";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Upload, FileText, CheckCircle, AlertCircle } from "lucide-react";
import { Progress } from "@/components/ui/progress";

interface CVAnalysis {
  score: number;
  recommendations: string[];
  keySkills: string[];
  missingSkills: string[];
  marketFit: string;
}

export function CVAnalyzer() {
  const [file, setFile] = useState<File | null>(null);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [analysis, setAnalysis] = useState<CVAnalysis | null>(null);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setFile(e.target.files[0]);
    }
  };

  const analyzeCV = async () => {
    if (!file) return;

    setIsAnalyzing(true);
    // Simulation d'analyse IA (à remplacer par l'appel API réel)
    setTimeout(() => {
      setAnalysis({
        score: 85,
        recommendations: [
          "Ajouter plus de détails sur vos projets personnels",
          "Mettre en avant vos certifications",
          "Quantifier vos réalisations avec des métriques"
        ],
        keySkills: ["React", "TypeScript", "Node.js", "Python"],
        missingSkills: ["Docker", "AWS", "GraphQL"],
        marketFit: "Votre profil correspond bien aux offres de stage en développement web"
      });
      setIsAnalyzing(false);
    }, 2000);
  };

  return (
    <div className="space-y-6">
      <Card className="p-6">
        <h2 className="text-xl font-semibold mb-4">Analyse de CV par IA</h2>
        
        {!file ? (
          <div className="border-2 border-dashed border-gray-300 rounded-lg p-8 text-center">
            <input
              type="file"
              accept=".pdf,.doc,.docx"
              onChange={handleFileChange}
              className="hidden"
              id="cv-upload"
            />
            <label
              htmlFor="cv-upload"
              className="cursor-pointer flex flex-col items-center"
            >
              <Upload className="h-12 w-12 text-gray-400 mb-4" />
              <span className="text-gray-600">
                Déposez votre CV ici ou cliquez pour sélectionner
              </span>
              <span className="text-sm text-gray-500 mt-2">
                PDF, DOC, DOCX (Max 5MB)
              </span>
            </label>
          </div>
        ) : (
          <div className="space-y-4">
            <div className="flex items-center gap-4">
              <FileText className="h-8 w-8 text-primary" />
              <div>
                <p className="font-medium">{file.name}</p>
                <p className="text-sm text-gray-500">
                  {(file.size / 1024 / 1024).toFixed(2)} MB
                </p>
              </div>
            </div>
            
            <Button
              onClick={analyzeCV}
              disabled={isAnalyzing}
              className="w-full"
            >
              {isAnalyzing ? "Analyse en cours..." : "Analyser le CV"}
            </Button>

            {isAnalyzing && (
              <div className="space-y-2">
                <Progress value={45} />
                <p className="text-sm text-center text-gray-500">
                  Notre IA analyse votre CV...
                </p>
              </div>
            )}
          </div>
        )}
      </Card>

      {analysis && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="space-y-6"
        >
          <Card className="p-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold">Score global</h3>
              <span className="text-2xl font-bold text-primary">
                {analysis.score}/100
              </span>
            </div>
            <Progress value={analysis.score} className="h-2" />
          </Card>

          <Card className="p-6">
            <h3 className="text-lg font-semibold mb-4">Recommandations</h3>
            <ul className="space-y-3">
              {analysis.recommendations.map((rec, index) => (
                <li key={index} className="flex items-start gap-2">
                  <AlertCircle className="h-5 w-5 text-yellow-500 flex-shrink-0 mt-0.5" />
                  <span>{rec}</span>
                </li>
              ))}
            </ul>
          </Card>

          <div className="grid md:grid-cols-2 gap-6">
            <Card className="p-6">
              <h3 className="text-lg font-semibold mb-4">Compétences clés</h3>
              <div className="flex flex-wrap gap-2">
                {analysis.keySkills.map((skill) => (
                  <span
                    key={skill}
                    className="px-3 py-1 bg-green-100 text-green-800 rounded-full text-sm"
                  >
                    {skill}
                  </span>
                ))}
              </div>
            </Card>

            <Card className="p-6">
              <h3 className="text-lg font-semibold mb-4">Compétences à développer</h3>
              <div className="flex flex-wrap gap-2">
                {analysis.missingSkills.map((skill) => (
                  <span
                    key={skill}
                    className="px-3 py-1 bg-red-100 text-red-800 rounded-full text-sm"
                  >
                    {skill}
                  </span>
                ))}
              </div>
            </Card>
          </div>

          <Card className="p-6">
            <h3 className="text-lg font-semibold mb-4">Adéquation marché</h3>
            <p className="text-gray-700">{analysis.marketFit}</p>
          </Card>
        </motion.div>
      )}
    </div>
  );
}
